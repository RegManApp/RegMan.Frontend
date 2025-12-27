import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MessageComposer({ onSend }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSend(text.trim());
    setText('');
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        className="flex-1 border rounded px-3 py-2 mr-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('chat.composer.placeholder')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
      />
      <button className="btn btn-primary px-4 py-2" onClick={handleSend}>
        {t('chat.composer.send')}
      </button>
    </div>
  );
}
