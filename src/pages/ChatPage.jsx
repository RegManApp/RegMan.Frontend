import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { chatApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  startConnection,
  stopConnection,
  onReceiveMessage,
  offReceiveMessage,
  onMessageRead,
  offMessageRead,
  onConversationCreated,
  offConversationCreated,
  onUserPresenceChanged,
  offUserPresenceChanged,
  joinConversationGroup,
  getOnlineUsers,
  sendMessageIdempotent,
} from '../api/signalrClient';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { EmptyState, Loading, Button, SearchInput } from '../components/common';
import { useTranslation } from 'react-i18next';
import { useChatUnread } from '../contexts/ChatUnreadContext';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const { byConversationId, clearConversationUnread } = useChatUnread();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchTimerRef = useRef(null);

  const [onlineUsers, setOnlineUsers] = useState({});

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const convoIdParam = params.get('conversationId');
  const highlightParam = params.get('highlightMessageId');
  const openAnnouncementsParam = params.get('openAnnouncements');

  const targetConversationId = convoIdParam && Number.isFinite(Number(convoIdParam)) ? Number(convoIdParam) : null;
  const highlightMessageId = highlightParam && Number.isFinite(Number(highlightParam)) ? Number(highlightParam) : null;
  const openAnnouncements = openAnnouncementsParam === '1' || openAnnouncementsParam === 'true';

  const loadConversations = useCallback(async () => {
    try {
      setLoadError(false);
      setIsLoading(true);
      const res = await chatApi.getConversations();
      setConversations(res.data?.conversations || []);
    } catch (e) {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!targetConversationId) return;
    if (!conversations || conversations.length === 0) return;

    const found = conversations.find((c) => c.conversationId === targetConversationId);
    if (!found) return;

    (async () => {
      try {
        await startConnection();
        await joinConversationGroup(found.conversationId);
      } catch (e) {}

      setSelectedConvo(found);
      clearConversationUnread(found.conversationId);
    })();
  }, [targetConversationId, conversations, clearConversationUnread]);

  useEffect(() => {
    if (targetConversationId) return;
    if (!openAnnouncements) return;
    if (!conversations || conversations.length === 0) return;
    if (selectedConvo) return;

    const found = conversations.find((c) => c.conversationDisplayName === 'Announcements');
    if (!found) return;

    (async () => {
      try {
        await startConnection();
        await joinConversationGroup(found.conversationId);
      } catch (e) {}

      setSelectedConvo(found);
      clearConversationUnread(found.conversationId);
    })();
  }, [targetConversationId, openAnnouncements, conversations, selectedConvo, clearConversationUnread]);

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
      }
    };

    let convoCreatedHandler = async (conversationId) => {
      try {
        await startConnection();
        await joinConversationGroup(conversationId);
        await loadConversations();
      } catch (e) {
        // Ignore; REST refresh will still show the convo.
      }
    };

    let messageReadHandler = (receipt) => {
      try {
        // If the open conversation is affected, ask ChatWindow to reload state
        if (selectedConvo && receipt?.conversationId === selectedConvo.conversationId) {
          setSelectedConvo((s) => ({ ...s, _reload: (s?._reload || 0) + 1 }));
        }
      } catch (e) {}
    };

    let presenceHandler = (evt) => {
      try {
        const userId = evt?.userId;
        const isOnline = !!evt?.isOnline;
        const lastSeenAt = evt?.lastSeenAt || null;
        if (!userId) return;
        setOnlineUsers((prev) => ({
          ...prev,
          [userId]: { isOnline, lastSeenAt },
        }));
      } catch (e) {}
    };

    startConnection()
      .then(() => {
        onReceiveMessage(handler);
        onConversationCreated(convoCreatedHandler);
        onMessageRead(messageReadHandler);
        onUserPresenceChanged(presenceHandler);

        // Bootstrap known online users
        getOnlineUsers()
          .then((ids) => {
            const map = {};
            (ids || []).forEach((id) => {
              map[id] = { isOnline: true, lastSeenAt: null };
            });
            setOnlineUsers((prev) => ({ ...prev, ...map }));
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      try {
        offReceiveMessage(handler);
        offConversationCreated(convoCreatedHandler);
        offMessageRead(messageReadHandler);
        offUserPresenceChanged(presenceHandler);
        stopConnection();
      } catch (e) {}
    };
  }, [selectedConvo, loadConversations]);

  useEffect(() => {
    // Debounced user search
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        setSearchError(false);
        setIsSearching(true);
        const res = await chatApi.searchUsers(q);
        setSearchResults(res.data || []);
      } catch (e) {
        setSearchError(true);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
  }, [searchQuery]);

  const openConversationWithUser = useCallback(
    async (otherUserId) => {
      try {
        const res = await chatApi.getOrCreateDirectConversation(otherUserId);
        const convo = res.data;
        if (!convo?.conversationId) return;

        await startConnection();
        await joinConversationGroup(convo.conversationId);

        setSelectedConvo({
          conversationId: convo.conversationId,
          conversationDisplayName: convo.displayName,
        });

        clearConversationUnread(convo.conversationId);

        setSearchQuery('');
        setSearchResults([]);
        await loadConversations();
      } catch (e) {
        // axios interceptor already surfaces toast
      }
    },
    [loadConversations, clearConversationUnread]
  );

  return (
    <div className="flex h-full chat-panel">
      <div className="w-1/3 border-r chat-panel-border">
        <div className="p-4 border-b chat-panel-border">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => {
              setSearchQuery('');
              setSearchResults([]);
              setSearchError(false);
            }}
            placeholder={t('chat.search.placeholder')}
          />

          {searchQuery.trim() ? (
            <div className="mt-3">
              {isSearching ? (
                <div className="text-sm chat-muted">{t('chat.search.loading')}</div>
              ) : searchError ? (
                <div className="text-sm chat-muted">{t('chat.search.error')}</div>
              ) : searchResults.length === 0 ? (
                <div className="text-sm chat-muted">{t('chat.search.noResults')}</div>
              ) : (
                <ul>
                  {searchResults.map((u) => (
                    <li
                      key={u.userId}
                      onClick={() => openConversationWithUser(u.userId)}
                      className="p-2 rounded-lg mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <div className="font-medium">{u.fullName || t('common.notAvailable')}</div>
                      <div className="text-xs chat-muted">{u.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <ConversationList
          conversations={conversations}
          onSelect={async (c) => {
            setSelectedConvo(c);
            clearConversationUnread(c.conversationId);
            try {
              await startConnection();
              await joinConversationGroup(c.conversationId);
            } catch (e) {}
          }}
          selectedId={selectedConvo?.conversationId}
          unreadByConversationId={byConversationId}
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
        ) : !selectedConvo ? (
          <div className="p-6">
            <EmptyState
              title={conversations.length === 0 ? t('chat.empty.noConversationsTitle') : t('chat.empty.noSelectionTitle')}
              description={conversations.length === 0 ? t('chat.empty.noConversationsDescription') : t('chat.empty.noSelectionDescription')}
            />
          </div>
        ) : (
          <ChatWindow
            conversation={selectedConvo}
            onlineUsers={onlineUsers}
            highlightMessageId={highlightMessageId}
            onSend={async (conversationId, receiverId, text) => {
              try {
                // Try via SignalR hub first
                const clientMessageId =
                  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
                  `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                await sendMessageIdempotent(null, conversationId, text, clientMessageId);
                loadConversations();
              } catch (e) {
                // Fallback to REST
                try {
                  await chatApi.sendMessage(receiverId, text, conversationId);
                  loadConversations();
                } catch (err) {
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
