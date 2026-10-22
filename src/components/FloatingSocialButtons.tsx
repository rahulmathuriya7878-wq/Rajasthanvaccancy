import React, { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';
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
  telegramUrl = 'https://t.me/rajasthanvacancy',
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
    <div className="fixed right-3 sm:right-6 bottom-16 sm:bottom-20 z-50 flex flex-col items-end gap-3 select-none pointer-events-auto">
      {/* Primary Floating WhatsApp Join Button with Devanagari font and 14pt size */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join RajasthanVacancy WhatsApp Channel"
        className="group flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer filter drop-shadow-2xl"
      >
        {/* Label badge with Devanagari Font Face & 10pt Font Size */}
        <span 
          className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold tracking-wide px-3 py-1 rounded-full shadow-lg transition-all flex items-center gap-1.5 border-2 border-white font-devnagari-10pt"
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Yantramanav', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.3'
          }}
        >
          <span className="animate-bounce">📢</span>
          <span>Join WhatsApp</span>
        </span>

        {/* WhatsApp Icon Circle */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl ring-4 ring-white/90 hover:brightness-110 rv-whatsapp-glow transition-all">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.93.9 3.013.9 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.503-4.466 9.969-9.969 9.969-1.758 0-3.411-.462-4.862-1.272l-5.169 1.355 1.38-5.044c-.902-1.503-1.418-3.262-1.418-5.008 0-5.503 4.466-9.969 9.969-9.969 5.503 0 9.969 4.466 9.969 9.969zm-5.719 3.82c-.22-.11-1.303-.643-1.505-.716-.202-.073-.349-.11-.496.11s-.57.716-.699.863c-.128.147-.257.165-.477.055-.22-.11-.93-.343-1.772-1.094-.655-.584-1.098-1.306-1.226-1.526-.128-.22-.014-.339.096-.448.099-.098.22-.257.33-.385.11-.128.147-.22.22-.367.073-.147.037-.275-.018-.385s-.496-1.193-.68-1.634c-.179-.43-.36-.372-.496-.379-.128-.007-.275-.008-.422-.008s-.385.055-.587.275c-.202.22-.771.753-.771 1.836s.789 2.129.899 2.276c.11.147 1.552 2.37 3.759 3.322.525.227.935.362 1.255.464.528.168 1.009.144 1.389.088.424-.063 1.303-.533 1.487-1.047.184-.514.184-.955.129-1.047-.056-.092-.203-.147-.423-.257z"/>
          </svg>
        </div>
      </a>

      {/* Floating WhatsApp Share Button */}
      <button
        type="button"
        onClick={handleShareClick}
        aria-label="Share Post on WhatsApp"
        className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer filter drop-shadow-xl"
      >
        <span 
          className="bg-[#128C7E] hover:bg-[#0e6f64] text-white font-bold tracking-wide px-3 py-1 rounded-full shadow-md transition-colors flex items-center justify-center gap-1 border border-white/40 font-devnagari-14pt"
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Yantramanav', sans-serif",
            fontSize: '14pt',
            lineHeight: '1.3'
          }}
        >
          <span>🔥</span>
          <span>{copied ? (isHi ? 'शेयर किया!' : 'Shared!') : (isHi ? 'शेयर करें' : 'Share')}</span>
        </span>

        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#128C7E] hover:bg-[#0e6f64] text-white flex items-center justify-center shadow-xl transition-transform group-hover:rotate-12 ring-2 ring-white">
          {copied ? <Check className="w-5 h-5 text-white stroke-[3]" /> : <Share2 className="w-5 h-5 text-white stroke-[2.5]" />}
        </div>
      </button>
    </div>
  );
};

