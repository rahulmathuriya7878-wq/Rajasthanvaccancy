import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LanguageMode } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess
}) => {
  const isHi = lang === 'hi';
  const { signInWithGoogle, loginWithPassword } = useAuth();
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    if (onSuccess) onSuccess();
    onClose();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginWithPassword(passwordInput)) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(isHi ? 'कृपया सही पासवर्ड दर्ज करें' : 'Please enter a valid password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isHi ? 'एडमिन पासवर्ड लॉगिन' : 'Admin Password Login'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi ? 'पासवर्ड दर्ज करके एडमिन एक्सेस करें' : 'Enter password to access admin panel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                {isHi ? 'एडमिन पासवर्ड दर्ज करें' : 'Enter Admin Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={isHi ? 'पासवर्ड दर्ज करें (उदा. कोई भी पासवर्ड)' : 'Enter password'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  autoFocus
                />
              </div>
              {errorMsg && <p className="text-rose-600 text-xs mt-1 text-left">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition cursor-pointer shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <span>🔓</span>
              <span>{isHi ? 'पासवर्ड से लॉगिन करें' : 'Login with Password'}</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Sign-in */}
          <div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="group-hover:text-amber-700 transition">{isHi ? 'Google के साथ लॉगिन करें' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Secure note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 text-left">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {isHi 
                ? 'नोट: अब आप पासवर्ड दर्ज करके आसानी से एडमिन पोर्टल में प्रवेश कर सकते हैं।' 
                : 'Note: You can now log into the admin portal easily using a password.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

