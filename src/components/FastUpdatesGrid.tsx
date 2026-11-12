import React, { useState } from 'react';
import { 
  ChevronRight, 
  ExternalLink,
  Bell,
  Sparkles,
  Calendar,
  Edit3,
  Trash2,
  Search
} from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';
import { AdSection } from './AdSection';

import { formatDisplayDate } from '../utils/dateUtils';

interface FastUpdatesGridProps {
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
  onFilterCategory?: (category: CategoryType) => void;
  isAdmin?: boolean;
  onEditVacancy?: (item: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  alertJobIds?: string[];
  onToggleAlertMe?: (id: string) => void;
  showAds?: boolean;
  onOpenUrlIndexation?: () => void;
}

export const FastUpdatesGrid: React.FC<FastUpdatesGridProps> = ({
  vacancies,
  lang,
  onSelectVacancy,
  onFilterCategory,
  isAdmin = false,
  onEditVacancy,
  onDeleteVacancy,
  alertJobIds = [],
  onToggleAlertMe,
  showAds = true,
  onOpenUrlIndexation,
}) => {
  const isHi = lang === 'hi';

  // Sort helper to ensure newest updates always come first
  const sortByNewest = (items: VacancyItem[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || a.importantDates?.notificationDate || '';
      const dateB = b.updatedAt || b.createdAt || b.importantDates?.notificationDate || '';
      return dateB.localeCompare(dateA);
    });
  };

  // 2. Admit Card
  const admitCards = sortByNewest(vacancies.filter((v) => 
    v.category === 'admit_card' || v.status === 'admit_card_out'
  ));

  // 3. Results
  const results = sortByNewest(vacancies.filter((v) => 
    v.category === 'result' || v.status === 'result_declared'
  ));

  // 4. Exam Date
  const examDates = sortByNewest(vacancies.filter((v) => 
    v.category === 'exam_date' || v.category === 'answer_key' || v.title.toLowerCase().includes('exam date') || v.titleHi?.includes('परीक्षा तिथि')
  ));

  // 5. Latest News
  const latestNews = sortByNewest(vacancies.filter((v) => 
    v.category === 'news' || v.title.toLowerCase().includes('news') || v.tags?.includes('news') || v.title.toLowerCase().includes('chunav') || v.title.toLowerCase().includes('apprentice') || v.id?.includes('ctet')
  ));

  // 6. Sarkari Yojana
  const sarkariYojanas = sortByNewest(vacancies.filter((v) => 
    v.category === 'scheme' || v.organization === 'Sarkari Yojana' || v.tags?.includes('yojana')
  ));

  // 1. Latest Jobs (Includes all latest_job category posts & newly added job alerts)
  const latestJobs = sortByNewest(vacancies.filter((v) => {
    if (v.category === 'latest_job' || (v as any).category === 'job' || v.category === 'ugc_net' || !v.category) {
      return true;
    }
    const isAdmit = v.category === 'admit_card';
    const isResult = v.category === 'result';
    const isExamDate = v.category === 'exam_date';
    const isNews = v.category === 'news';
    const isYojana = v.category === 'scheme';
    return !(isAdmit || isResult || isExamDate || isNews || isYojana);
  }));

  // Rows configuration matching rajasthanvacancy.com:
  // Row 1: Latest Jobs, Admit Card, Results
  const row1Sections = [
    {
      key: 'latest_job',
      title: 'Latest Jobs',
      titleHi: 'Latest Jobs',
      categoryType: 'latest_job' as CategoryType,
      items: latestJobs,
    },
    {
      key: 'admit_card',
      title: 'Admit Card',
      titleHi: 'Admit Card',
      categoryType: 'admit_card' as CategoryType,
      items: admitCards,
    },
    {
      key: 'result',
      title: 'Results',
      titleHi: 'Results',
      categoryType: 'result' as CategoryType,
      items: results,
    },
  ];

  // Row 2: Exam Date, Latest News, Sarkari Yojana
  const row2Sections = [
    {
      key: 'exam_date',
      title: 'Exam Date',
      titleHi: 'Exam Date',
      categoryType: 'exam_date' as CategoryType,
      items: examDates,
    },
    {
      key: 'news',
      title: 'Latest News',
      titleHi: 'Latest News',
      categoryType: 'news' as CategoryType,
      items: latestNews,
    },
    {
      key: 'scheme',
      title: 'Sarkari Yojana',
      titleHi: 'Sarkari Yojana',
      categoryType: 'scheme' as CategoryType,
      items: sarkariYojanas,
    },
  ];

  const formatPostDate = (item: VacancyItem) => {
    const rawDate = item.updatedAt || item.createdAt || item.importantDates?.notificationDate;
    if (!rawDate) return 'November 12, 2026';
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return rawDate;
  };

