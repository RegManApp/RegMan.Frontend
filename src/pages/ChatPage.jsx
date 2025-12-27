import { useEffect, useState, useCallback } from 'react';
import { chatApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { startConnection, stopConnection, onReceiveMessage, offReceiveMessage, sendMessage as hubSend } from '../api/signalrClient';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { EmptyState, Loading, Button } from '../components/common';
import { useTranslation } from 'react-i18next';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoadError(false);
      setIsLoading(true);
      const res = await chatApi.getConversations();
      setConversations(res.data?.conversations || []);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let handler = (message) => {
      // message is a ViewMessageDTO (senderId, content, etc.)
      try {
        // If the incoming message belongs to the open conversation, refresh it
        if (selectedConvo && message.conversationId === selectedConvo.conversationId) {
          // trigger child to reload - we will rely on ChatWindow exposing an API via key change
          setSelectedConvo((s) => ({ ...s, _reload: (s?._reload || 0) + 1 }));
        }
        // Always refresh conversation list to update snippets
        loadConversations();
      } catch (err) {
        console.error(err);
      }
    };

    startConnection().then(() => onReceiveMessage(handler)).catch(() => {});

    return () => {
      try {
        offReceiveMessage(handler);
        stopConnection();
      } catch (e) {}
    };
  }, [selectedConvo, loadConversations]);

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <ConversationList
          conversations={conversations}
          onSelect={(c) => setSelectedConvo(c)}
          selectedId={selectedConvo?.conversationId}
        />
      </div>
      <div className="w-2/3">
        {isLoading ? (
          <div className="p-6">
            <Loading text={t('chat.loadingConversations')} />
          </div>
        ) : loadError ? (
          <div className="p-6">
            <EmptyState
              title={t('chat.errors.couldNotLoadTitle')}
              description={t('chat.errors.couldNotLoadDescription')}
              action={<Button onClick={loadConversations}>{t('common.retry')}</Button>}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('chat.empty.noConversationsTitle')}
              description={t('chat.empty.noConversationsDescription')}
            />
          </div>
        ) : (
          <ChatWindow
            conversation={selectedConvo}
            onSend={async (conversationId, receiverId, text) => {
              try {
                // Try via SignalR hub first
                await hubSend(receiverId, conversationId, text);
                loadConversations();
              } catch (e) {
                // Fallback to REST
                try {
                  await chatApi.sendMessage(receiverId, text, conversationId);
                  loadConversations();
                } catch (err) {
                  console.error(err);
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
