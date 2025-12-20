import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import MessageComposer from './MessageComposer';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatWindow({ conversation, onSend }) {
  const [messages, setMessages] = useState([]);
  const [convoDetail, setConvoDetail] = useState(null);
  const { user } = useAuth();

  const loadConversation = async () => {
    if (!conversation) {
      setMessages([]);
      setConvoDetail(null);
      return;
    }
    try {
      const res = await axiosInstance.get(`/chat/${conversation.conversationId}`);
      setMessages(res.data?.messages || []);
      setConvoDetail(res.data || null);
    } catch (e) {
      console.error('Failed to load conversation', e);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversation, conversation?._reload]);

  if (!conversation) {
    return <div className="h-full flex items-center justify-center">Select a conversation</div>;
  }

  // determine receiver id (one-to-one chat assumption)
  const getReceiverId = () => {
    if (!convoDetail || !convoDetail.participantIds) return '';
    const currentUserId = user?.userId || user?.id || '';
    const other = convoDetail.participantIds.find((id) => id !== currentUserId);
    return other || '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{conversation.conversationDisplayName || conversation.displayName || convoDetail?.displayName || 'Chat'}</h3>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {messages.map((m) => (
          <div key={m.messageId} className={`mb-3 ${m.senderId === (user?.userId || user?.id || '') ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.senderId === (user?.userId || user?.id || '') ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {m.content}
            </div>
            <div className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <MessageComposer
          onSend={async (text) => {
            const receiverId = getReceiverId();
            await onSend(receiverId, text);
            await loadConversation();
          }}
        />
      </div>
    </div>
  );
}
