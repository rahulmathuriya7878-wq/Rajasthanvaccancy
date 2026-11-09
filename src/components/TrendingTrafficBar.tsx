import React from 'react';
import { 
  Flame, 
  MessageCircle, 
  Send, 
  Share2, 
  BellRing,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { LanguageMode, VacancyItem } from '../types';

interface TrendingTrafficBarProps {
  lang: LanguageMode;
  onSearchKeyword: (keyword: string) => void;
  onSelectVacancyById?: (id: string) => void;
  onOpenSubscribe?: () => void;
  vacancies: VacancyItem[];
}

export const TrendingTrafficBar: React.FC<TrendingTrafficBarProps> = ({
  lang,
  onSearchKeyword,
  onSelectVacancyById,
  onOpenSubscribe,
  vacancies
}) => {
  const isHi = lang === 'hi';

  const trendingKeywords = [
    { label: 'एयरफोर्स AFCAT 01/2027', id: 'indian-air-force-recruitment-afcat-01-2027', isHot: true },
    { label: 'KVS संविदा साथी 2026', id: 'kvs-samvida-sathi-recruitment-2026', isHot: true },
    { label: 'CTET 2026 एग्जाम सेंटर', id: 'ctet-2026-exam-center-news', isHot: true },
    { label: 'JEE Main 2027', id: 'jee-main-2027-session-1', isHot: false },
    { label: 'राजस्थान CET 12th', id: 'rajasthan-cet-12th-admit-card-2026', isHot: false },
    { label: 'पशु परिचर रिजल्ट', id: 'rsmssb-pashu-parichar-result-2026', isHot: false },
    { label: 'सैनिक स्कूल चित्तौड़गढ़', id: 'sainik-school-chittorgarh-2026', isHot: false },
    { label: 'अंबेडकर DBT वाउचर', id: 'ambedkar-dbt-voucher-yojana-2026', isHot: false },
    { label: 'रेलवे ग्रुप D', id: 'railway-group-d-recruitment-2026', isHot: false }
  ];

  const handleShareWebsite = () => {
    const shareUrl = window.location.origin;
    const shareTitle = 'राजस्थान वैकेंसी 2026 - सरकारी भर्ती, एडमिट कार्ड व रिजल्ट पोर्टल';
    const shareText = `🚨 *राजस्थान व केंद्र सरकारी भर्ती पोर्टल* 🚨\n\n📢 सभी सरकारी भर्तियों के ऑनलाइन फॉर्म, एडमिट कार्ड, परीक्षा तिथियां व रिजल्ट सबसे पहले देखें।\n\n👉 अभी विजिट करें:\n${shareUrl}\n\n📲 अपने सभी दोस्तों व ग्रुप्स में जरूर शेयर करें!`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full space-y-3 mb-2">
      {/* 1. Trending Keywords Ticker Bar for Organic Search Discovery */}
      <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto shadow-2xs scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 font-extrabold text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
          <Flame className="w-3.5 h-3.5 fill-rose-600 animate-bounce" />
          <span>{isHi ? 'ट्रेंडिंग सर्च:' : 'Trending Now:'}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {trendingKeywords.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (item.id && onSelectVacancyById) {
                  const found = vacancies.find(v => v.id === item.id);
                  if (found) {
                    onSelectVacancyById(item.id);
                    return;
                  }
                }
                onSearchKeyword(item.label);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer shrink-0 border ${
                item.isHot 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={`${item.label} की जानकारी देखें`}
            >
              {item.isHot && <Sparkles className="w-3 h-3 text-amber-600" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Viral Social Traffic & Community Join Strip */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                {isHi ? 'राजस्थान व केंद्र भर्ती अलर्ट सीधे व्हाट्सएप पर पाएं' : 'Get Free Govt Job Alerts on WhatsApp'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-200 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>1,85,000+ छात्र जुड़े हैं</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
              {isHi ? 'भर्ती फॉर्म, एडमिट कार्ड, परीक्षा तिथि व रिजल्ट की ताज़ा सूचनाएं बिना किसी देरी के सीधे आपके फोन पर।' : 'Daily instant updates on recruitments, admit cards and results directly to your mobile.'}
            </p>
          </div>
        </div>

        {/* Action Buttons for Viral Traffic Conversion */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap w-full md:w-auto justify-end">
          <a
            href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-xs transition active:scale-95"
            title="WhatsApp चैनल जॉइन करें"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp ग्रुप</span>
          </a>

          <a
            href="https://t.me/newrajsthanjobs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs shadow-xs transition active:scale-95"
            title="Telegram चैनल जॉइन करें"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>

          <button
            type="button"
            onClick={handleShareWebsite}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            title="वेबसाइट दोस्तों के साथ शेयर करें"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>शेयर करें</span>
          </button>

          {onOpenSubscribe && (
            <button
              type="button"
              onClick={onOpenSubscribe}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
              title="फ्री ईमेल/ब्राउज़र अलर्ट ऑन करें"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-300" />
              <span>अलर्ट</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
