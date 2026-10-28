import React from 'react';
import { 
  Bell, 
  ShieldCheck,
  PlusCircle,
  Search,
  X,
  Menu,
  Briefcase,
  Ticket,
  Award,
  Megaphone,
  Landmark,
  MessageCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LanguageMode, VacancyItem } from '../types';

interface HeaderProps {
  lang: LanguageMode;
  setLang: (lang: LanguageMode) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAgeCalc: () => void;
  onOpenCalendar: () => void;
  onOpenEligibility: () => void;
  onOpenAddJob?: () => void;
  onOpenAdminLogin?: () => void;
  onOpenSSOGuide: () => void;
  onGoHome?: () => void;
  latestVacancies?: VacancyItem[];
  onSelectVacancy?: (item: VacancyItem) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  onSyncRSS?: () => void;
  isSyncing?: boolean;
  onOpenSubscribe?: () => void;
  onOpenUrlIndexation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  savedCount,
  onOpenSaved,
  onOpenAgeCalc,
  onOpenCalendar,
  onOpenEligibility,
  onOpenAddJob,
  onOpenAdminLogin,
  onOpenSSOGuide,
  onGoHome,
  latestVacancies = [],
  onSelectVacancy,
  searchQuery = '',
  setSearchQuery,
  onSelectCategory,
  selectedCategory = 'ALL',
  onOpenSubscribe,
  onOpenUrlIndexation,
}) => {
  const { user, isAdmin, logout, toggleAdminMode } = useAuth();
  const isHi = lang === 'hi';

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  // Sort vacancies by newest added/updated date so new posts appear at the front of header ribbon ticker
  const sortedVacancies = [...latestVacancies].sort((a, b) => {
    const dateA = a.createdAt || a.updatedAt || a.importantDates?.notificationDate || '';
    const dateB = b.createdAt || b.updatedAt || b.importantDates?.notificationDate || '';
    return dateB.localeCompare(dateA);
  });
  const tickerItems = sortedVacancies.slice(0, 8);
  const displayItems = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : [];

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
              {displayItems.length > 0 ? (
                displayItems.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => onSelectVacancy && onSelectVacancy(item)}
                    className="inline-flex items-center gap-2 hover:text-[#1e953a] transition text-xs font-semibold cursor-pointer group/item text-left"
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
                    <span className="text-slate-300 font-mono select-none mx-2">•</span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  {isHi ? 'नई सरकारी भर्ती एवं परिणाम सूचनाएं यहां प्रदर्शित होंगी' : 'New job announcements will scroll here'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div 
            onClick={onGoHome}
            className={`flex items-center gap-3 ${onGoHome ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
            title="Go to Home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold shadow-sm ring-1 ring-slate-800">
              <div className="text-center leading-none">
                <span className="text-[10px] block font-mono text-slate-300 font-bold">RAJ</span>
                <span className="text-xs font-black tracking-tight text-white">JOBS</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1 headlight">
                  <span className="text-slate-900">RAJASTHAN</span>
                  <span className="text-slate-900 font-extrabold">JOBS/VACANCY</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Search Component */}
            <div className="relative hidden lg:block w-48 xl:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां खोजें...' : 'Search jobs...'}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e953a] transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>


            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="Toggle Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* URL Inspection Button (Admin Only) */}
            {isAdmin && onOpenUrlIndexation && (
              <button
                onClick={onOpenUrlIndexation}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                title={isHi ? 'Google Search Console URL Inspection Assistant' : 'URL Inspection Assistant'}
                aria-label="URL Inspection and Indexation Assistant"
              >
                <Search className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span className="font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
                  {isHi ? 'URL Inspect' : 'URL Inspect'}
                </span>
              </button>
            )}

            {/* Subscribe to Alerts Button */}
            <button
              onClick={onOpenSubscribe}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1e953a] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:bg-[#187a2f] shadow-xs"
              title="Subscribe to Job Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="hidden sm:inline">{isHi ? 'अलर्ट पाएं' : 'Get Alerts'}</span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleAdminMode(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:bg-emerald-100"
                  title="Admin Mode Active"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-extrabold">{isHi ? 'Admin Active' : 'Admin'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Dropdown Drawer */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-slate-200 animate-fadeIn">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां या योजनाएं खोजें...' : 'Search jobs or schemes...'}
                className="w-full bg-slate-100 focus:bg-white text-slate-900 text-xs pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e953a] font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown Drawer with all Important Sections */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1.5 text-xs font-bold text-slate-800 animate-fadeIn bg-slate-50/95 p-3 rounded-xl shadow-xs max-h-[75vh] overflow-y-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
              {isHi ? 'वेबसाइट के मुख्य सेक्शंस' : 'Important Website Sections'}
            </div>

            {importantSections.map((sec) => {
              const isActive = selectedCategory === sec.key;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.key}
                  onClick={() => handleSectionClick(sec)}
                  className={`text-left px-3 py-2 rounded-lg transition flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? 'bg-[#1e953a] text-white font-extrabold shadow-xs' 
                      : 'hover:bg-slate-200/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1e953a]'}`} />
                    <span className="headlight">{isHi ? sec.titleHi : sec.title}</span>
                  </div>
                </button>
              );
            })}

            {/* URL Indexation Button in Mobile Menu (Admin Only) */}
            {isAdmin && onOpenUrlIndexation && (
              <button
                onClick={() => {
                  onOpenUrlIndexation();
                  setMobileMenuOpen(false);
                }}
                className="mt-1 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-between transition shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>{isHi ? 'सर्च कंसोल URL इंडेक्सेशन टूल' : 'URL Indexation Assistant'}</span>
                </div>
                <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold">
                  GSC
                </span>
              </button>
            )}

            {/* Official WhatsApp Channel Link in Mobile Menu */}
            <a
              href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-3 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center justify-between transition shadow-xs cursor-pointer"
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

      {/* Dedicated Full-Width "Important Website Sections" Navigation Bar */}
      <nav 
        aria-label="Important Website Sections"
        className="hidden md:block w-full bg-white border-t border-b border-slate-200 select-none shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start gap-2 overflow-x-auto py-2 scrollbar-none">
            {importantSections.map((sec) => {
              const isActive = selectedCategory === sec.key;
              const Icon = sec.icon;

              let buttonClasses = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ';

              if (isActive) {
                buttonClasses += 'bg-[#1e953a] text-white font-extrabold shadow-xs ';
              } else {
                buttonClasses += 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 ';
              }

              return (
                <button
                  key={sec.key}
                  onClick={() => handleSectionClick(sec)}
                  className={buttonClasses}
                  style={{
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
                  }}
                  title={isHi ? sec.titleHi : sec.title}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span className="headlight whitespace-nowrap">
                    {sec.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
