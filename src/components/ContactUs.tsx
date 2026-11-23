'use client';

import React from 'react';
import { LanguageMode } from '../types';
import { Mail, ArrowLeft, Send, MapPin, Clock, Globe } from 'lucide-react';

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
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
      </button>

      <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'संपर्क करें (Contact Us) – Rajasthan Vacancy' : 'Contact Us – Rajasthan Vacancy'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isHi ? 'हमसे संपर्क करें (Get in Touch) | https://rajasthanvacancy.online' : 'Get in Touch | https://www.rajasthanvacancy.online'}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
        {isHi
          ? 'यदि आपके पास Rajasthan Vacancy (https://rajasthanvacancy.online) पर प्रकाशित किसी भर्ती, परीक्षा तिथि, एडमिट कार्ड या परिणाम से जुड़ा कोई प्रश्न, सुझाव, या सुधार (Correction) है, तो आप बेझिझक हमसे संपर्क कर सकते हैं। हमारी टीम जल्द से जल्द आपके संदेश का उत्तर देने का प्रयास करेगी।'
          : 'If you have any question, suggestion, or correction regarding any recruitment, exam date, admit card, or result published on Rajasthan Vacancy (https://www.rajasthanvacancy.online), feel free to reach out. Our team will respond as soon as possible.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
          <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2">
            {isHi ? 'संपर्क विवरण (Contact Details)' : 'Contact Details'}
          </h2>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'ईमेल (Email):' : 'Email:'}</strong>
              <a href="mailto:rahulmathuriya7878@gmail.com" className="font-mono text-amber-700 hover:underline break-all font-semibold">
                rahulmathuriya7878@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'वेबसाइट (Website):' : 'Website:'}</strong>
              <a
                href="https://www.rajasthanvacancy.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 hover:underline break-all font-medium"
              >
                https://rajasthanvacancy.online
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'स्थान (Location):' : 'Location:'}</strong>
              <span>Rajasthan, India</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">{isHi ? 'कार्य समय (Response Time):' : 'Response Time:'}</strong>
              <span>{isHi ? 'सामान्यतः 24 से 48 कार्य घंटों के भीतर' : 'Usually within 24 to 48 working hours'}</span>
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
                {isHi ? 'हमारी सपोर्ट टीम सामान्यतः 24 से 48 कार्य घंटों के भीतर आपके ईमेल पर उत्तर देगी।' : 'Our support team will typically reply within 24 to 48 working hours.'}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
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
