import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  Building2, 
  Award, 
  Search, 
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Share2,
  Edit3,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';
import { AdSection } from './AdSection';
import { formatDisplayDate } from '../utils/dateUtils';

interface CategoryArchiveViewProps {
  categoryKey: string;
  categoryTitle: string;
  categoryTitleHi: string;
  vacancies: VacancyItem[];
  allVacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
  onClearCategory: () => void;
  onSelectCategory: (catKey: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isAdmin?: boolean;
  onEditVacancy?: (item: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
}

export const CategoryArchiveView: React.FC<CategoryArchiveViewProps> = ({
  categoryKey,
  categoryTitle,
  categoryTitleHi,
  vacancies,
  allVacancies,
  lang,
  onSelectVacancy,
  onClearCategory,
  onSelectCategory,
  searchQuery = '',
  setSearchQuery,
  isAdmin = false,
  onEditVacancy,
  onDeleteVacancy,
}) => {
  const isHi = lang === 'hi';
  const [sidebarSearch, setSidebarSearch] = useState('');

  // 10 recent posts for the authentic GeneratePress sidebar
  const recentPosts = [...allVacancies]
    .sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || a.importantDates?.notificationDate || '';
      const dateB = b.updatedAt || b.createdAt || b.importantDates?.notificationDate || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 10);

  const allSections = [
    { key: 'latest_job', title: 'Latest Jobs', titleHi: 'सरकारी भर्तियां' },
    { key: 'admit_card', title: 'Admit Card', titleHi: 'प्रवेश पत्र' },
    { key: 'result', title: 'Results', titleHi: 'रिजल्ट' },
    { key: 'exam_date', title: 'Exam Date', titleHi: 'परीक्षा तिथि' },
    { key: 'news', title: 'Latest News', titleHi: 'लेटेस्ट न्यूज़' },
    { key: 'scheme', title: 'Sarkari Yojana', titleHi: 'सरकारी योजनाएं' },
    { key: 'answer_key', title: 'Answer Key', titleHi: 'उत्तर कुंजी' },
    { key: 'syllabus', title: 'Syllabus', titleHi: 'सिलेबस' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb Navigation matching rajasthanvacancy.com */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <button 
          onClick={onClearCategory}
          className="text-[#1e953a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isHi ? 'मुख्य पृष्ठ (होम)' : 'Home'}</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">{isHi ? 'श्रेणी' : 'Category'}</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-bold headlight">
          {isHi ? categoryTitleHi : categoryTitle}
        </span>
      </nav>

      {/* Category Archive Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#1e953a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#1e953a] px-2 py-0.5 rounded">
              {isHi ? 'श्रेणी अभिलेखागार' : 'Category Archive'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {vacancies.length} {isHi ? 'पोस्ट उपलब्ध' : 'Posts found'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 headlight">
            {isHi ? categoryTitleHi : categoryTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isHi 
              ? `${categoryTitleHi} से संबंधित सभी आधिकारिक सूचनाएं, डाउनलोड लिंक्स एवं महत्वपूर्ण अपडेट्स।`
              : `All recent notifications, official links, and updates filed under ${categoryTitle}.`}
          </p>
        </div>

        <button
          onClick={onClearCategory}
          className="self-start md:self-center px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isHi ? 'सभी अपडेट्स देखें' : 'View All Updates'}</span>
        </button>
      </div>

      {/* 2-Column Desktop Grid Layout (70% Main Archive List, 30% Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Posts Archive List (70% width) */}
        <div className="lg:col-span-8 space-y-4">
          {vacancies.length > 0 ? (
            <div className="space-y-4">
              {vacancies.map((item) => {
                const title = isHi ? (item.titleHi || item.title) : item.title;
                const date = formatDisplayDate(item.updatedAt || item.importantDates?.notificationDate || item.createdAt);
                const excerpt = isHi ? (item.briefSummaryHi || item.briefSummary) : item.briefSummary;
                const categoryLabel = isHi ? categoryTitleHi : categoryTitle;

                return (
                  <article 
                    key={item.id}
                    className="inside-article bg-white p-3 sm:p-5 border border-slate-200 shadow-xs rounded-md hover:border-slate-300 transition-all"
                  >
                    <header className="entry-header mb-3">
                      {isAdmin && (
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>एडमिन कंट्रोल्स</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {onEditVacancy && (
                              <button
                                type="button"
                                onClick={() => onEditVacancy(item)}
                                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded flex items-center gap-1 transition"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>संशोधित करें</span>
                              </button>
                            )}
                            {onDeleteVacancy && (
                              <button
                                type="button"
                                onClick={() => onDeleteVacancy(item.id)}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>डिलीट करें</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <h2 
                        onClick={() => onSelectVacancy(item)}
                        className="entry-title text-xl sm:text-2xl font-bold text-[#0284c7] hover:text-[#0369a1] underline underline-offset-2 transition cursor-pointer headlight leading-snug mb-2"
                        style={{ color: '#0284c7', textDecoration: 'underline' }}
                      >
                        <span>{title}</span>
                      </h2>
                      <div className="entry-meta text-xs text-[#575760] flex items-center gap-2 flex-wrap">
                        <span className="posted-on">
                          <time className="entry-date published">{date}</time>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="byline">
                          by{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCategory('news');
                            }}
                            className="font-bold text-[#0056b3] hover:underline cursor-pointer inline-flex items-center gap-0.5"
                            title={isHi ? 'लेटेस्ट न्यूज़ (Latest News) खोलें' : 'Open Latest News'}
                          >
                            <span>RajasthanVacancy</span>
                          </button>
                        </span>
                        {item.organization && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[11px]">
                              {item.organization}
                            </span>
                          </>
                        )}
                      </div>
                    </header>

                    {excerpt && (
                      <div className="entry-summary text-slate-800 text-[15px] leading-relaxed mb-4 post-item">
                        <p className="line-clamp-3">
                          {excerpt} …{' '}
                          <button
                            onClick={() => onSelectVacancy(item)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer inline-flex items-center"
                          >
                            Read more »
                          </button>
                        </p>
                      </div>
                    )}

                    <footer className="entry-meta border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-[#575760] flex-wrap gap-2">
                      <div className="cat-links flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500 font-medium">{categoryLabel}</span>
                        {item.organization && (
                          <span className="text-slate-400">, {item.organization}</span>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectVacancy(item)}
                        className="comments-link text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium hover:underline"
                      >
                        <span>Leave a comment</span>
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-3">
              <p className="text-sm text-slate-600">
                {isHi ? 'इस श्रेणी में वर्तमान में कोई पोस्ट नहीं मिली।' : 'No posts found in this category.'}
              </p>
              <button
                onClick={onClearCategory}
                className="px-4 py-2 rounded-lg bg-[#1e953a] text-white text-xs font-bold hover:bg-[#187a2f] transition cursor-pointer"
              >
                {isHi ? 'सभी सरकारी भर्तियां एवं परिणाम देखें' : 'View All Vacancies & Updates'}
              </button>
            </div>
          )}

          {/* Ad banner in category archive */}
          <div className="pt-4">
            <AdSection slot="category-bottom" />
          </div>
        </div>

        {/* Right Column: Authentic GeneratePress / RajasthanVacancy Sidebar (30% width) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* 1. Sidebar Search Widget */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3 headlight">
              {isHi ? 'भर्ती या सूचना खोजें' : 'Search Posts'}
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'यहाँ सर्च करें...' : 'Search here...'}
                className="w-full bg-slate-50 focus:bg-white text-slate-900 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e953a]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 2. All Category Sections Filter */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3 headlight">
              {isHi ? 'मुख्य सेक्शंस' : 'Important Sections'}
            </h3>
            <div className="space-y-1.5">
              {allSections.map((sec) => {
                const isCurrent = categoryKey === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => onSelectCategory(sec.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      isCurrent
                        ? 'bg-[#1e953a] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#1e953a]'
                    }`}
                  >
                    <span>{isHi ? sec.titleHi : sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Social Media Communities (WhatsApp & Telegram) */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 headlight">
              {isHi ? 'सोशल मीडिया से जुड़ें' : 'Join Our Communities'}
            </h3>
            <p className="text-xs text-slate-600">
              {isHi 
                ? 'सरकारी नौकरी, एडमिट कार्ड और रिजल्ट की सबसे तेज अपडेट सीधे अपने फोन पर पाएं।' 
                : 'Get fastest job and result updates directly on WhatsApp & Telegram.'}
            </p>
            <div className="space-y-2">
              <a
                href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Join WhatsApp Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://t.me/newrajsthanjobs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Join Telegram Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 4. Recent Posts Widget (10 recent posts) */}
          <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs">
            <h3 
              className="text-xs font-extrabold uppercase tracking-wider text-[#0056b3] border-b border-blue-200 pb-2 mb-3 flex items-center gap-1.5"
              style={{ color: '#0056b3' }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0056b3] inline-block shrink-0"></span>
              <span className="text-[#0056b3]">{isHi ? 'हाल ही की पोस्ट (Recent Posts)' : 'Recent Posts'}</span>
            </h3>
            <ul className="divide-y divide-blue-50">
              {recentPosts.map((post) => (
                <li key={post.id} className="py-2.5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => onSelectVacancy(post)}
                    className="text-left text-xs font-bold text-[#0056b3] hover:text-blue-900 hover:underline transition line-clamp-2 cursor-pointer block leading-snug group"
                    style={{ color: '#0056b3' }}
                    title={isHi ? post.titleHi : post.title}
                  >
                    👉 <span className="text-[#0056b3] group-hover:text-blue-900 group-hover:underline">{isHi ? (post.titleHi || post.title) : post.title}</span>
                  </button>
                  <span className="text-[10px] text-blue-600/80 mt-1 block pl-4 font-medium flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                    <span>{formatDisplayDate(post.updatedAt || post.importantDates?.notificationDate || post.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
