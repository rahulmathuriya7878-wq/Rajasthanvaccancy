import React from 'react';
import { 
  Bell, 
  ExternalLink, 
  ShieldCheck,
  Send,
  MessageCircle,
  LogIn,
  User as UserIcon,
  HelpCircle,
  Search,
  X,
  Menu
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
  onOpenSSOGuide: () => void;
  onGoHome?: () => void;
  latestVacancies?: VacancyItem[];
  onSelectVacancy?: (item: VacancyItem) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
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
  onOpenSSOGuide,
  onGoHome,
  latestVacancies = [],
  onSelectVacancy,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const isHi = lang === 'hi';

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Take top 8 latest added vacancies/schemes to display in the ticker
  const tickerItems = latestVacancies.slice(0, 8);
  const displayItems = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : [];

  return (
    <header className="w-full bg-white shadow-xs border-b border-slate-200 sticky top-0 z-40">
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

          {/* Right Quick Links */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0 text-xs">
            <a 
              href="https://sso.rajasthan.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded transition text-[11px] font-semibold"
              title="Rajasthan SSO Portal"
            >
              <ShieldCheck className="w-3 h-3 text-amber-200" />
              <span>SSO Login</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a 
              href="https://telegram.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-sky-500/80 hover:bg-sky-500 px-2 py-0.5 rounded transition text-white text-[11px] font-semibold"
            >
              <Send className="w-3 h-3" />
              <span>Telegram</span>
            </a>

            <a 
              href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded transition text-white text-[11px] font-semibold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
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
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'होम (Home)' : 'Home'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'नवीनतम (Latest)' : 'Latest'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'नौकरियां (Latest Jobs)' : 'Latest Jobs'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
              }}
              className="px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Card'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
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

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

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

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 text-xs font-bold text-slate-700 animate-fadeIn">
            {/* Mobile Search Bar */}
            <div className="relative w-full mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder={isHi ? 'भर्तियां खोजें...' : 'Search jobs...'}
                className="w-full bg-slate-100 focus:bg-white text-slate-900 text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {isHi ? 'होम (Home)' : 'Home'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {isHi ? 'नवीनतम (Latest)' : 'Latest'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {isHi ? 'नौकरियां (Latest Jobs)' : 'Latest Jobs'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Card'}
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {isHi ? 'परिणाम (Results)' : 'Results'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
