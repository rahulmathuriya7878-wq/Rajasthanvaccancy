import React from 'react';
import { 
  Bell, 
  ExternalLink, 
  ShieldCheck,
  Send,
  MessageCircle,
  LogIn,
  User as UserIcon,
  HelpCircle
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
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const isHi = lang === 'hi';

  // Take top 8 latest added vacancies/schemes to display in the ticker
  const tickerItems = latestVacancies.slice(0, 8);

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
              {tickerItems.length > 0 ? (
                tickerItems.map((item, idx) => (
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
              href="https://whatsapp.com" 
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
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>RAJASTHAN</span>
                  <span className="text-amber-600">VACCANCY/JOBS</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {isHi ? 'भर्ती पोर्टल 2025' : 'Official Alerts'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isHi 
                  ? 'राजस्थान सरकारी भर्तियां, प्रवेश पत्र, आंसर की व परिणाम अपडेट्स'
                  : 'Rajasthan & Central Govt Job Notifications, Admit Card & Results'}
              </p>
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* FAQ Quick Link */}
            <a 
              href="#faq-section" 
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('faq-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-amber-700 hover:bg-amber-50 transition border border-slate-200 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? 'FAQ' : 'FAQ'}</span>
            </a>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(isHi ? 'en' : 'hi')}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 cursor-pointer"
              title={isHi ? 'Switch to English' : 'हिंदी में बदलें'}
            >
              {isHi ? 'English' : 'हिंदी'}
            </button>

            {/* User Account / Google Sign-In */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[120px] truncate">
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
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>{isHi ? 'Google लॉगिन' : 'Google Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
