import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConversationList({ conversations = [], onSelect, selectedId }) {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('chat.conversations.title')}</h2>
      <ul>
        {conversations.map((c) => (
          <li
            key={c.conversationId}
            onClick={() => onSelect(c)}
            className={`p-3 rounded mb-2 cursor-pointer ${selectedId === c.conversationId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="font-medium">{c.conversationDisplayName || t('common.notAvailable')}</div>
            <div className="text-sm text-gray-600">{c.lastMessageSnippet}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
