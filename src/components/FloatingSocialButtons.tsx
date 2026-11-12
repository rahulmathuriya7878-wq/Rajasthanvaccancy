import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { LanguageMode } from '../types';

interface FloatingSocialButtonsProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  lang?: LanguageMode;
}

/**
 * Floating WhatsApp & Telegram Channel Buttons - Centered Floating Bar
 */
export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  whatsappUrl = 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e',
  telegramUrl = 'https://t.me/newrajsthanjobs',
}) => {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-3 sm:bottom-5 z-40 flex items-center justify-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl select-none pointer-events-auto transition-all max-w-[95vw]">
      {/* Floating WhatsApp Green Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Channel"
        className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
        </div>
        <span className="text-xs sm:text-xs font-black tracking-tight text-white">
          WhatsApp चैनल
        </span>
      </a>

      {/* Floating Telegram Blue Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Telegram Channel"
        className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0088cc] hover:bg-[#0077b3] text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white fill-white ml-0.5" />
        </div>
        <span className="text-xs sm:text-xs font-black tracking-tight text-white">
          Telegram चैनल
        </span>
      </a>
    </div>
  );
};
