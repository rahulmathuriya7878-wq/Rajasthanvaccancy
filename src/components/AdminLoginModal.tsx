import React from 'react';
import { ShieldCheck, X, LogIn, Sparkles } from 'lucide-react';
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
  const { signInWithGoogle } = useAuth();

  if (!isOpen) return null;

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
                {isHi ? 'एडमिन गूगल लॉगिन' : 'Admin Google Login'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi ? 'केवल गूगल अकाउंट से एडमिन एक्सेस' : 'Admin access via Google Account only'}
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
        <div className="p-6 space-y-6 text-center">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-base">
              {isHi ? 'अपने गूगल अकाउंट से एडमिन लॉगिन करें' : 'Sign in as Admin using your Google Account'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHi
                ? 'सुरक्षा कारणों से एडमिन पैनल तक पहुँचने के लिए केवल Google Authentication की अनुमति है।'
                : 'For security reasons, admin access is restricted exclusively to authorized Google accounts.'}
            </p>
          </div>

          {/* Google Sign-in */}
          <div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-3 cursor-pointer shadow-sm group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="group-hover:text-amber-700 transition">{isHi ? 'Google के साथ जारी रखें (Sign In)' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Secure note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 text-left">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {isHi 
                ? 'नोट: पिन या पासवर्ड लॉगिन अब बंद कर दिया गया है। केवल गूगल लॉगिन मान्य है।' 
                : 'Note: PIN and passcode login has been disabled. Only Google account authentication is accepted.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

