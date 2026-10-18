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

  const latestJobs = vacancies.filter((v) => {
    if (v.organization === 'Sarkari Yojana' || v.category === 'scheme') return false;
    return (
      v.category === 'latest_job' ||
      (v.status === 'active' &&
        v.category !== 'admit_card' &&
        v.category !== 'result' &&
        v.category !== 'answer_key')
    );
  });
  const admitCards = vacancies.filter((v) => v.category === 'admit_card' || v.status === 'admit_card_out');
  const results = vacancies.filter((v) => v.category === 'result' || v.status === 'result_declared');
  const answerKeys = vacancies.filter((v) => v.category === 'answer_key' || v.status === 'answer_key_out' || v.category === 'syllabus');
  const governmentYojanas = vacancies.filter(
    (v) => v.category === 'scheme' || v.organization === 'Sarkari Yojana'
  );

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

  return (
    <div className="w-full space-y-8">
      {/* 5-Box Grid with dedicated Government Yojana Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 items-start">
        {sections.map((sec) => {
          const isExpanded = expandedSections[sec.key];
          const displayedItems = isExpanded ? sec.items : sec.items.slice(0, 7);

          return (
            <div
              key={sec.key}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition"
            >
              {/* Box Header */}
              <div className={`${sec.headerBg} text-white px-4 py-3 flex items-center justify-between shadow-xs`}>
                <div className="flex items-center gap-2 font-black text-sm tracking-wide">
                  <sec.icon className="w-4 h-4 text-white/90" />
                  <span>{sec.title}</span>
                </div>
                <span className="text-[11px] font-bold bg-black/20 text-white/95 px-2 py-0.5 rounded-full">
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
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.organization}
                              </span>
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
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isHi ? 'जल्द ही नई सूचनाएं अपडेट की जाएंगी' : 'New updates will be posted soon'}
                      </p>
                    </li>
                  )}
                </ul>

                {sec.items.length > 7 && (
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

      {/* Featured Government Schemes Highlight Section (सरकारी योजना विशेष बॉक्स) */}
      {governmentYojanas.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Landmark className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-wide">
                    {isHi ? 'राजस्थान सरकारी योजनाएं (Government Schemes 2026)' : 'Rajasthan Government Schemes 2026'}
                  </h2>
                  <span className="text-[10px] font-black bg-amber-400 text-purple-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    HOT
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-0.5">
                  {isHi 
                    ? 'राज्य सरकार की प्रमुख जनकल्याणकारी योजनाएं, पात्रता, आवश्यक दस्तावेज एवं आवेदन प्रक्रिया'
                    : 'Key welfare schemes of Rajasthan Government: Eligibility, Documents & Apply Process'}
                </p>
              </div>
            </div>
            <div className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 self-start sm:self-auto text-amber-200">
              {governmentYojanas.length} {isHi ? 'प्रमुख योजनाएं' : 'Active Schemes'}
            </div>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {governmentYojanas.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => onSelectVacancy(scheme)}
                className="group relative bg-slate-50/70 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 shadow-2xs hover:shadow cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded uppercase">
                      {scheme.organization}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {scheme.importantDates.applyLastDate}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-800 group-hover:text-purple-900 line-clamp-2 leading-snug">
                    {isHi ? scheme.titleHi : scheme.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {isHi ? scheme.descriptionHi : scheme.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 line-clamp-1">
                    {isHi ? (scheme.salaryHi || scheme.salary) : scheme.salary}
                  </span>
                  <span className="text-xs font-bold text-purple-700 group-hover:text-purple-900 group-hover:underline inline-flex items-center gap-1 shrink-0 ml-2">
                    {isHi ? 'पूरी जानकारी देखें' : 'View Details'}
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
