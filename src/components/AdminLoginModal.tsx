import React, { useState } from 'react';
import { ShieldCheck, KeyRound, X, LogIn, Lock, Sparkles } from 'lucide-react';
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
  if (!isOpen) return null;
  const isHi = lang === 'hi';
  const { signInWithGoogle, loginWithAdminPin } = useAuth();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginWithAdminPin(pin);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(isHi ? 'गलत पासकोड! कृपया सही पिन दर्ज करें (उदा. admin123)' : 'Invalid passcode! Please enter valid admin pin (e.g. admin123)');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    if (onSuccess) onSuccess();
    onClose();
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
                {isHi ? 'एडमिन लॉगिन सिस्टम' : 'Admin Login System'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi ? 'पोस्ट निर्माण एवं संशोधन अधिकार' : 'Post Creation & Modification Access'}
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
        <div className="p-6 space-y-5">
          {/* Option 1: Admin Passcode */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isHi ? '1. एडमिन पिन / पासकोड से लॉगिन करें:' : '1. Enter Admin PIN / Passcode:'}
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={isHi ? 'एडमिन पासवर्ड दर्ज करें (उदा. admin123)' : 'Enter Admin Pin (e.g. admin123)'}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-bold outline-none text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isHi ? 'एडमिन पैनल अनलॉक करें' : 'Unlock Admin Panel'}</span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 font-bold uppercase">
              {isHi ? 'अथवा' : 'OR'}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Option 2: Google Sign-in */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {isHi ? '2. अधिकृत Google खाते से लॉगिन करें:' : '2. Sign in with Admin Google Account:'}
            </label>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'गूगल एडमिन खाते से साइन-इन करें' : 'Sign In with Google Admin'}</span>
            </button>
          </div>

          {/* Passcode hint note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {isHi 
                ? 'एडमिन पासवर्ड (Passcode): `admin123` दर्ज करके तुरंत पोस्ट बनाने एवं संपादित करने के अधिकार प्राप्त करें।' 
                : 'Default Admin Passcode: `admin123` to immediately post or edit any vacancy or scheme.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
