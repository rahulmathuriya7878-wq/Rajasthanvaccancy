import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';
import { generateHindiShareText } from '../utils/shareUtils';

interface FloatingSocialButtonsProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  selectedVacancy?: VacancyItem | null;
  lang?: LanguageMode;
}

export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  whatsappUrl = 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e',
  telegramUrl = 'https://telegram.org',
  selectedVacancy = null,
  lang = 'hi',
}) => {
  const isHi = lang === 'hi';
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    let shareText = '';
    if (selectedVacancy) {
      const cleanId = selectedVacancy.id.replace(/^\//, '').replace(/\/$/, '');
      const websiteUrl = `${window.location.origin}/${cleanId}/`;
      shareText = generateHindiShareText(selectedVacancy, websiteUrl);
    } else {
      shareText = `🔥 *राजस्थान वैकेंसी अपडेट - सभी सरकारी भर्ती व योजना अलर्ट*\n👇👇\n${window.location.origin}/`;
    }

    const message = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed right-3 sm:right-5 bottom-16 sm:bottom-20 z-50 flex flex-col items-end gap-3 select-none pointer-events-auto">
      {/* Green Floating WhatsApp Share Post Button */}
      <button
        type="button"
        onClick={handleShareClick}
        aria-label="Share Post on WhatsApp"
        className="group flex items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer filter drop-shadow-xl"
      >
        <span className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] sm:text-xs font-black tracking-wide px-2.5 py-1 rounded-md shadow-md transition-colors flex items-center justify-center gap-1 border border-white/30">
          <span>🔥</span>
          <span>{copied ? (isHi ? 'शेयर किया!' : 'Shared!') : (isHi ? 'शेयर करें' : 'Share')}</span>
        </span>

        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12 ring-2 ring-white">
          {copied ? <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[3]" /> : <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />}
        </div>
      </button>

      {/* WhatsApp Official Channel Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Channel for Rajasthan Vacancy Alerts"
        className="rv-shake flex items-center gap-1.5 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-lg"
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg ring-2 ring-white hover:brightness-110">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.93.9 3.013.9 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.503-4.466 9.969-9.969 9.969-1.758 0-3.411-.462-4.862-1.272l-5.169 1.355 1.38-5.044c-.902-1.503-1.418-3.262-1.418-5.008 0-5.503 4.466-9.969 9.969-9.969 5.503 0 9.969 4.466 9.969 9.969zm-5.719 3.82c-.22-.11-1.303-.643-1.505-.716-.202-.073-.349-.11-.496.11s-.57.716-.699.863c-.128.147-.257.165-.477.055-.22-.11-.93-.343-1.772-1.094-.655-.584-1.098-1.306-1.226-1.526-.128-.22-.014-.339.096-.448.099-.098.22-.257.33-.385.11-.128.147-.22.22-.367.073-.147.037-.275-.018-.385s-.496-1.193-.68-1.634c-.179-.43-.36-.372-.496-.379-.128-.007-.275-.008-.422-.008s-.385.055-.587.275c-.202.22-.771.753-.771 1.836s.789 2.129.899 2.276c.11.147 1.552 2.37 3.759 3.322.525.227.935.362 1.255.464.528.168 1.009.144 1.389.088.424-.063 1.303-.533 1.487-1.047.184-.514.184-.955.129-1.047-.056-.092-.203-.147-.423-.257z"/>
          </svg>
        </div>
      </a>

      {/* Telegram Channel Floating Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Telegram Channel for Rajasthan Vacancy Alerts"
        className="rv-shake flex items-center gap-1.5 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-lg"
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-lg ring-2 ring-white hover:brightness-110">
          <svg className="w-6 h-6 fill-current translate-x-[-1px]" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .36z"/>
          </svg>
        </div>
      </a>
    </div>
  );
};
