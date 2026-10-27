import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { LanguageMode } from '../types';

interface FloatingSocialButtonsProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  lang?: LanguageMode;
}

/**
 * Floating WhatsApp & Telegram Channel Buttons
 */
export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  whatsappUrl = 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e',
  telegramUrl = 'https://t.me/newrajsthanjobs',
}) => {
  return (
    <div className="fixed right-3 sm:right-5 bottom-4 z-40 flex flex-col gap-2.5 select-none pointer-events-auto">
      {/* Floating WhatsApp Green Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Channel"
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <MessageCircle className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-xs font-black tracking-tight pr-1 text-white">
          WhatsApp चैनल
        </span>
      </a>

      {/* Floating Telegram Blue Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Telegram Channel"
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0088cc] hover:bg-[#0077b3] text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Send className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
        </div>
        <span className="text-xs font-black tracking-tight pr-1 text-white">
          Telegram चैनल
        </span>
      </a>
    </div>
  );
};
