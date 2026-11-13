import React from 'react';
import { Bell, Edit3, Trash2 } from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';

interface RecentPostsListProps {
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
  isAdmin?: boolean;
  onEditVacancy?: (item: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  alertJobIds?: string[];
  onToggleAlertMe?: (id: string) => void;
  maxPosts?: number;
}

export const RecentPostsList: React.FC<RecentPostsListProps> = ({
  vacancies,
  lang,
  onSelectVacancy,
  isAdmin = false,
  onEditVacancy,
  onDeleteVacancy,
  alertJobIds = [],
  onToggleAlertMe,
  maxPosts = 100,
}) => {
  const isHi = lang === 'hi';

  // Sort newest first
  const sortedVacancies = React.useMemo(() => {
    return [...vacancies]
      .filter((v) => {
        // Exclude closed vacancies if any
        return v.status !== 'closed';
      })
      .sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || a.importantDates?.notificationDate || '';
        const dateB = b.updatedAt || b.createdAt || b.importantDates?.notificationDate || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, maxPosts);
  }, [vacancies, maxPosts]);

  const formatPostDate = (item: VacancyItem) => {
    const rawDate = item.updatedAt || item.createdAt || item.importantDates?.notificationDate;
    if (!rawDate) return isHi ? '12 नवंबर 2026' : 'November 12, 2026';
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const hindiMonths = [
          'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
          'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
        ];
        return isHi
          ? `${d.getDate()} ${hindiMonths[d.getMonth()]} ${d.getFullYear()}`
          : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return rawDate;
  };

  if (sortedVacancies.length === 0) return null;

  return (
    <section 
      aria-label="Recent Posts" 
      className="w-full bg-white pt-2 pb-6"
      style={{
        fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Signature Heading matching user screenshot */}
      <h2 
        className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-5"
        style={{
          fontFamily: "'Inter', 'Roboto', 'Noto Sans Devanagari', -apple-system, sans-serif",
          color: '#111827',
          fontWeight: 700
        }}
      >
        Recent Posts
      </h2>

      {/* Clean vertical list of posts without box borders matching screenshot */}
      <div className="space-y-5">
        {sortedVacancies.map((item) => (
          <article 
            key={item.id} 
            className="group flex items-start justify-between gap-3 border-b border-slate-100 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onSelectVacancy(item)}
                className="text-left w-full cursor-pointer block group focus:outline-none"
              >
                <h3 
                  className="post-title-link font-semibold leading-snug cursor-pointer block transition-colors"
                  style={{
                    fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                    color: '#0066cc',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3.5px',
                  }}
                >
                  {isHi ? (item.titleHi || item.title) : item.title}
                </h3>
                <p className="text-xs sm:text-[13.5px] text-gray-500 mt-1 select-none font-normal">
                  {formatPostDate(item)}
                </p>
              </button>
            </div>

            {/* Quick Actions (Alert Bell & Admin Controls) */}
            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              {isAdmin && (
                <>
                  {onEditVacancy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditVacancy(item);
                      }}
                      className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer"
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
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                      title={isHi ? 'पोस्ट डिलीट करें' : 'Delete Post'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}

              {onToggleAlertMe && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAlertMe(item.id);
                  }}
                  className={`p-1.5 rounded-md transition cursor-pointer shrink-0 ${
                    alertJobIds.includes(item.id)
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-slate-300 hover:text-slate-600'
                  }`}
                  title={alertJobIds.includes(item.id) ? (isHi ? 'अलर्ट सक्रिय' : 'Alert Active') : (isHi ? 'अलर्ट सेट करें' : 'Set Alert')}
                  aria-label="Set recruitment alert"
                >
                  <Bell className={`w-3.5 h-3.5 ${alertJobIds.includes(item.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentPostsList;
