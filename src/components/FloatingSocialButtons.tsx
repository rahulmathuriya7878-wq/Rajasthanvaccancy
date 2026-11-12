import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { LanguageMode } from '../types';

interface FloatingSocialButtonsProps {
  lang: LanguageMode;
  whatsappUrl?: string;
  telegramUrl?: string;
}

export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  lang,
  whatsappUrl = 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e',
  telegramUrl = 'https://t.me/newrajsthanjobs'
}) => {
  const isHi = lang === 'hi';

  return (
    <div className="fixed right-3 bottom-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* WhatsApp Button with 'Join Group' Pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex items-center gap-1.5 group transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none"
        title={isHi ? 'व्हाट्सएप ग्रुप से जुड़ें' : 'Join WhatsApp Group'}
        aria-label="Join WhatsApp Group"
      >
        <span className="bg-[#22c55e] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md tracking-wide">
          {isHi ? 'Join Group' : 'Join Group'}
        </span>
        <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20bd5a] transition">
          <MessageCircle className="w-6 h-6 fill-white" />
        </div>
      </a>

      {/* Telegram Button with 'Telegram' Pill */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex items-center gap-1.5 group transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none"
        title={isHi ? 'टेलीग्राम चैनल से जुड़ें' : 'Join Telegram Channel'}
        aria-label="Join Telegram Channel"
      >
        <span className="bg-[#0284c7] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md tracking-wide">
          Telegram
        </span>
        <div className="w-12 h-12 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-lg hover:bg-[#0077b5] transition">
          <Send className="w-5 h-5 fill-white -translate-x-0.5 translate-y-0.5" />
        </div>
      </a>
    </div>
  );
};
