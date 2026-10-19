import React from 'react';
import { LanguageMode } from '../types';
import { Mail, ArrowLeft, Send, MapPin, Phone, Clock, MessageSquare } from 'lucide-react';

interface ContactUsProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ lang, onBack }) => {
  const isHi = lang === 'hi';
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-2xl shadow-xs border border-slate-200 my-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
      </button>

      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'संपर्क करें (Comprehensive Contact Us & Support)' : 'Comprehensive Contact Us & Support'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isHi ? 'प्रश्नों, सुझावों, भर्ती रिपोर्टिंग या विज्ञापनों के लिए संपर्क करें' : 'Get in touch with our editorial team'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'कार्यालय का पता:' : 'Editorial Office:'}</strong>
              <span>{isHi ? 'जयपुर, राजस्थान (302015)' : 'Jaipur, Rajasthan, India'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'आधिकारिक ईमेल:' : 'Official Email:'}</strong>
              <span className="font-mono text-amber-700">support@rajasthanvacancy.in</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'सहायता का समय:' : 'Support Hours:'}</strong>
              <span>{isHi ? 'सोमवार - शनिवार (सुबह 10:00 से शाम 6:00)' : 'Mon - Sat (10:00 AM - 6:00 PM)'}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center text-xl font-bold">✓</div>
              <h3 className="text-base font-bold text-emerald-900">
                {isHi ? 'आपका संदेश प्राप्त हो गया है!' : 'Your message has been received!'}
              </h3>
              <p className="text-xs text-emerald-700">
                {isHi ? 'हमारी सपोर्ट टीम 24 घंटे के भीतर आपके ईमेल पर उत्तर देगी।' : 'Our support team will reply within 24 hours.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
              >
                {isHi ? 'दूसरा संदेश भेजें' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'आपका नाम (Your Name)' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isHi ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'ईमेल आईडी (Email Address)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'विषय (Subject / Query Type)' : 'Subject / Query Type'}
                </label>
                <select className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white">
                  <option>{isHi ? 'भर्ती अपडेट या त्रुटि सुधार' : 'Recruitment Update or Correction'}</option>
                  <option>{isHi ? 'तकनीकी सहायता (Website Issue)' : 'Technical Support'}</option>
                  <option>{isHi ? 'विज्ञापन या प्रायोजन (Advertising)' : 'Advertising / Sponsorship'}</option>
                  <option>{isHi ? 'अन्य सामान्य पूछताछ' : 'General Inquiry'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'विस्तृत संदेश (Detailed Message)' : 'Detailed Message'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={isHi ? 'अपनी समस्या या सुझाव यहां विस्तार से लिखें...' : 'Type your detailed message here...'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isHi ? 'संदेश सबमिट करें' : 'Submit Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
