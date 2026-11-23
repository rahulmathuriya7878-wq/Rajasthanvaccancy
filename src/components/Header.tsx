'use client';

import React from 'react';
import { 
  ShieldCheck,
  Search,
  X,
  Menu,
  Briefcase,
  Ticket,
  Award,
  Megaphone,
  Landmark,
  MessageCircle,
  Globe,
  PlusCircle,
  Bell,
  BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOptionalPortal } from '../context/PortalContext';
import { useOptionalNotifications } from '../context/NotificationContext';
import { LanguageMode, VacancyItem } from '../types';
import { compareVacanciesNewestFirst } from '../utils/dateUtils';

interface HeaderProps {
  lang?: LanguageMode;
  onGoHome?: () => void;
  latestVacancies?: VacancyItem[];
  onSelectVacancy?: (item: VacancyItem) => void;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  onOpenUrlIndexation?: () => void;
  onOpenAddVacancy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang: langProp,
  onGoHome: onGoHomeProp,
  latestVacancies: latestVacanciesProp,
  onSelectVacancy: onSelectVacancyProp,
  onSelectCategory: onSelectCategoryProp,
  selectedCategory: selectedCategoryProp,
  onOpenUrlIndexation: onOpenUrlIndexationProp,
  onOpenAddVacancy: onOpenAddVacancyProp,
}) => {
  const { isAdmin, toggleAdminMode } = useAuth();
  const portal = useOptionalPortal();
  const notif = useOptionalNotifications();
  const lang = langProp ?? portal?.lang ?? 'hi';
  const onGoHome = onGoHomeProp ?? portal?.handleGoHome;
  const latestVacancies = latestVacanciesProp ?? portal?.vacancies ?? [];
  const onSelectVacancy = onSelectVacancyProp ?? portal?.handleSelectVacancy;
  const onSelectCategory = onSelectCategoryProp ?? portal?.handleSelectCategory;
  const selectedCategory = selectedCategoryProp ?? portal?.selectedCategory ?? 'ALL';
  const onOpenUrlIndexation = onOpenUrlIndexationProp ?? (portal ? () => portal.setIsUrlIndexationOpen(true) : undefined);
  const onOpenAddVacancy = onOpenAddVacancyProp ?? (portal ? () => portal.setIsAddVacancyOpen(true) : undefined);
  const isHi = lang === 'hi';

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Sort vacancies by newest added/updated date (memoized to avoid re-sorting on every render)
  const tickerItems = React.useMemo(
    () => [...latestVacancies].sort(compareVacanciesNewestFirst).slice(0, 8),
    [latestVacancies]
  );

  // Key important sections of the portal - strictly limited to the 5 requested sections
  const importantSections = [
    {
      key: 'news',
      title: 'Latest News',
      titleHi: 'लेटेस्ट न्यूज़ (Latest News)',
      shortTitle: 'Latest News',
      icon: Megaphone,
      type: 'category' as const,
    },
    {
      key: 'latest_job',
      title: 'Latest Job',
      titleHi: 'सरकारी नौकरी (Latest Job)',
      shortTitle: 'Latest Job',
      icon: Briefcase,
      type: 'category' as const,
    },
    {
      key: 'result',
      title: 'Result',
      titleHi: 'रिजल्ट (Result)',
      shortTitle: 'Result',
      icon: Award,
      type: 'category' as const,
    },
    {
      key: 'admit_card',
      title: 'Admit Card',
      titleHi: 'एडमिट कार्ड (Admit Card)',
      shortTitle: 'Admit Card',
      icon: Ticket,
      type: 'category' as const,
    },
    {
      key: 'scheme',
      title: 'Sarkari Yojana',
      titleHi: 'सरकारी योजना (Sarkari Yojana)',
      shortTitle: 'Sarkari Yojana',
      icon: Landmark,
      type: 'category' as const,
    },
  ];

  const handleSectionClick = (sec: typeof importantSections[0]) => {
    if (onSelectCategory) {
      onSelectCategory(sec.key);
    }
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-xs border-b border-slate-200 text-base">
      {/* Top Scrolling Ticker Bar for Latest Added Posts - White Clean Design */}
      <div className="bg-white text-slate-700 text-xs font-medium py-1 px-3 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Marquee Ticker with latest added posts */}
          <div className="overflow-hidden whitespace-nowrap flex-1 relative group">
            <div className="animate-marquee inline-flex items-center gap-6" style={{ animationDuration: '200s', animation: 'marquee 200s linear infinite' }}>
              {tickerItems.length > 0 ? (
                <>
                  <div className="inline-flex items-center gap-6">
                    {tickerItems.map((item) => (
                      <a
                        key={item.id}
                        href={`/?vacancy=${encodeURIComponent(item.id)}`}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          if (onSelectVacancy) {
                            e.preventDefault();
                            onSelectVacancy(item);
                          }
                        }}
                        className="inline-flex items-center gap-2 hover:text-[#15803d] transition text-xs font-semibold cursor-pointer group/item text-left"
                        title={isHi ? item.titleHi : item.title}
                      >
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {item.organization || (isHi ? 'भर्ती' : 'Job')}
                        </span>
                        <span className="group-hover/item:underline underline-offset-2 headlight text-slate-800">
                          {isHi ? (item.titleHi || item.title) : item.title}
                        </span>
                        {typeof item.totalPosts === 'number' && item.totalPosts > 0 && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full">
                            {item.totalPosts} {isHi ? 'पद' : 'Posts'}
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-400 font-mono select-none mx-2">•</span>
                      </a>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-6">
                    {tickerItems.map((item) => (
                      <a
                        key={`${item.id}-dup`}
                        href={`/?vacancy=${encodeURIComponent(item.id)}`}
                        tabIndex={-1}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          if (onSelectVacancy) {
                            e.preventDefault();
                            onSelectVacancy(item);
                          }
                        }}
                        className="inline-flex items-center gap-2 hover:text-[#15803d] transition text-xs font-semibold cursor-pointer group/item text-left"
                        title={isHi ? item.titleHi : item.title}
                      >
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {item.organization || (isHi ? 'भर्ती' : 'Job')}
                        </span>
                        <span className="group-hover/item:underline underline-offset-2 headlight text-slate-800">
                          {isHi ? (item.titleHi || item.title) : item.title}
                        </span>
                        {typeof item.totalPosts === 'number' && item.totalPosts > 0 && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full">
                            {item.totalPosts} {isHi ? 'पद' : 'Posts'}
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-400 font-mono select-none mx-2">•</span>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-600">
                  {isHi ? 'नई सरकारी भर्ती एवं परिणाम सूचनाएं यहां प्रदर्शित होंगी' : 'New job announcements will scroll here'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Header - Clean White Theme matching screenshot */}
      <div className="bg-white text-slate-900 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Identity */}
            <a
              href="/"
              onClick={(e) => {
                if (onGoHome) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
              className="no-link-color flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition no-underline"
              title="Rajasthan Vacancy Home"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[#15803d] flex items-center justify-center text-white font-extrabold shadow-xs" aria-hidden="true">
                <div className="text-center leading-none">
                  <span className="text-[9px] block font-mono text-white font-bold">RAJ</span>
                  <span className="text-xs font-black tracking-tight text-white">JOBS</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center leading-tight">
                    <span>Rajasthan</span>
                    <span className="text-[#15803d] font-black ml-1">Vacancy</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  {isHi ? 'राजस्थान व केंद्र भर्ती, रिजल्ट एवं योजना पोर्टल' : 'Govt Jobs, Exam Alerts & Sarkari Result Portal'}
                </p>
              </div>
            </a>

            {/* Right Header Navigation Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Regular User Job Alerts & Notification Center Button */}
              {notif && (
                <button
                  type="button"
                  onClick={() => notif.openNotificationDrawer('inbox')}
                  className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-[#15803d] hover:text-[#15803d] text-slate-800 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  aria-label={
                    isHi
                      ? `जॉब अलर्ट नोटिफिकेशन${notif.unreadCount > 0 ? ` (${notif.unreadCount} अपठित)` : ''}`
                      : `Job Alert Notifications${notif.unreadCount > 0 ? ` (${notif.unreadCount} unread)` : ''}`
                  }
                  title={isHi ? 'जॉब अलर्ट और सेव्ड सर्च नोटिफिकेशन' : 'Job Alerts & Saved Search Notifications'}
                >
                  {notif.unreadCount > 0 ? (
                    <BellRing className="w-4 h-4 text-[#15803d] shrink-0" aria-hidden="true" />
                  ) : (
                    <Bell className="w-4 h-4 text-slate-700 shrink-0" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">{isHi ? 'जॉब अलर्ट' : 'Job Alerts'}</span>
                  {notif.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md bg-[#15803d] text-white text-[10px] font-bold tabular-nums leading-none">
                      {notif.unreadCount > 99 ? '99+' : notif.unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Menu Toggle Button matching '≡ Menu' from screenshot */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4 text-slate-800" /> : <Menu className="w-4 h-4 text-slate-800" />}
                <span>Menu</span>
              </button>

              {/* Add New Vacancy Button (Admin Only) */}
              {isAdmin && onOpenAddVacancy && (
                <button
                  type="button"
                  onClick={onOpenAddVacancy}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                  title={isHi ? 'नई भर्ती / पोस्ट लाइव जोड़ें' : 'Add New Vacancy (Live Firebase)'}
                  aria-label="Add New Vacancy"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
                    {isHi ? '+ नई भर्ती' : '+ Add Post'}
                  </span>
                </button>
              )}

              {/* URL Inspection Button (Admin Only) */}
              {isAdmin && onOpenUrlIndexation && (
                <button
                  type="button"
                  onClick={onOpenUrlIndexation}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                  title={isHi ? 'Google Search Console URL Inspection Assistant' : 'URL Inspection Assistant'}
                  aria-label="URL Inspection and Indexation Assistant"
                >
                  <Search className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
                    {isHi ? 'URL Inspect' : 'URL Inspect'}
                  </span>
                </button>
              )}

              {/* Admin Controls */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (portal) {
                        portal.setIsAdminLoginOpen(true);
                      } else {
                        toggleAdminMode(false);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:bg-emerald-700"
                    title={isHi ? 'एडमिन पैनल खोलें' : 'Open Admin Panel'}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span className="text-[11px] font-extrabold">{isHi ? 'Admin Panel' : 'Admin'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Dropdown Drawer with all Important Sections - Clean White Background */}
          {mobileMenuOpen && (
            <nav aria-label="Mobile Navigation" className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1.5 text-xs font-bold text-slate-800 animate-fadeIn bg-white p-3 rounded-xl shadow-lg border border-slate-200 max-h-[75vh] overflow-y-auto">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 px-2 py-1">
                {isHi ? 'वेबसाइट के मुख्य सेक्शंस' : 'Important Website Sections'}
              </div>

              {importantSections.map((sec) => {
                const isActive = selectedCategory === sec.key;
                const Icon = sec.icon;
                return (
                  <a
                    key={sec.key}
                    href={`/?category=${encodeURIComponent(sec.key)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSectionClick(sec);
                    }}
                    className={`no-link-color text-left px-3 py-2 rounded-lg transition flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-[#15803d] !text-white font-extrabold shadow-xs' 
                        : 'hover:bg-slate-100 text-slate-800 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#15803d]'}`} />
                      <span className="headlight">{isHi ? sec.titleHi : sec.title}</span>
                    </div>
                  </a>
                );
              })}

              {/* Add New Vacancy Button in Mobile Menu (Admin Only) */}
              {isAdmin && onOpenAddVacancy && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddVacancy();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-1 px-3 py-2.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-xs flex items-center justify-between transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>{isHi ? 'नई भर्ती / पोस्ट जोड़ें (Live Publish)' : 'Add New Vacancy (Live)'}</span>
                  </div>
                  <span className="text-[10px] bg-white text-[#15803d] px-1.5 py-0.5 rounded font-black">
                    NEW
                  </span>
                </button>
              )}

              {/* URL Indexation Button in Mobile Menu (Admin Only) */}
              {isAdmin && onOpenUrlIndexation && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenUrlIndexation();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-1 px-3 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{isHi ? 'सर्च कंसोल URL इंडेक्सेशन टूल' : 'URL Indexation Assistant'}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                    GSC
                  </span>
                </button>
              )}

              {/* Regular User Custom Job Alerts trigger in Mobile Menu */}
              {notif && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    notif.openNotificationDrawer('alerts');
                  }}
                  className="mt-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-[#15803d]" />
                    <span>{isHi ? 'कस्टम जॉब अलर्ट सेट करें' : 'Custom Job Alerts'}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#15803d] tabular-nums">
                    {notif.savedAlerts.filter((a) => a.enabled).length} {isHi ? 'सक्रिय' : 'Active'}
                  </span>
                </button>
              )}

              {/* Official WhatsApp Channel Link in Mobile Menu */}
              <a
                href="https://whatsapp.com/channel/0029VbEOVh74dTnTUUmjcS0j"
                target="_blank"
                rel="noopener noreferrer"
                className="no-link-color mt-2 px-3 py-2.5 rounded-lg bg-[#15803d] hover:bg-[#166534] !text-white font-extrabold text-xs flex items-center justify-between transition shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{isHi ? 'WhatsApp चैनल जॉइन करें' : 'Join WhatsApp Channel'}</span>
                </div>
                <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded font-black">
                  FREE
                </span>
              </a>
            </nav>
          )}
        </div>
      </div>

      {/* Dedicated Full-Width "Important Website Sections" Navigation Bar - Clean White Theme */}
      <nav 
        aria-label="Important Website Sections"
        className="hidden md:block w-full bg-white border-b border-slate-200 select-none shadow-xs text-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start gap-2 overflow-x-auto py-2 scrollbar-none">
            {importantSections.map((sec) => {
              const isActive = selectedCategory === sec.key;
              const Icon = sec.icon;

              let buttonClasses = 'no-link-color px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ';

              if (isActive) {
                buttonClasses += 'bg-[#15803d] !text-white font-extrabold shadow-xs ';
              } else {
                buttonClasses += 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 ';
              }

              return (
                <a
                  key={sec.key}
                  href={`/?category=${encodeURIComponent(sec.key)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick(sec);
                  }}
                  className={buttonClasses}
                  style={{
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
                  }}
                  title={isHi ? sec.titleHi : sec.title}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#15803d]'}`} />
                  <span className="headlight whitespace-nowrap">
                    {sec.shortTitle}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
