import React, { useState } from 'react';
import { 
  ChevronRight, 
  ExternalLink,
  Bell,
  Sparkles,
  Calendar,
  Edit3,
  Trash2
} from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';
import { AdSection } from './AdSection';

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

  // 1. Latest Jobs
  const latestJobs = sortByNewest(vacancies.filter((v) => {
    if (v.organization === 'Sarkari Yojana' || v.category === 'scheme' || v.category === 'news' || v.category === 'exam_date') return false;
    return (
      v.category === 'latest_job' ||
      v.category === 'ugc_net' ||
      (v.status === 'active' &&
        v.category !== 'admit_card' &&
        v.category !== 'result' &&
        v.category !== 'answer_key')
    );
  }));

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
    v.category === 'news' || v.title.toLowerCase().includes('news') || v.tags?.includes('news') || v.title.toLowerCase().includes('chunav') || v.title.toLowerCase().includes('apprentice')
  ));

  // 6. Sarkari Yojana
  const sarkariYojanas = sortByNewest(vacancies.filter((v) => 
    v.category === 'scheme' || v.organization === 'Sarkari Yojana' || v.tags?.includes('yojana')
  ));

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

  // Format post publication date string
  const formatPostDate = (item: VacancyItem) => {
    if (item.createdAt) {
      try {
        const parts = item.createdAt.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const monthNum = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const monthNamesHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
          if (isHi) {
            return `${day} ${monthNamesHi[monthNum - 1] || 'अक्टूबर'} ${year}`;
          }
          return `${monthNamesEn[monthNum - 1] || 'October'} ${day}, ${year}`;
        }
      } catch (e) {}
    }
    return isHi ? '22 अक्टूबर 2026' : 'October 22, 2026';
  };

  const renderSectionBox = (sec: typeof row1Sections[0]) => {
    return (
      <div 
        key={sec.key}
        className="bg-white rounded-md flex flex-col justify-between transition-shadow hover:shadow-xs"
        style={{ border: '2px solid #b2b2be' }}
      >
        {/* Signature Green Rounded Pill Header */}
        <div className="p-3 pb-0">
          <h2 
            className="headlight text-center font-bold text-white text-base py-1.5 px-3 select-none"
            style={{ 
              backgroundColor: '#1e953a', 
              border: '5px solid #1e953a', 
              borderRadius: '10px',
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
              fontSize: '12pt',
              lineHeight: 1.35
            }}
          >
            {sec.title}
          </h2>
        </div>

        {/* List of Posts */}
        <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {sec.items.length > 0 ? (
              sec.items.slice(0, 5).map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`pb-2.5 ${idx !== 4 && idx !== sec.items.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-1 group">
                    <button
                      type="button"
                      onClick={() => onSelectVacancy(item)}
                      className="text-left flex-1 min-w-0 cursor-pointer block"
                    >
                      <h3 
                        className="post-item font-semibold text-[#0284c7] hover:text-[#0369a1] underline underline-offset-2 line-clamp-2 leading-snug cursor-pointer transition-colors"
                        style={{
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '11.5pt',
                          lineHeight: 1.45,
                          color: '#0284c7',
                          textDecoration: 'underline'
                        }}
                      >
                        {isHi ? (item.titleHi || item.title) : item.title}
                      </h3>
                      <p 
                        className="text-[13px] text-[#575760] mt-1 select-none font-medium"
                        style={{ color: '#575760', fontSize: '13px' }}
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
    <div className="w-full space-y-8">
      {/* Row 1: Latest Jobs, Admit Card, Results (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {row1Sections.map(renderSectionBox)}
      </div>

      {/* Center Responsive Google AdSense Ad Unit */}
      {showAds && (
        <div className="w-full my-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full max-w-4xl bg-slate-50 border border-slate-200/80 rounded-md p-2 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
              {isHi ? 'विज्ञापन' : 'Advertisement'}
            </span>
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '90px' }}
              data-ad-client="ca-pub-8302542447035711"
              data-ad-slot="3785509362"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      )}

      {/* Row 2: Exam Date, Latest News, Sarkari Yojana (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {row2Sections.map(renderSectionBox)}
      </div>

      {/* "ABOUT RAJASTHAN VACCANCY/JOBS" Section */}
      <section className="bg-white rounded-md p-6 border border-slate-200 mt-8 shadow-xs">
        <h2 
          className="headlight font-bold text-slate-900 mb-3"
          style={{ 
            fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '14pt',
            fontWeight: 'bold',
            color: '#0f172a'
          }}
        >
          ABOUT RAJASTHAN JOBS/VACCANCY
        </h2>
        <p 
          className="post-item text-slate-700 leading-relaxed text-justify"
          style={{ 
            fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '12pt',
            lineHeight: 1.7,
            color: '#334155'
          }}
        >
          {isHi 
            ? 'राजस्थान के सभी आकांक्षी युवाओं एवं प्रतियोगी परीक्षार्थियों के लिए सबसे तेज, विश्वसनीय, सटीक एवं प्रामाणिक भर्ती सूचना मंच। राजस्थान कर्मचारी चयन बोर्ड (RSMSSB), राजस्थान लोक सेवा आयोग (RPSC), राजस्थान पुलिस, रीट (REET) तथा अन्य सभी राज्य एवं केंद्रीय प्रतियोगी परीक्षाओं के नवीनतम सरकारी जॉब अलर्ट्स, एडमिट कार्ड, सिलेबस, कट-ऑफ और परीक्षा परिणामों की पल-पल की सटीक अपडेट सबसे पहले प्राप्त करें।'
            : 'Premier recruitment and job notification portal for Rajasthan candidates. Real-time updates on RSMSSB, RPSC, Police, REET, results, admit cards, syllabus, cut-off, and exam notifications.'}
        </p>
      </section>
    </div>
  );
};
