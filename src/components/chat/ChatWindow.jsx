import React, { useEffect, useState } from 'react';
import { chatApi } from '../../api';
import MessageComposer from './MessageComposer';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { onMessageRead, offMessageRead } from '../../api/signalrClient';

export default function ChatWindow({ conversation, onSend, onlineUsers = {} }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [convoDetail, setConvoDetail] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const { user } = useAuth();

  const loadConversation = async () => {
    if (!conversation) {
      setMessages([]);
      setConvoDetail(null);
      setLoadError(false);
      return;
    }
    try {
      setLoadError(false);
      const res = await chatApi.getConversation(conversation.conversationId);
      setMessages(res.data?.messages || []);
      setConvoDetail(res.data || null);
    } catch (e) {
      setLoadError(true);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversation, conversation?._reload]);

  useEffect(() => {
    const handler = (receipt) => {
      try {
        if (!receipt || receipt.conversationId !== conversation?.conversationId) return;
        const ids = new Set(receipt.messageIds || []);
        if (ids.size === 0) return;

        setMessages((prev) =>
          prev.map((m) =>
            ids.has(m.messageId)
              ? { ...m, isRead: true, readAt: receipt.readAt || m.readAt }
              : m
          )
        );
      } catch (e) {}
    };

    onMessageRead(handler);
    return () => {
      offMessageRead(handler);
    };
  }, [conversation?.conversationId]);

  if (!conversation) {
    return <div className="h-full flex items-center justify-center">{t('chat.empty.noSelectionTitle')}</div>;
  }

  // determine receiver id (one-to-one chat assumption)
  const getReceiverId = () => {
    if (!convoDetail || !convoDetail.participantIds) return '';
    const currentUserId = user?.userId || user?.id || '';
    const other = convoDetail.participantIds.find((id) => id !== currentUserId);
    return other || '';
  };

  const currentUserId = user?.userId || user?.id || '';
  const otherUserId = convoDetail?.participantIds?.find((id) => id !== currentUserId) || '';
  const isOtherOnline = otherUserId ? !!onlineUsers[otherUserId] : false;

  // Mark messages read when opening (receiver-only enforced by backend)
  useEffect(() => {
    if (!conversation?.conversationId) return;
    // Only attempt when we have loaded details (participant enforcement is server-side anyway)
    if (!convoDetail) return;
    chatApi.markConversationRead(conversation.conversationId).catch(() => {});
  }, [conversation?.conversationId, convoDetail]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOtherOnline ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            aria-label={isOtherOnline ? t('chat.presence.online') : t('chat.presence.offline')}
            title={isOtherOnline ? t('chat.presence.online') : t('chat.presence.offline')}
          />
          <h3 className="text-lg font-semibold">
            {conversation.conversationDisplayName || conversation.displayName || convoDetail?.displayName || t('chat.titleFallback')}
          </h3>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {loadError ? (
          <div className="text-sm text-gray-600">{t('chat.errors.couldNotLoadDescription')}</div>
        ) : null}

        {!loadError && messages.length === 0 ? (
          <div className="text-sm text-gray-600">{t('chat.empty.noMessages')}</div>
        ) : null}

        {messages.map((m) => (
          <div key={m.messageId} className={`mb-3 ${m.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.senderId === currentUserId ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {m.content}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(m.timestamp).toLocaleString()}
              {m.senderId === currentUserId && m.isRead ? (
                <span className="ml-2">{t('chat.readIndicator')}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <MessageComposer
          onSend={async (text) => {
            const receiverId = getReceiverId();
            await onSend(conversation.conversationId, receiverId, text);
            await loadConversation();
          }}
        />
      </div>
    </div>
  );
}
