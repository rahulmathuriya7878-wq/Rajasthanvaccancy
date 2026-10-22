import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { LanguageMode } from '../types';

interface SubscribeAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
}

export const SubscribeAlertsModal: React.FC<SubscribeAlertsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isHi = lang === 'hi';
  const [category, setCategory] = useState('all');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem('raj_alert_subscribed_v1', 'true');
      localStorage.setItem('raj_subscriber_info', JSON.stringify({ category, date: new Date().toISOString() }));
    } catch (err) {}

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xs overflow-hidden relative">
        {/* Header gradient bar */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Bell className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {isHi ? 'जॉब अलर्ट सब्स्क्रिप्शन' : 'Job Alerts'}
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                {isHi ? 'नई वैकेंसी की सूचना पाएं' : 'Get instant alerts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isHi ? 'सब्स्क्रिप्शन सक्रिय!' : 'Subscribed!'}
              </h4>
              <p className="text-xs text-slate-600">
                {isHi 
                  ? 'अब नई नौकरियों पर "NEW" बैज दिखेगा।' 
                  : 'You will now see "NEW" badges on fresh posts.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {isHi ? 'पसंदीदा श्रेणी चुनें (Category):' : 'Select Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                >
                  <option value="all">{isHi ? 'सभी सरकारी नौकरियां (All Jobs)' : 'All Government Jobs'}</option>
                  <option value="teaching">{isHi ? 'शिक्षक भर्तियां (Teacher / REET)' : 'Teaching Exams'}</option>
                  <option value="rsmssb">{isHi ? 'RSMSSB / अधीनस बोर्ड' : 'RSMSSB Recruitment'}</option>
                  <option value="rpsc">{isHi ? 'RPSC आरपीएससी' : 'RPSC Exams'}</option>
                  <option value="high_court">{isHi ? 'हाई कोर्ट / जिला न्यायालय' : 'High Court / Judiciary'}</option>
                  <option value="police">{isHi ? 'राजस्थान पुलिस' : 'Rajasthan Police'}</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isHi ? 'सब्स्क्राइब करें (Subscribe)' : 'Subscribe'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center space-y-1.5">
                <p className="text-[11px] text-slate-500 font-medium">
                  {isHi ? 'या सीधे WhatsApp पर जॉब अलर्ट पाएं:' : 'Or get instant alerts on WhatsApp:'}
                </p>
                <a
                  href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>WhatsApp चैनल जॉइन करें</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
