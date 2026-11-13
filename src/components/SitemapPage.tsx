import React, { useMemo } from 'react';
import { ArrowLeft, Map, ExternalLink, FileText, FolderOpen, Globe, Rss } from 'lucide-react';
import { VacancyItem, LanguageMode, CategoryType } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';

interface SitemapPageProps {
  lang: LanguageMode;
  vacancies: VacancyItem[];
  onBack: () => void;
  onSelectVacancy: (item: VacancyItem) => void;
  onSelectCategory: (category: CategoryType) => void;
  onSelectPolicy: (policy: 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap') => void;
  isAdmin?: boolean;
}

const SECTION_CATEGORIES: { key: CategoryType; label: string; labelHi: string }[] = [
  { key: 'latest_job', label: 'Latest Jobs', labelHi: 'लेटेस्ट जॉब्स (Latest Jobs)' },
  { key: 'admit_card', label: 'Admit Card', labelHi: 'एडमिट कार्ड (Admit Card)' },
  { key: 'result', label: 'Results', labelHi: 'परीक्षा परिणाम (Results)' },
  { key: 'exam_date', label: 'Exam Date', labelHi: 'परीक्षा तिथि (Exam Date)' },
  { key: 'news', label: 'Latest News', labelHi: 'लेटेस्ट न्यूज़ (Latest News)' },
  { key: 'scheme', label: 'Sarkari Yojana', labelHi: 'सरकारी योजनाएं (Sarkari Yojana)' },
  { key: 'answer_key', label: 'Answer Key', labelHi: 'उत्तर कुंजी (Answer Key)' },
  { key: 'syllabus', label: 'Syllabus', labelHi: 'पाठ्यक्रम (Syllabus)' },
];

export const SitemapPage: React.FC<SitemapPageProps> = ({
  lang,
  vacancies,
  onBack,
  onSelectVacancy,
  onSelectCategory,
  onSelectPolicy,
  isAdmin = false,
}) => {
  const isHi = lang === 'hi';

  const groupedByCategory = useMemo(() => {
    const sortNewest = (items: VacancyItem[]) =>
      [...items].sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || a.importantDates?.notificationDate || '';
        const dateB = b.updatedAt || b.createdAt || b.importantDates?.notificationDate || '';
        return dateB.localeCompare(dateA);
      });

    return SECTION_CATEGORIES.map((sec) => {
      const items = sortNewest(
        vacancies.filter((v) => {
          if (sec.key === 'latest_job') {
            return (
              v.category === 'latest_job' ||
              (v as any).category === 'job' ||
              v.category === 'ugc_net' ||
              !v.category
            );
          }
          if (sec.key === 'admit_card') {
            return v.category === 'admit_card' || v.status === 'admit_card_out';
          }
          if (sec.key === 'result') {
            return v.category === 'result' || v.status === 'result_declared';
          }
          if (sec.key === 'exam_date') {
            return (
              v.category === 'exam_date' ||
              v.title.toLowerCase().includes('exam date') ||
              v.titleHi?.includes('परीक्षा तिथि')
            );
          }
          if (sec.key === 'news') {
            return (
              v.category === 'news' ||
              v.tags?.includes('news') ||
              v.title.toLowerCase().includes('news')
            );
          }
          if (sec.key === 'scheme') {
            return (
              v.category === 'scheme' ||
              v.organization === 'Sarkari Yojana' ||
              v.tags?.includes('yojana')
            );
          }
          return v.category === sec.key;
        })
      ).slice(0, 100);

      return { ...sec, items };
    });
  }, [vacancies]);

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white rounded-2xl shadow-xs border border-slate-200 my-4"
      style={{
        fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '12pt',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#15803d] text-white flex items-center justify-center font-bold shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isHi ? 'साइटमैप (Sitemap)' : 'Website Sitemap'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isHi
                ? `पोर्टल के सभी सेक्शंस, श्रेणियां और कुल ${vacancies.length} सक्रिय पोस्ट के डायरेक्ट लिंक`
                : `Complete index of all categories, pages, and ${vacancies.length} active recruitment posts`}
            </p>
          </div>
        </div>

        {/* XML Sitemap & RSS Quick Links (Hidden for normal users, Admin only) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition"
            >
              <Rss className="w-3.5 h-3.5 text-orange-600" />
              <span>rss.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>robots.txt</span>
            </a>
          </div>
        )}
      </div>

      {/* Category & Important Pages Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-[#15803d]" />
            <span>{isHi ? 'मुख्य भर्ती श्रेणियां (Categories)' : 'Main Categories'}</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SECTION_CATEGORIES.map((cat) => (
              <a
                key={cat.key}
                href={`/?category=${cat.key}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(cat.key);
                }}
                className="text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1"
              >
                • {isHi ? cat.labelHi : cat.label}
              </a>
            ))}
          </div>
        </section>

        <section className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#15803d]" />
            <span>{isHi ? 'महत्वपूर्ण पोर्टल पृष्ठ (Portal Pages)' : 'Important Portal Pages'}</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onBack}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'होम पेज (Home)' : 'Home Page'}
            </button>
            <button
              type="button"
              onClick={() => onSelectPolicy('about')}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'हमारे बारे में (About Us)' : 'About Us'}
            </button>
            <button
              type="button"
              onClick={() => onSelectPolicy('contact')}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'संपर्क करें (Contact Us)' : 'Contact Us'}
            </button>
            <button
              type="button"
              onClick={() => onSelectPolicy('privacy')}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => onSelectPolicy('terms')}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'नियम व शर्तें (Terms)' : 'Terms & Conditions'}
            </button>
            <button
              type="button"
              onClick={() => onSelectPolicy('disclaimer')}
              className="text-left text-xs sm:text-sm text-[#0066cc] hover:underline font-medium py-1 cursor-pointer"
            >
              • {isHi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer'}
            </button>
          </div>
        </section>
      </div>

      {/* All Posts Grouped by Category (Up to 100 posts per section) */}
      <div className="space-y-8">
        {groupedByCategory.map((sec) => {
          if (sec.items.length === 0) return null;
          return (
            <section key={sec.key} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#15803d] text-white px-4 py-2.5 flex items-center justify-between">
                <h2 className="font-bold text-base sm:text-lg">
                  {isHi ? sec.labelHi : sec.label}
                </h2>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  {sec.items.length} {isHi ? 'पोस्ट' : 'Posts'}
                </span>
              </div>
              <ul className="divide-y divide-slate-100 p-4 space-y-2.5">
                {sec.items.map((item) => (
                  <li key={item.id} className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <a
                      href={`/?vacancy=${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectVacancy(item);
                      }}
                      className="post-title-link font-semibold text-[#0066cc] hover:underline leading-snug"
                      style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
                    >
                      {isHi ? (item.titleHi || item.title) : item.title}
                    </a>
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatDisplayDate(item.updatedAt || item.createdAt || item.importantDates?.notificationDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SitemapPage;
