import { useEffect, useState, useCallback } from 'react';
import { chatApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { startConnection, stopConnection, onReceiveMessage, offReceiveMessage, sendMessage as hubSend } from '../api/signalrClient';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data?.conversations || []);
    } catch (e) {
      console.error('Failed to load conversations', e);
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
        <ChatWindow
          conversation={selectedConvo}
          onSend={async (receiverId, text) => {
            try {
              // Try via SignalR hub first
              await hubSend(receiverId, text);
              // refresh list and conversation
              loadConversations();
            } catch (e) {
              // Fallback to REST
              try {
                await chatApi.sendMessage(receiverId, text);
                loadConversations();
              } catch (err) {
                console.error('Failed to send message', err);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
