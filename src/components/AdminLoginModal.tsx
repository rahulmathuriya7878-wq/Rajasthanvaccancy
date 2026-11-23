'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || (isHi ? 'Google लॉगिन पूरा नहीं हो सका।' : 'Google sign-in failed.'));
      }
    } finally {
      setGoogleLoading(false);
    }
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isHi ? 'एडमिन लॉगिन (Cloud Sync)' : 'Admin Login (Cloud Sync)'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi ? 'वर्ड इन-प्लेस एडिट अपडेट सभी फोन पर लाइव करने के लिए लॉगिन करें' : 'Sign in to sync Word In-Place edits live across all devices'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Recommended Google Sign-In for Cross-Device Cloud Sync */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2 text-xs text-emerald-950 text-left">
              <Cloud className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">
                {isHi
                  ? 'सभी फोन और डिवाइस पर रियल-टाइम अपडेट (Cloud Sync) दिखाने के लिए अपने एडमिन Google खाते (rahulmathuriya7878@gmail.com) से लॉगिन करें।'
                  : 'Sign in with your admin Google account to publish Word In-Place edits live across all phones and browsers.'}
              </p>
            </div>
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>
                {googleLoading
                  ? (isHi ? 'Google लॉगिन हो रहा है...' : 'Signing in...')
                  : (isHi ? 'Google से लॉगिन करें (सभी फोन सिंक)' : 'Sign in with Google (Cloud Sync)')}
              </span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-left font-medium">
              {errorMsg}
            </p>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold">
              {isHi ? 'या लोकल पासवर्ड' : 'OR LOCAL PASSWORD'}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
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
                  placeholder={isHi ? 'एडमिन पासवर्ड दर्ज करें' : 'Enter admin password'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isHi ? 'पासवर्ड से एडमिन मोड खोलें (केवल लोकल)' : 'Unlock Local Admin Mode'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