  const renderSectionBox = (sec: typeof row1Sections[0]) => {
    return (
      <div 
        key={sec.key}
        className="bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-sm"
      >
        {/* Signature Green Rounded Header matching screenshot */}
        <div className="p-3.5 pb-2">
          <h2 
            onClick={() => onFilterCategory && onFilterCategory(sec.categoryType)}
            className="w-full text-center font-bold text-white text-lg sm:text-xl py-2 px-4 rounded-lg select-none bg-[#15803d] hover:bg-[#166534] transition-colors cursor-pointer shadow-xs"
            style={{ 
              backgroundColor: '#15803d', 
              borderRadius: '8px',
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
              fontSize: '18px',
              lineHeight: 1.3
            }}
          >
            {sec.title}
          </h2>
        </div>

        {/* List of Posts matching screenshot */}
        <div className="p-4 pt-2 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {sec.items.length > 0 ? (
              sec.items.slice(0, 8).map((item) => (
                <div 
                  key={item.id} 
                  className="group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectVacancy(item)}
                      className="text-left flex-1 min-w-0 cursor-pointer block group"
                    >
                      <h3 
                        className="post-title-link text-[16px] sm:text-[17px] font-semibold leading-snug cursor-pointer block"
                        style={{
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: '#0066cc',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        {isHi ? (item.titleHi || item.title) : item.title}
                      </h3>
                      <p 
                        className="text-xs sm:text-[13px] text-gray-500 mt-1 select-none font-normal"
                      >
                        {formatPostDate(item)}
                      </p>
                    </button>

                    {/* Admin Actions (Edit / Delete) for logged-in Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {onEditVacancy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditVacancy(item);
                            }}
                            className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title={isHi ? 'पोस्ट एडिट करें' : 'Edit Post'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteVacancy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVacancy(item.id);
                            }}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title={isHi ? 'पोस्ट डिलीट करें' : 'Delete Post'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Alert Bell toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleAlertMe) onToggleAlertMe(item.id);
                      }}
                      className={`p-1 rounded-md transition shrink-0 ${
                        alertJobIds?.includes(item.id)
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-slate-300 hover:text-slate-600'
                      }`}
                      title={alertJobIds?.includes(item.id) ? (isHi ? 'अलर्ट सक्रिय' : 'Alert Active') : (isHi ? 'अलर्ट सेट करें' : 'Set Alert')}
                    >
                      <Bell className={`w-3.5 h-3.5 ${alertJobIds?.includes(item.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                {isHi ? 'जल्द ही नए अपडेट यहां जोड़े जाएंगे' : 'New updates will be published soon'}
              </div>
            )}
          </div>

          {/* View More Link at Bottom Right */}
          <div className="text-right pt-3 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (onFilterCategory) {
                  onFilterCategory(sec.categoryType);
                } else if (sec.items.length > 0) {
                  onSelectVacancy(sec.items[0]);
                }
              }}
              className="font-bold text-xs hover:underline cursor-pointer inline-flex items-center gap-0.5"
              style={{ color: '#c90000' }}
            >
              <span>View More..</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Google URL Inspection & Auto-Index Banner (Admin Only) */}
      {isAdmin && onOpenUrlIndexation && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <span>Google Search Console URL Inspection & Auto-Index</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                  GSC
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isHi ? 'किसी भी पोस्ट को तुरंत Google Search Console में टेस्ट व इंडेक्स करवाएं' : 'Test live URLs and request immediate indexing in Google Search Console'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUrlIndexation}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            aria-label="Open Google URL Inspection Tool"
          >
            <Search className="w-3.5 h-3.5 text-slate-950" />
            <span>{isHi ? '🔍 URL Inspection खोलें' : '🔍 Open URL Inspection'}</span>
          </button>
        </div>
      )}

      {/* Row 1: Latest Jobs, Admit Card, Results (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {row1Sections.map(renderSectionBox)}
      </div>

      {/* Center Responsive Google AdSense Ad Unit */}
      {showAds && (
        <div className="w-full my-2 flex justify-center">
          <AdSection 
            slot="3785509362" 
            client="ca-pub-8302542447035711" 
            label={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'} 
            minHeight={100}
            className="max-w-5xl"
          />
        </div>
      )}

      {/* Row 2: Exam Date, Latest News, Sarkari Yojana (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {row2Sections.map(renderSectionBox)}
      </div>

      {/* Bottom Responsive Ad Unit */}
      {showAds && (
        <div className="w-full my-3 flex justify-center">
          <AdSection 
            slot="home-bottom-slot" 
            client="ca-pub-8302542447035711" 
            label={isHi ? 'विज्ञापन' : 'Advertisement'} 
            minHeight={90}
            className="max-w-5xl"
          />
        </div>
      )}
    </div>
  );
};
