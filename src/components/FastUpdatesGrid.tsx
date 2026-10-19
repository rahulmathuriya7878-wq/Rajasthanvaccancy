import React, { useState } from 'react';
import { 
  Briefcase, 
  Ticket, 
  Award, 
  KeyRound, 
  Landmark,
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';

interface FastUpdatesGridProps {
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
  onFilterCategory?: (category: CategoryType) => void;
}

export const FastUpdatesGrid: React.FC<FastUpdatesGridProps> = ({
  vacancies,
  lang,
  onSelectVacancy,
}) => {
  const isHi = lang === 'hi';

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    latest_job: true,
    admit_card: true,
    result: true,
    answer_key: true,
    government_yojana: true,
  });

  const toggleExpand = (secKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secKey]: !prev[secKey],
    }));
  };

  const sortByNewest = (items: VacancyItem[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.createdAt || a.importantDates?.applyStartDate || '';
      const dateB = b.createdAt || b.importantDates?.applyStartDate || '';
      return dateB.localeCompare(dateA);
    });
  };

  const latestJobs = sortByNewest(vacancies.filter((v) => {
    if (v.organization === 'Sarkari Yojana' || v.category === 'scheme') return false;
    return (
      v.category === 'latest_job' ||
      v.category === 'ugc_net' ||
      v.organization === 'UGC NET' ||
      v.title?.toLowerCase().includes('ugc net') ||
      v.titleHi?.includes('यूजीसी नेट') ||
      (v.status === 'active' &&
        v.category !== 'admit_card' &&
        v.category !== 'result' &&
        v.category !== 'answer_key')
    );
  }));
  const admitCards = sortByNewest(vacancies.filter((v) => v.category === 'admit_card' || v.status === 'admit_card_out'));
  const results = sortByNewest(vacancies.filter((v) => v.category === 'result' || v.status === 'result_declared'));
  const answerKeys = sortByNewest(vacancies.filter((v) => v.category === 'answer_key' || v.status === 'answer_key_out' || v.category === 'syllabus'));
  const governmentYojanas = sortByNewest(vacancies.filter(
    (v) => v.category === 'scheme' || v.organization === 'Sarkari Yojana'
  ));

  const sections = [
    {
      key: 'latest_job',
      title: isHi ? 'सरकारी भर्तियां (Govt Jobs)' : 'Govt Job Vacancies',
      icon: Briefcase,
      headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-700',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      items: latestJobs,
    },
    {
      key: 'admit_card',
      title: isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Cards',
      icon: Ticket,
      headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-100 text-blue-800',
      items: admitCards,
    },
    {
      key: 'result',
      title: isHi ? 'परीक्षा परिणाम (Results)' : 'Results & Merit',
      icon: Award,
      headerBg: 'bg-gradient-to-r from-rose-600 to-red-700',
      badgeBg: 'bg-rose-100 text-rose-800',
      items: results,
    },
    {
      key: 'answer_key',
      title: isHi ? 'उत्तर कुंजी व सिलेबस (Answer Key)' : 'Answer Key & Syllabus',
      icon: KeyRound,
      headerBg: 'bg-gradient-to-r from-amber-600 to-orange-700',
      badgeBg: 'bg-amber-100 text-amber-900',
      items: answerKeys,
    },
    {
      key: 'government_yojana',
      title: isHi ? 'सरकारी योजनाएं (Government Yojana)' : 'Government Schemes',
      icon: Landmark,
      headerBg: 'bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800',
      badgeBg: 'bg-purple-100 text-purple-900',
      items: governmentYojanas,
    },
  ];

  const jobSections = sections.filter(sec => sec.key !== 'government_yojana');
  const schemeSection = sections.find(sec => sec.key === 'government_yojana');

  return (
    <div className="w-full space-y-8">
      {/* 5-Box Grid with dedicated Government Yojana Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 items-start">
        {sections.map((sec) => {
          const isExpanded = expandedSections[sec.key];
          const displayedItems = isExpanded ? sec.items : sec.items.slice(0, 50);

          return (
            <div
              key={sec.key}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition"
            >
              {/* Box Header */}
              <div className="bg-white text-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2 font-black text-sm tracking-wide text-slate-900">
                  <sec.icon className="w-4 h-4 text-amber-600" />
                  <span>{sec.title}</span>
                </div>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                  {sec.items.length}
                </span>
              </div>

              {/* List of items */}
              <div className="p-2.5 divide-y divide-slate-100 flex-1 flex flex-col justify-between">
                <ul className="space-y-1">
                  {displayedItems.length > 0 ? (
                    displayedItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => onSelectVacancy(item)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/60 transition group flex items-start gap-2 border border-transparent hover:border-amber-200 cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-amber-800 line-clamp-2 leading-snug">
                              {isHi ? item.titleHi : item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {item.category !== 'scheme' && item.organization !== 'Sarkari Yojana' && item.importantDates?.applyLastDate && (
                                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>{isHi ? `अंतिम तिथि: ${item.importantDates.applyLastDate}` : `Last Date: ${item.importantDates.applyLastDate}`}</span>
                                </span>
                              )}
                              {item.isHot && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">
                                  HOT
                                </span>
                              )}
                              {item.totalPosts && typeof item.totalPosts === 'number' && (
                                <span className="text-[10px] text-emerald-700 font-bold">
                                  {item.totalPosts.toLocaleString()} {isHi ? 'पद' : 'posts'}
                                </span>
                              )}
                              {typeof item.totalPosts === 'string' && (
                                <span className="text-[10px] text-purple-700 font-bold">
                                  {item.totalPosts}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-7 px-3">
                      <p className="text-xs font-semibold text-slate-500">
                        {isHi ? 'कोई पोस्ट उपलब्ध नहीं है' : 'No posts available'}
                      </p>
                    </li>
                  )}
                </ul>

                {sec.items.length > 50 && (
                  <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => toggleExpand(sec.key)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 hover:underline py-1 px-2 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                    >
                      <span>
                        {isExpanded
                          ? isHi
                            ? 'कम देखें'
                            : 'Show less'
                          : isHi
                          ? `सभी देखें (${sec.items.length})`
                          : `View all (${sec.items.length})`}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
