import React from 'react';
import { 
  Folder, 
  ExternalLink, 
  ChevronRight, 
  MessageCircle, 
  Send, 
  Share2, 
  Building2, 
  Calculator,
  UserCheck
} from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';

interface SidebarProps {
  lang: LanguageMode;
  allVacancies: VacancyItem[];
  onSelectVacancy: (item: VacancyItem) => void;
  onSelectCategory: (category: CategoryType) => void;
  onOpenSaved: () => void;
  onOpenEligibility: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  allVacancies,
  onSelectVacancy,
  onSelectCategory,
  onOpenSaved,
  onOpenEligibility,
}) => {
  const isHi = lang === 'hi';

  // Extract top schemes
  const schemeVacancies = React.useMemo(() => {
    return allVacancies.filter(
      (v) => v.category === 'scheme' || v.organization === 'Sarkari Yojana' || v.titleHi?.includes('योजना')
    ).slice(0, 4);
  }, [allVacancies]);

  const categoryList: { key: CategoryType; labelHi: string; labelEn: string; icon: string }[] = [
    { key: 'latest_job', labelHi: 'सरकारी नौकरियां (Latest Jobs)', labelEn: 'Latest Jobs', icon: '💼' },
    { key: 'admit_card', labelHi: 'प्रवेश पत्र (Admit Card)', labelEn: 'Admit Card', icon: '🎟️' },
    { key: 'result', labelHi: 'परीक्षा परिणाम (Results)', labelEn: 'Results', icon: '🏆' },
    { key: 'answer_key', labelHi: 'उत्तर कुंजी (Answer Key)', labelEn: 'Answer Key', icon: '🔑' },
    { key: 'scheme', labelHi: 'सरकारी योजनाएं (Sarkari Yojana)', labelEn: 'Yojana', icon: '🏛️' },
    { key: 'exam_date', labelHi: 'परीक्षा तिथियां (Exam Dates)', labelEn: 'Exam Dates', icon: '📅' },
    { key: 'syllabus', labelHi: 'पाठ्यक्रम (Syllabus)', labelEn: 'Syllabus', icon: '📚' },
  ];

  return (
    <aside 
      className="w-full space-y-5"
      style={{
        fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. Official WhatsApp & Telegram Joining Banner Widget */}
      <div className="bg-linear-to-br from-emerald-800 via-emerald-900 to-slate-900 rounded-2xl p-4 text-white shadow-md border border-emerald-700/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              ⚡ 1,85,000+ छात्र जुड़े हैं
            </span>
            <h3 
              className="font-black text-amber-300 mt-1 leading-snug"
              style={{ fontSize: '11.5pt', fontWeight: 'bold' }}
            >
              {isHi ? 'राजस्थान भर्ती अलर्ट सीधे व्हाट्सएप पर पाएं' : 'Get Govt Job Alerts Directly on WhatsApp'}
            </h3>
          </div>
        </div>

        <p className="text-slate-200 text-xs mb-3.5 leading-relaxed font-medium">
          {isHi
            ? 'भर्ती फॉर्म, एडमिट कार्ड, परीक्षा तिथि व रिजल्ट की ताज़ा सूचनाएं बिना किसी देरी के सीधे अपने फोन पर प्राप्त करें।'
            : 'Get instant job alerts, admit cards, exam dates, and result updates directly on your smartphone.'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-xl font-bold text-xs transition shadow-xs active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isHi ? 'WhatsApp ग्रुप' : 'WhatsApp'}</span>
          </a>
          <a
            href="https://t.me/newrajsthanjobs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white py-2 px-3 rounded-xl font-bold text-xs transition shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{isHi ? 'Telegram चैनल' : 'Telegram'}</span>
          </a>
        </div>
      </div>

      {/* 2. Category Directory Widget */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <h3 
            className="font-bold text-slate-900 flex items-center gap-2"
            style={{ fontSize: '11.5pt', fontWeight: 'bold' }}
          >
            <Folder className="w-4 h-4 text-amber-600" />
            <span>{isHi ? 'मुख्य श्रेणियां (Category Directory)' : 'Category Directory'}</span>
          </h3>
        </div>

        <div className="space-y-1.5">
          {categoryList.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between transition cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{cat.icon}</span>
                <span className="font-bold text-slate-800">{isHi ? cat.labelHi : cat.labelEn}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Yojana Spotlight Widget */}
      {schemeVacancies.length > 0 && (
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2.5 mb-3">
            <h3 
              className="font-bold text-amber-950 flex items-center gap-1.5"
              style={{ fontSize: '11.5pt', fontWeight: 'bold' }}
            >
              <span>🏛️</span>
              <span>{isHi ? 'राजस्थान योजना हाइलाइट्स 2026' : 'Yojana Highlights'}</span>
            </h3>
            <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md">
              {isHi ? 'सरकारी योजना' : 'Yojana'}
            </span>
          </div>

          <div className="space-y-2">
            {schemeVacancies.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectVacancy(item)}
                className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
              >
                <div>
                  <h4 
                    className="font-bold text-slate-900 line-clamp-1 hover:text-amber-700 transition"
                    style={{ fontSize: '10pt' }}
                  >
                    {isHi ? (item.titleHi || item.title) : item.title}
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    {item.updatedAt || 'सक्रिय आवेदन जारी'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
