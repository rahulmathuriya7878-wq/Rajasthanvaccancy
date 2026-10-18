import React from 'react';
import { 
  Bell, 
  ExternalLink, 
  ShieldCheck,
  Send,
  MessageCircle,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LanguageMode } from '../types';

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
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const isHi = lang === 'hi';

  const marqueeAlerts = isHi ? [
    '⚡ राजस्थान सरकारी भर्ती एवं परीक्षा परिणाम पोर्टल (RAJASTHAN VACCANCY/JOBS) पर आपका स्वागत है',
    '📢 राजस्थान कर्मचारी चयन बोर्ड (RSMSSB) एवं राजस्थान लोक सेवा आयोग (RPSC) की आधिकारिक सूचनाएं',
    '🔔 नई सरकारी भर्ती, प्रवेश पत्र एवं परिणाम सूचनाएं प्रकाशित होने पर यहां प्रदर्शित की जाएंगी'
  ] : [
    '⚡ Welcome to RAJASTHAN VACCANCY/JOBS Portal',
    '📢 Official recruitment updates for RSMSSB, RPSC, Police & State Departments',
    '🔔 New job notifications and results will appear here as soon as announced'
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* Top Flash Bar / Live Ticker */}
      <div className="bg-amber-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0 bg-amber-700/80 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2-h-2 rounded-full bg-red-400 animate-ping inline-block"></span>
            <Bell className="w-3.5 h-3.5" />
            <span>{isHi ? 'भर्ती सूचना' : 'Alerts'}</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 relative group cursor-pointer">
            <div className="inline-block animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
              {marqueeAlerts.join('  •  ')}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0 text-xs">
            <a 
              href="https://sso.rajasthan.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition"
              title="Rajasthan SSO Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span>SSO Login</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a 
              href="https://telegram.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-sky-500/80 hover:bg-sky-500 px-2 py-0.5 rounded transition text-white"
            >
              <Send className="w-3 h-3" />
              <span>Telegram</span>
            </a>

            <a 
              href="https://whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded transition text-white"
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

          {/* User Account / Google Sign-In */}
          <div className="flex items-center gap-2">
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
