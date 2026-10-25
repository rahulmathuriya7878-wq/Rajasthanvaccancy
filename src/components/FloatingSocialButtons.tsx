import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { LanguageMode } from '../types';

interface FloatingSocialButtonsProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  lang?: LanguageMode;
}

/**
 * Normal Light-Style Floating WhatsApp & Telegram Channel Buttons
 */
export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  whatsappUrl = 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e',
  telegramUrl = 'https://telegram.me/rajasthanvacancy_in',
}) => {
  return (
    <div className="fixed right-3 sm:right-5 bottom-4 z-40 flex flex-col gap-2 select-none pointer-events-auto">
      {/* Light Style WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Channel"
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-emerald-300/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer backdrop-blur-xs"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
        </div>
        <span className="text-xs font-extrabold tracking-tight pr-1 text-slate-800">
          WhatsApp चैनल
        </span>
      </a>

      {/* Light Style Telegram Channel Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Telegram Channel"
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-sky-300/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer backdrop-blur-xs"
      >
        <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <Send className="w-3.5 h-3.5 fill-white text-sky-500 ml-0.5" />
        </div>
        <span className="text-xs font-extrabold tracking-tight pr-1 text-slate-800">
          Telegram चैनल
        </span>
      </a>
    </div>
  );
};
