'use client';

import React, { useMemo } from 'react';
import { 
  Bell,
  Trash2,
  Search
} from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';
import { AdSection } from './AdSection';
import { AdSlotWrapper } from './AdSlotWrapper';

import { compareVacanciesNewestFirst } from '../utils/dateUtils';

interface FastUpdatesGridProps {
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
  onFilterCategory?: (category: CategoryType) => void;
  isAdmin?: boolean;
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
  onDeleteVacancy,
  alertJobIds = [],
  onToggleAlertMe,
  showAds = true,
  onOpenUrlIndexation,
}) => {
  const isHi = lang === 'hi';

  // Memoize all 6 category buckets & newest-first sorting so unrelated UI updates stay instant
  const { row1Sections, row2Sections } = useMemo(() => {
    const sortByNewest = (items: VacancyItem[]) => [...items].sort(compareVacanciesNewestFirst);

    const admitCards = sortByNewest(vacancies.filter((v) =>
      v.category === 'admit_card' || v.status === 'admit_card_out'
    ));

    const results = sortByNewest(vacancies.filter((v) =>
      v.category === 'result' || v.status === 'result_declared'
    ));

    const examDates = sortByNewest(vacancies.filter((v) =>
      v.category === 'exam_date' || v.category === 'answer_key' || v.title.toLowerCase().includes('exam date') || v.titleHi?.includes('परीक्षा तिथि')
    ));

    const latestNews = sortByNewest(vacancies.filter((v) =>
      v.category === 'news' || v.title.toLowerCase().includes('news') || v.tags?.includes('news') || v.title.toLowerCase().includes('chunav') || v.title.toLowerCase().includes('apprentice') || v.id?.includes('ctet')
    ));

    const sarkariYojanas = sortByNewest(vacancies.filter((v) =>
      v.category === 'scheme' || v.organization === 'Sarkari Yojana' || v.tags?.includes('yojana')
    ));

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

    return {
      row1Sections: [
        { key: 'latest_job', title: 'Latest Jobs', titleHi: 'Latest Jobs', categoryType: 'latest_job' as CategoryType, items: latestJobs },
        { key: 'admit_card', title: 'Admit Card', titleHi: 'Admit Card', categoryType: 'admit_card' as CategoryType, items: admitCards },
        { key: 'result', title: 'Results', titleHi: 'Results', categoryType: 'result' as CategoryType, items: results },
      ],
      row2Sections: [
        { key: 'exam_date', title: 'Exam Date', titleHi: 'Exam Date', categoryType: 'exam_date' as CategoryType, items: examDates },
        { key: 'news', title: 'Latest News', titleHi: 'Latest News', categoryType: 'news' as CategoryType, items: latestNews },
        { key: 'scheme', title: 'Sarkari Yojana', titleHi: 'Sarkari Yojana', categoryType: 'scheme' as CategoryType, items: sarkariYojanas },
      ],
    };
  }, [vacancies]);

  const getYojanaBenefitSummary = (item: VacancyItem) => {
    const raw =
      item.yojanaOverview?.maxAnnualAssistance ||
      item.yojanaOverview?.monthlyAssistance ||
      item.salaryHi ||
      item.salary ||
      (typeof item.totalPosts === 'string' ? item.totalPosts : '');
    if (!raw || raw === 'विभिन्न पद') return '';
    return raw.length > 52 ? `${raw.slice(0, 50).trim()}…` : raw;
  };

  const renderSectionBox = (sec: typeof row1Sections[0]) => {
    const isYojanaBox = sec.key === 'scheme';

    return (
      <div 
        key={sec.key}
        className="job-section-card bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-sm min-w-0 max-w-full overflow-hidden"
      >
        {/* Signature Green Rounded Header */}
        <div className="job-section-card-header p-3 sm:p-3.5 pb-2">
          <h2 className="m-0">
            <a
              href={`/?category=${encodeURIComponent(sec.categoryType)}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                if (onFilterCategory) {
                  e.preventDefault();
                  onFilterCategory(sec.categoryType);
                }
              }}
              className="no-link-color block w-full text-center font-bold !text-white text-lg sm:text-xl py-2 px-3 sm:px-4 rounded-lg select-none bg-[#15803d] hover:bg-[#166534] transition-colors cursor-pointer shadow-xs no-underline tracking-wide"
              style={{ 
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '8px',
                fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                fontSize: '18px',
                lineHeight: 1.3
              }}
            >
              {sec.title}
            </a>
          </h2>
          {isYojanaBox && (
            <p className="text-[11px] font-semibold text-emerald-800 text-center mt-1.5 tracking-normal">
              {isHi
                ? 'सरकारी योजनाएं · लाभ, पात्रता, दस्तावेज व ऑनलाइन आवेदन'
                : 'Govt Schemes · Benefits, Eligibility & Online Apply'}
            </p>
          )}
        </div>

        {/* Clean List of Posts (Dates removed beneath post titles) */}
        <div className="job-section-card-body p-3 sm:p-4 pt-2 flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-3 sm:space-y-3.5 min-w-0">
            {sec.items.length > 0 ? (
              sec.items.slice(0, 100).map((item) => {
                const yojanaBenefit = isYojanaBox ? getYojanaBenefitSummary(item) : '';
                return (
                <div 
                  key={item.id} 
                  className="group min-w-0"
                >
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <a
                      href={`/?vacancy=${encodeURIComponent(item.id)}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        onSelectVacancy(item);
                      }}
                      className="text-left flex-1 min-w-0 cursor-pointer block group no-underline"
                    >
                      <h3 
                        className="post-title-link font-semibold leading-snug cursor-pointer block break-words no-underline"
                        style={{
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: '#0066cc',
                          textDecoration: 'none',
                        }}
                      >
                        {isHi ? (item.titleHi || item.title) : item.title}
                      </h3>
                      {isYojanaBox && yojanaBenefit && (
                        <div className="text-xs sm:text-[13px] text-emerald-800 mt-1 font-semibold leading-snug">
                          {isHi ? 'लाभ:' : 'Benefit:'} {yojanaBenefit}
                        </div>
                      )}
                    </a>

                    {/* Admin Actions (Delete) for logged-in Admin */}
                    {isAdmin && onDeleteVacancy && (
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVacancy(item.id);
                          }}
                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title={isHi ? 'पोस्ट डिलीट करें' : 'Delete Post'}
                          aria-label={isHi ? `${item.titleHi || item.title} पोस्ट डिलीट करें` : `Delete ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    {/* Quick Alert Bell toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleAlertMe) onToggleAlertMe(item.id);
                      }}
                      className={`p-1 rounded-md transition shrink-0 cursor-pointer ${
                        alertJobIds?.includes(item.id)
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      aria-pressed={Boolean(alertJobIds?.includes(item.id))}
                      aria-label={
                        alertJobIds?.includes(item.id)
                          ? (isHi ? `${item.titleHi || item.title} का अलर्ट हटाएं` : `Remove alert for ${item.title}`)
                          : (isHi ? `${item.titleHi || item.title} के लिए अलर्ट सेट करें` : `Set alert for ${item.title}`)
                      }
                      title={
                        alertJobIds?.includes(item.id)
                          ? (isHi ? (isYojanaBox ? 'योजना अलर्ट सक्रिय' : 'अलर्ट सक्रिय') : 'Alert Active')
                          : (isHi ? (isYojanaBox ? 'योजना अलर्ट सेट करें' : 'अलर्ट सेट करें') : 'Set Alert')
                      }
                    >
                      <Bell className={`w-3.5 h-3.5 ${alertJobIds?.includes(item.id) ? 'fill-rose-700 text-rose-700' : ''}`} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-600 text-xs">
                {isHi
                  ? (isYojanaBox ? 'जल्द ही नई सरकारी योजनाएं यहां जोड़ी जाएंगी' : 'जल्द ही नए अपडेट यहां जोड़े जाएंगे')
                  : 'New updates will be published soon'}
              </div>
            )}
          </div>

          {/* View More Link at Bottom Right */}
          <div className="text-right pt-3 mt-2 border-t border-slate-100">
            <a
              href={`/?category=${encodeURIComponent(sec.categoryType)}`}
              onClick={(e) => {
                e.preventDefault();
                if (onFilterCategory) {
                  onFilterCategory(sec.categoryType);
                } else if (sec.items.length > 0) {
                  onSelectVacancy(sec.items[0]);
                }
              }}
              aria-label={
                isYojanaBox
                  ? (isHi ? 'सभी सरकारी योजनाएं देखें' : 'View All Sarkari Yojana')
                  : (isHi ? `${sec.title} की सभी पोस्ट देखें` : `View more ${sec.title}`)
              }
              className="font-bold text-xs hover:underline cursor-pointer inline-flex items-center gap-0.5"
              style={{ color: '#b91c1c' }}
            >
              <span>{isYojanaBox ? (isHi ? 'सभी योजनाएं देखें..' : 'View All Schemes..') : 'View More..'}</span>
              <span className="sr-only"> ({sec.title})</span>
            </a>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch min-w-0">
        {row1Sections.map(renderSectionBox)}
      </div>

      {/* Center Responsive Google AdSense Ad Unit */}
      {showAds && (
        <div className="w-full my-2 flex justify-center">
          <AdSlotWrapper
            height={140}
            className="max-w-5xl"
            ariaLabel={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'}
            skeletonLabel={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'}
          >
            <AdSection 
              slot="3785509362" 
              client="ca-pub-3176571184961509" 
              label={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'} 
              minHeight={100}
              embedded
            />
          </AdSlotWrapper>
        </div>
      )}

      {/* Row 2: Exam Date, Latest News, Sarkari Yojana (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch min-w-0">
        {row2Sections.map(renderSectionBox)}
      </div>

      {/* Bottom Responsive Ad Unit */}
      {showAds && (
        <div className="w-full my-3 flex justify-center">
          <AdSlotWrapper
            height={130}
            className="max-w-5xl"
            ariaLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
            skeletonLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
          >
            <AdSection 
              slot="3785509362" 
              client="ca-pub-3176571184961509" 
              label={isHi ? 'विज्ञापन' : 'Advertisement'} 
              minHeight={90}
              embedded
            />
          </AdSlotWrapper>
        </div>
      )}
    </div>
  );
};
