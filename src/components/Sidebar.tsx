import React from 'react';
import { 
  Flame, 
  Folder, 
  ChevronRight, 
  MessageCircle, 
  Send, 
  Sparkles, 
  CheckCircle2,
  Bookmark
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

  // Extract top trending vacancies (by clicks or latest)
  const trendingVacancies = React.useMemo(() => {
    return [...allVacancies]
      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 7);
  }, [allVacancies]);

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
      {/* 1. Trending Updates Widget */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <h3 
            className="font-bold text-slate-900 flex items-center gap-2"
            style={{ fontSize: '11.5pt', fontWeight: 'bold' }}
          >
            <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span>{isHi ? 'लोकप्रिय सरकारी भर्ती व ट्रेंडिंग' : 'Popular & Trending Vacancies'}</span>
          </h3>
          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
            {isHi ? 'ट्रेंडिंग 2026' : 'Trending'}
          </span>
        </div>

        <div className="space-y-2.5">
          {trendingVacancies.map((item, index) => {
            const titleText = isHi ? (item.titleHi || item.title) : item.title;
            return (
              <div
                key={item.id}
                onClick={() => onSelectVacancy(item)}
                className="group p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition cursor-pointer flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-amber-600 group-hover:text-white text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 transition mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-bold text-slate-800 group-hover:text-amber-700 line-clamp-2 transition leading-tight"
                    style={{ fontSize: '10pt' }}
                  >
                    {titleText}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                    <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-semibold">
                      {item.organization}
                    </span>
                    {item.totalPosts && (
                      <span className="text-emerald-700 font-bold">
                        {item.totalPosts} पद
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Category Directory Widget */}
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
