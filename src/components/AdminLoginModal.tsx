'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  X,
  KeyRound,
  Cloud,
  CloudOff,
  PlusCircle,
  Search,
  LogOut,
  CheckCircle2,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LanguageMode } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  onSuccess?: () => void;
  onOpenAddVacancy?: () => void;
  onOpenUrlIndexation?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  onOpenAddVacancy,
  onOpenUrlIndexation,
}) => {
  const isHi = lang === 'hi';
  const { user, isAdmin, isCloudAdmin, signInWithGoogle, loginWithPasscode, logout } = useAuth();
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.ok) {
        if (onSuccess) onSuccess();
        if (!onOpenAddVacancy) {
          onClose();
        }
      } else {
        setErrorMsg(res.error || (isHi ? 'Google लॉगिन पूरा नहीं हो सका।' : 'Google sign-in failed.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPasscodeLoading(true);
    try {
      const res = await loginWithPasscode(passwordInput);
      if (res.ok) {
        setPasswordInput('');
        if (onSuccess) onSuccess();
        if (!onOpenAddVacancy) {
          onClose();
        }
      } else {
        setErrorMsg(
          res.error || (isHi ? 'कृपया सही पासकोड दर्ज करें' : 'Please enter a valid admin passcode')
        );
      }
    } finally {
      setPasscodeLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-panel-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-login-panel-title" className="font-bold text-lg text-white">
                {isAdmin
                  ? isHi
                    ? 'एडमिन कंट्रोल पैनल (Admin Panel)'
                    : 'Admin Control Panel'
                  : isHi
                    ? 'एडमिन लॉगिन (Cloud Sync)'
                    : 'Admin Login (Cloud Sync)'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAdmin
                  ? isHi
                    ? 'नई भर्ती जोड़ें, लाइव Firebase पब्लिश करें और URL इंडेक्स कराएं'
                    : 'Publish new vacancies live to Firebase & manage indexing'
                  : isHi
                    ? 'नई पोस्ट व इन-प्लेस अपडेट सभी फोन पर लाइव करने के लिए लॉगिन करें'
                    : 'Sign in to publish new posts & edits live across all devices'}
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
        <div className="p-6 space-y-4">
          {isAdmin ? (
            <>
              {/* Logged-in Admin Cloud Sync Status */}
              {isCloudAdmin ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950">
                    <div className="font-extrabold">
                      {isHi ? 'Firebase Live Cloud Sync सक्रिय' : 'Firebase Live Cloud Sync Active'}
                    </div>
                    <p className="text-emerald-800 mt-0.5">
                      {user?.email || 'Verified Admin'} —{' '}
                      {isHi
                        ? 'अब आप सीधे नई भर्ती जोड़कर सभी मोबाइल पर लाइव पब्लिश कर सकते हैं।'
                        : 'You can now publish new posts directly to all devices.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-amber-950">
                    <CloudOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">
                      {isHi
                        ? 'आप अभी लोकल एडमिन मोड में हैं। सभी यूज़र्स को लाइव नई पोस्ट दिखाने के लिए Google एडमिन खाते से कनेक्ट करें।'
                        : 'Local admin mode active. Connect Google Admin account to publish live to all devices.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    <span>{isHi ? 'Google क्लाउड सिंक चालू करें' : 'Enable Google Cloud Sync'}</span>
                  </button>
                </div>
              )}

              {errorMsg && (
                <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-left font-medium">
                  {errorMsg}
                </p>
              )}

              {/* Direct Quick Actions */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="no-link-color w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 !text-white font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm no-underline"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? 'प्रो एडमिन डैशबोर्ड खोलें (/admin)' : 'Open Full Admin Dashboard (/admin)'}</span>
                </Link>

                {onOpenAddVacancy && (
                  <button
                    type="button"
                    onClick={onOpenAddVacancy}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isHi ? 'क्विक नई भर्ती फॉर्म (Modal)' : 'Quick Add Vacancy Modal'}</span>
                  </button>
                )}

                {onOpenUrlIndexation && (
                  <button
                    type="button"
                    onClick={onOpenUrlIndexation}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>{isHi ? 'Google URL Inspection & Auto-Index' : 'Open URL Inspection Tool'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHi ? 'एडमिन लॉगआउट करें (Logout)' : 'Logout Admin Mode'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Recommended Google Sign-In for Cross-Device Cloud Sync */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2 text-xs text-emerald-950 text-left">
                  <Cloud className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    {isHi
                      ? 'नई भर्ती सीधे पब्लिश करने और सभी फोन पर रियल-टाइम अपडेट (Cloud Sync) दिखाने के लिए अपने एडमिन Google खाते (rahulmathuriya7878@gmail.com) से लॉगिन करें।'
                      : 'Sign in with your admin Google account to publish new vacancies and edits live across all phones and browsers.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>
                    {googleLoading
                      ? isHi
                        ? 'Google लॉगिन हो रहा है...'
                        : 'Signing in...'
                      : isHi
                        ? 'Google से लॉगिन करें (Live Firebase Sync)'
                        : 'Sign in with Google (Live Sync)'}
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
                  disabled={passcodeLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {passcodeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {passcodeLoading
                      ? isHi
                        ? 'सत्यापित हो रहा है...'
                        : 'Verifying...'
                      : isHi
                        ? 'पासकोड से एडमिन मोड खोलें'
                        : 'Unlock Admin Mode'}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
