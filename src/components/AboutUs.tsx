'use client';

import React from 'react';
import { LanguageMode } from '../types';
import { Info, ArrowLeft, Target, Award, Mail, ShieldCheck } from 'lucide-react';

interface AboutUsProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang, onBack }) => {
  const isHi = lang === 'hi';

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

      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'हमारे बारे में (About Us) – Rajasthan Vacancy' : 'About Us – Rajasthan Vacancy'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isHi ? 'https://rajasthanvacancy.online | शैक्षणिक एवं करियर सूचना पोर्टल' : 'https://www.rajasthanvacancy.online | Educational & Career Information Portal'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p className="text-sm font-medium leading-relaxed text-slate-800">
            {isHi
              ? 'Rajasthan Vacancy (https://rajasthanvacancy.online) पर आपका स्वागत है। यह एक समर्पित शैक्षणिक (Educational) और करियर सूचना पोर्टल है, जिसे राजस्थान और पूरे भारत के छात्रों व नौकरी की तलाश कर रहे उम्मीदवारों को नवीनतम रोजगार अवसरों की जानकारी देने के उद्देश्य से बनाया गया है।'
              : 'Welcome to Rajasthan Vacancy (https://www.rajasthanvacancy.online). It is a dedicated educational and career information portal created to provide the latest employment opportunities to students and job seekers across Rajasthan and India.'}
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{isHi ? 'हम क्या करते हैं' : 'What We Do'}</span>
          </h2>
          <p>
            {isHi
              ? 'सरकारी भर्तियों के आधिकारिक नोटिफिकेशन को समझना कई बार कठिन होता है। Rajasthan Vacancy पर हम RPSC, RSSB (RSMSSB), राजस्थान पुलिस, हाई कोर्ट, शिक्षक भर्ती बोर्ड और केंद्र सरकार के विभागों की आधिकारिक अधिसूचनाओं को सरल, स्पष्ट और व्यवस्थित हिंदी भाषा में प्रस्तुत करते हैं।'
              : 'Understanding official government recruitment notifications can often be complex. At Rajasthan Vacancy, we present official notifications from RPSC, RSSB (RSMSSB), Rajasthan Police, High Court, Teacher Recruitment Boards, and Central Government departments in simple, clear, and structured Hindi.'}
          </p>
          <p className="font-semibold text-slate-900 pt-1">
            {isHi ? 'हमारे प्लेटफॉर्म पर आपको निम्नलिखित जानकारियां मिलती हैं:' : 'On our platform, you get the following information:'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{isHi ? 'नवीनतम राज्य और केंद्र सरकार की भर्ती अधिसूचनाएं (Latest Vacancy Notifications)' : 'Latest State & Central Government Vacancy Notifications'}</li>
            <li>{isHi ? 'परीक्षा तिथियां, सिलेबस और एग्जाम पैटर्न (Exam Dates & Syllabus)' : 'Exam Dates, Syllabus & Exam Patterns'}</li>
            <li>{isHi ? 'एडमिट कार्ड और परीक्षा परिणाम अपडेट्स (Admit Card & Results)' : 'Admit Card & Exam Result Updates'}</li>
            <li>{isHi ? 'आवेदन करने की प्रक्रिया और पात्रता (Eligibility & How to Apply)' : 'Eligibility Criteria & Application Process'}</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{isHi ? 'हमारा उद्देश्य (Our Mission)' : 'Our Mission'}</span>
          </h2>
          <p>
            {isHi
              ? 'हमारा लक्ष्य उम्मीदवारों तक तेज़, सटीक और आसान भाषा में करियर से जुड़ी हर जरूरी अपडेट पहुंचाना है, ताकि कोई भी योग्य अभ्यर्थी किसी महत्वपूर्ण अवसर या अंतिम तिथि से वंचित न रहे।'
              : 'Our goal is to deliver fast, accurate, and easy-to-understand career updates so that no deserving candidate misses an important opportunity or application deadline.'}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>{isHi ? 'नोट:' : 'Note:'}</strong>{' '}
              {isHi
                ? 'Rajasthan Vacancy एक स्वतंत्र सूचनात्मक वेबसाइट है और इसका किसी भी सरकारी संस्था से कोई संबंध नहीं है। हम हर लेख में आधिकारिक वेबसाइट का लिंक देते हैं ताकि उम्मीदवार सीधे आधिकारिक स्रोत से जानकारी की पुष्टि कर सकें।'
                : 'Rajasthan Vacancy is an independent informational website and has no affiliation with any government organization. We provide official website links in every article so candidates can verify information directly from the official source.'}
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{isHi ? 'संपर्क करें' : 'Contact Us'}</span>
          </h2>
          <p>
            {isHi ? (
              <>
                यदि आपका कोई सुझाव, प्रश्न या शिकायत है, तो आप हमें{' '}
                <a href="mailto:rahulmathuriya7878@gmail.com" className="font-mono font-bold text-amber-700 hover:underline">
                  rahulmathuriya7878@gmail.com
                </a>{' '}
                पर ईमेल कर सकते हैं।
              </>
            ) : (
              <>
                If you have any suggestions, questions, or complaints, you can email us at{' '}
                <a href="mailto:rahulmathuriya7878@gmail.com" className="font-mono font-bold text-amber-700 hover:underline">
                  rahulmathuriya7878@gmail.com
                </a>.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
};
