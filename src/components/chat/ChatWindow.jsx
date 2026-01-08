import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chatApi } from '../../api';
import MessageComposer from './MessageComposer';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  onMessageRead,
  offMessageRead,
  onUserTyping,
  offUserTyping,
  typingStarted,
  typingStopped,
  onMessageDeletedForMe,
  offMessageDeletedForMe,
  onMessageDeletedForEveryone,
  offMessageDeletedForEveryone,
} from '../../api/signalrClient';
import { useChatUnread } from '../../contexts/ChatUnreadContext';

export default function ChatWindow({ conversation, onSend, onlineUsers = {} }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [convoDetail, setConvoDetail] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUserIds, setTypingUserIds] = useState({});
  const { user } = useAuth();
  const { clearConversationUnread } = useChatUnread();

  const listRef = useRef(null);
  const pageSize = 20;

  const loadConversation = async () => {
    if (!conversation) {
      setMessages([]);
      setConvoDetail(null);
      setLoadError(false);
      setHasMore(true);
      return;
    }
    try {
      setLoadError(false);
      const res = await chatApi.getConversation(conversation.conversationId, 1, pageSize);
      const initial = res.data?.messages || [];
      setMessages(initial);
      setConvoDetail(res.data || null);
      setHasMore((initial || []).length >= pageSize);
    } catch (e) {
      setLoadError(true);
      setMessages([]);
    }
  };

  const oldestMessageId = useMemo(() => {
    if (!messages || messages.length === 0) return null;
    return messages.reduce((min, m) => (min == null ? m.messageId : Math.min(min, m.messageId)), null);
  }, [messages]);

  const loadMore = useCallback(async () => {
    if (!conversation?.conversationId) return;
    if (!hasMore || isLoadingMore) return;
    if (!oldestMessageId) return;

    const el = listRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;

    try {
      setIsLoadingMore(true);
      const res = await chatApi.getConversation(conversation.conversationId, 1, pageSize, oldestMessageId);
      const older = res.data?.messages || [];
      if (!older.length) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => {
        const map = new Map();
        (older || []).forEach((m) => map.set(m.messageId, m));
        (prev || []).forEach((m) => map.set(m.messageId, m));
        return Array.from(map.values()).sort((a, b) => a.messageId - b.messageId);
      });

      setHasMore(older.length >= pageSize);
    } catch (e) {
      // ignore paging failures; user can retry by scrolling
    } finally {
      setIsLoadingMore(false);

      // Keep the viewport anchored after prepending
      const el2 = listRef.current;
      if (el2) {
        const newScrollHeight = el2.scrollHeight;
        el2.scrollTop = newScrollHeight - prevScrollHeight;
      }
    }
  }, [conversation?.conversationId, hasMore, isLoadingMore, oldestMessageId]);

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

  useEffect(() => {
    const typingHandler = (evt) => {
      try {
        if (!evt || evt.conversationId !== conversation?.conversationId) return;
        const uid = evt.userId;
        if (!uid) return;
        const isTyping = !!evt.isTyping;
        setTypingUserIds((prev) => ({ ...prev, [uid]: isTyping }));
      } catch (e) {}
    };

    onUserTyping(typingHandler);
    return () => {
      offUserTyping(typingHandler);
    };
  }, [conversation?.conversationId]);

  useEffect(() => {
    const delForMe = (evt) => {
      try {
        if (!evt || evt.conversationId !== conversation?.conversationId) return;
        const mid = evt.messageId;
        if (!mid) return;
        setMessages((prev) => (prev || []).filter((m) => m.messageId !== mid));
      } catch (e) {}
    };

    const delForEveryone = (evt) => {
      try {
        if (!evt || evt.conversationId !== conversation?.conversationId) return;
        const mid = evt.messageId;
        if (!mid) return;
        setMessages((prev) =>
          (prev || []).map((m) => (m.messageId === mid ? { ...m, isDeletedForEveryone: true, content: '[deleted]' } : m))
        );
      } catch (e) {}
    };

    onMessageDeletedForMe(delForMe);
    onMessageDeletedForEveryone(delForEveryone);
    return () => {
      offMessageDeletedForMe(delForMe);
      offMessageDeletedForEveryone(delForEveryone);
    };
  }, [conversation?.conversationId]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center chat-panel">
        <div className="text-sm chat-muted-strong">{t('chat.empty.noSelectionTitle')}</div>
      </div>
    );
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
  const otherPresence = otherUserId ? onlineUsers?.[otherUserId] : null;
  const isOtherOnline = otherUserId
    ? typeof otherPresence === 'boolean'
      ? otherPresence
      : !!otherPresence?.isOnline
    : false;
  const otherLastSeenAt =
    otherUserId && otherPresence && typeof otherPresence === 'object'
      ? otherPresence.lastSeenAt
      : null;
  const isOtherTyping = otherUserId ? !!typingUserIds[otherUserId] : false;

  // Mark messages read when opening (receiver-only enforced by backend)
  useEffect(() => {
    if (!conversation?.conversationId) return;
    // Only attempt when we have loaded details (participant enforcement is server-side anyway)
    if (!convoDetail) return;
    chatApi
      .markConversationRead(conversation.conversationId)
      .then(() => {
        clearConversationUnread(conversation.conversationId);
      })
      .catch(() => {});
  }, [conversation?.conversationId, convoDetail, clearConversationUnread]);

  return (
    <div className="flex flex-col h-full chat-panel">
      <div className="p-4 border-b chat-panel-border">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOtherOnline ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={isOtherOnline ? t('chat.presence.online') : t('chat.presence.offline')}
            title={isOtherOnline ? t('chat.presence.online') : t('chat.presence.offline')}
          />
          <h3 className="text-lg font-semibold">
            {conversation.conversationDisplayName || conversation.displayName || convoDetail?.displayName || t('chat.titleFallback')}
          </h3>
        </div>
        {!isOtherOnline && otherLastSeenAt ? (
          <div className="mt-1 text-xs chat-muted">
            {t('chat.presence.lastSeen', {
              time: new Date(otherLastSeenAt).toLocaleString(),
              defaultValue: `Last seen ${new Date(otherLastSeenAt).toLocaleString()}`,
            })}
          </div>
        ) : null}
      </div>
      <div className="flex-1 p-4">
        <div ref={listRef} className="h-full overflow-auto" onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop <= 10) {
            loadMore();
          }
        }}>
        {loadError ? (
          <div className="text-sm chat-muted">{t('chat.errors.couldNotLoadDescription')}</div>
        ) : null}

        {!loadError && messages.length === 0 ? (
          <div className="text-sm chat-muted">{t('chat.empty.noMessages')}</div>
        ) : null}

        {messages.map((m) => (
          <div key={m.messageId} className={`mb-3 ${m.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
            <div
              className={
                `chat-bubble ${
                  m.senderId === currentUserId ? 'chat-bubble-sent' : 'chat-bubble-received'
                }`
              }
            >
              {m.content}
            </div>
            <div className="chat-message-meta">
              {new Date(m.timestamp).toLocaleString()}
              {m.senderId === currentUserId && m.isRead ? (
                <span className="ml-2">{t('chat.readIndicator')}</span>
              ) : null}

              {!m.isDeletedForEveryone ? (
                <span className="ml-2 inline-flex gap-2">
                  <button
                    type="button"
                    className="text-xs chat-muted hover:underline"
                    onClick={async () => {
                      try {
                        await chatApi.deleteMessageForMe(conversation.conversationId, m.messageId);
                        setMessages((prev) => (prev || []).filter((x) => x.messageId !== m.messageId));
                      } catch (e) {}
                    }}
                  >
                    {t('chat.actions.deleteForMe', { defaultValue: 'Delete for me' })}
                  </button>

                  {m.senderId === currentUserId ? (
                    <button
                      type="button"
                      className="text-xs chat-muted hover:underline"
                      onClick={async () => {
                        try {
                          const ok = window.confirm(
                            t('chat.actions.confirmDeleteForEveryone', {
                              defaultValue: 'Delete this message for everyone?',
                            })
                          );
                          if (!ok) return;
                          await chatApi.deleteMessageForEveryone(conversation.conversationId, m.messageId);
                          setMessages((prev) =>
                            (prev || []).map((x) =>
                              x.messageId === m.messageId
                                ? { ...x, isDeletedForEveryone: true, content: '[deleted]' }
                                : x
                            )
                          );
                        } catch (e) {}
                      }}
                    >
                      {t('chat.actions.deleteForEveryone', { defaultValue: 'Delete for everyone' })}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {isOtherTyping ? (
          <div className="text-xs chat-muted mt-2">{t('chat.typingIndicator', 'Typing…')}</div>
        ) : null}

        {isLoadingMore ? (
          <div className="text-xs chat-muted mt-2">{t('chat.loadingOlder', 'Loading…')}</div>
        ) : null}

        </div>
      </div>
      <div className="p-4 border-t chat-panel-border">
        <MessageComposer
          onSend={async (text) => {
            const receiverId = getReceiverId();
            await onSend(conversation.conversationId, receiverId, text);
            await loadConversation();
          }}
          onTypingStart={() => {
            if (conversation?.conversationId) typingStarted(conversation.conversationId).catch(() => {});
          }}
          onTypingStop={() => {
            if (conversation?.conversationId) typingStopped(conversation.conversationId).catch(() => {});
          }}
        />
      </div>
    </div>
  );
}
