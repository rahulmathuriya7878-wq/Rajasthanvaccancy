'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  X,
  KeyRound,
  Search,
  LogOut,
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
  onOpenUrlIndexation?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  onOpenUrlIndexation,
}) => {
  const isHi = lang === 'hi';
  const { isAdmin, loginWithPasscode, logout } = useAuth();
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [passcodeLoading, setPasscodeLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPasscodeLoading(true);
    try {
      const res = await loginWithPasscode(passwordInput);
      if (res.ok) {
        setPasswordInput('');
        if (onSuccess) onSuccess();
        onClose();
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
                    ? 'एडमिन लॉगिन (Admin Login)'
                    : 'Admin Login'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAdmin
                  ? isHi
                    ? 'एडमिन डैशबोर्ड (/admin) खोलें और URL इंडेक्स कराएं'
                    : 'Open Admin Dashboard (/admin) & manage indexing'
                  : isHi
                    ? 'एडमिन मोड अनलॉक करने के लिए पासवर्ड दर्ज करें'
                    : 'Enter admin password to unlock admin controls'}
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
              {/* Direct Quick Actions */}
              <div className="space-y-2.5 pt-1">

                <Link
                  href="/admin"
                  onClick={onClose}
                  className="no-link-color w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs no-underline"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? 'प्रो एडमिन डैशबोर्ड खोलें (/admin)' : 'Open Full Admin Dashboard (/admin)'}</span>
                </Link>

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
              {errorMsg && (
                <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-left font-medium">
                  {errorMsg}
                </p>
              )}

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
