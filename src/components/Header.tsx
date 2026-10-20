import React from 'react';
import { 
  Bell, 
  ExternalLink, 
  ShieldCheck,
  PlusCircle,
  Send,
  MessageCircle,
  LogIn,
  User as UserIcon,
  HelpCircle,
  Search,
  X,
  Menu,
  RefreshCw
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
  onSyncRSS?: () => void;
  isSyncing?: boolean;
  onOpenSubscribe?: () => void;
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
  onSyncRSS,
  isSyncing = false,
  onOpenSubscribe,
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

  return (
    <header className="w-full bg-white shadow-xs border-b border-slate-200 sticky top-0 z-40 text-base">
      {/* Top Scrolling Ticker Bar for Latest Added Posts */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs font-medium py-1.5 px-3 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Badge */}
          <div className="flex items-center gap-1.5 shrink-0 bg-black/25 hover:bg-black/35 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border border-white/20 select-none">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block"></span>
            <Bell className="w-3.5 h-3.5 text-amber-200" />
            <span>{isHi ? 'नवीनतम सूचनाएं' : 'Latest Posts'}</span>
          </div>

          {/* Marquee Ticker with latest added posts */}
          <div className="overflow-hidden whitespace-nowrap flex-1 relative group">
            <div className="animate-marquee inline-flex items-center gap-6">
              {displayItems.length > 0 ? (
                displayItems.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => onSelectVacancy && onSelectVacancy(item)}
                    className="inline-flex items-center gap-2 hover:text-amber-200 transition text-xs font-semibold cursor-pointer group/item text-left"
                    title={isHi ? item.titleHi : item.title}
                  >
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-amber-100">
                      {item.organization || (isHi ? 'भर्ती' : 'Job')}
                    </span>
                    <span className="group-hover/item:underline underline-offset-2">
                      {isHi ? (item.titleHi || item.title) : item.title}
                    </span>
                    {typeof item.totalPosts === 'number' && item.totalPosts > 0 && (
                      <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full">
                        {item.totalPosts} {isHi ? 'पद' : 'Posts'}
                      </span>
                    )}
                    <span className="text-white/40 font-mono select-none mx-2">•</span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-white/90">
                  {isHi ? 'नई सरकारी भर्ती एवं परिणाम सूचनाएं यहां प्रदर्शित होंगी' : 'New job announcements will scroll here'}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Branding & Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div 
            onClick={onGoHome}
            className={`flex items-center gap-3 ${onGoHome ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
            title="Go to Home"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/20 ring-2 ring-amber-400/40">
              <div className="text-center leading-none">
                <span className="text-[10px] block font-mono text-amber-200 font-bold">RAJ</span>
                <span className="text-xs font-black tracking-tight">JOBS</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                  <span>RAJASTHAN</span>
                  <span className="text-amber-600">VACCANCY/JOBS</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-bold text-slate-700">
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('ALL');
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'होम (Home)' : 'Home'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('latest_job');
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'नवीनतम (Latest)' : 'Latest'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('latest_job');
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'नौकरियां (Latest Jobs)' : 'Latest Jobs'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('latest_job');
              }}
              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 transition cursor-pointer font-extrabold border border-rose-200"
            >
              {isHi ? '📰 लेटेस्ट न्यूज़ (Latest News)' : '📰 Latest News'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('scheme');
              }}
              className="px-3 py-2 rounded-lg bg-amber-100/70 text-amber-900 hover:bg-amber-200 transition cursor-pointer font-extrabold border border-amber-300/60"
            >
              {isHi ? 'सरकारी योजना (Yojana)' : 'Government Yojana'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('admit_card');
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Card'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('result');
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'परिणाम (Results)' : 'Results'}
            </button>
          </nav>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Search Component */}
            <div className="relative hidden lg:block w-48 xl:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां खोजें...' : 'Search jobs...'}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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
              <Search className="w-5 h-5" />
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

            {/* Subscribe to Alerts Button */}
            <button
              onClick={onOpenSubscribe}
              className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:bg-amber-200 shadow-xs"
              title="Subscribe to Job Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span className="hidden sm:inline">{isHi ? '🔔 अलर्ट सब्स्क्राइब' : 'Subscribe'}</span>
            </button>

            {/* Admin Controls / Post Creation - Shown ONLY when Admin is active */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAddJob}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-amber-600/30"
                  title="Post New Job or Scheme"
                >
                  <PlusCircle className="w-4 h-4 text-amber-100" />
                  <span className="hidden sm:inline">{isHi ? '+ नई पोस्ट जोड़ें' : '+ Add Post'}</span>
                  <span className="sm:hidden">{isHi ? '+ पोस्ट' : '+ Post'}</span>
                </button>

                <button
                  onClick={() => toggleAdminMode(false)}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer hover:bg-emerald-100"
                  title="Admin Mode Active (Click to logout/lock)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline">{isHi ? 'एडमिन (सक्रिय)' : 'Admin (Active)'}</span>
                </button>
              </div>
            )}

            {/* User Account / Profile */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-[11px] text-slate-500 hover:text-red-600 font-medium ml-1 transition cursor-pointer"
                  title="लॉगआउट"
                >
                  {isHi ? 'लॉगआउट' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Dropdown Drawer */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 animate-fadeIn">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां या योजनाएं खोजें...' : 'Search jobs or schemes...'}
                className="w-full bg-slate-100 focus:bg-white text-slate-900 text-xs pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 text-sm font-bold text-slate-800 animate-fadeIn bg-slate-50/90 p-3 rounded-xl shadow-xs">
            {/* Mobile Search Bar */}
            <div className="relative w-full mb-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां या योजनाएं खोजें...' : 'Search jobs or schemes...'}
                className="w-full bg-white text-slate-900 text-xs pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('ALL');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg hover:bg-amber-100/70 hover:text-amber-900 transition flex items-center justify-between"
            >
              <span>{isHi ? '🏠 होम (Home)' : '🏠 Home'}</span>
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('latest_job');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg hover:bg-amber-100/70 hover:text-amber-900 transition"
            >
              {isHi ? '🔥 नवीनतम भर्तियां (Latest Jobs)' : '🔥 Latest Jobs'}
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('latest_job');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg bg-rose-100/80 text-rose-900 font-extrabold shadow-xs hover:bg-rose-200 transition flex items-center justify-between"
            >
              <span>{isHi ? '📰 लेटेस्ट न्यूज़ (Latest News)' : '📰 Latest News'}</span>
              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold uppercase">HOT</span>
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('scheme');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-black shadow-xs hover:bg-amber-600 transition flex items-center justify-between"
            >
              <span>{isHi ? '🏛️ सरकारी योजना (Government Yojana)' : '🏛️ Government Yojana'}</span>
              <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">NEW</span>
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('admit_card');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg hover:bg-amber-100/70 hover:text-amber-900 transition"
            >
              {isHi ? '🎟️ प्रवेश पत्र (Admit Card)' : '🎟️ Admit Card'}
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (onSelectCategory) onSelectCategory('result');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 rounded-lg hover:bg-amber-100/70 hover:text-amber-900 transition"
            >
              {isHi ? '🏆 परिणाम (Results)' : '🏆 Results'}
            </button>

          </nav>
        )}
      </div>
    </header>
  );
};
