'use client';

import React from 'react';
import { LanguageMode } from '../types';
import { ShieldCheck, ArrowLeft, Lock, Database, FileText, Globe, Users, CheckCircle2, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  lang: LanguageMode;
  onBack: () => void;
  onOpenAdminLogin?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang, onBack, onOpenAdminLogin }) => {
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
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'गोपनीयता नीति (Privacy Policy) – Rajasthan Vacancy' : 'Privacy Policy – Rajasthan Vacancy'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isHi ? 'अंतिम अपडेट: 22 नवंबर 2026 | https://rajasthanvacancy.online' : 'Last Updated: 22 November 2026 | https://www.rajasthanvacancy.online'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p>
            {isHi
              ? 'Rajasthan Vacancy (https://rajasthanvacancy.online) पर हमारे विज़िटर्स की गोपनीयता (Privacy) हमारे लिए अत्यंत महत्वपूर्ण है। इस दस्तावेज़ में बताया गया है कि हमारी वेबसाइट किस प्रकार की जानकारी एकत्र करती है और उसका उपयोग कैसे किया जाता है।'
              : 'At Rajasthan Vacancy (https://www.rajasthanvacancy.online), the privacy of our visitors is extremely important to us. This document outlines the types of information collected and how it is used.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
            <span>1. हम कौन-सी जानकारी एकत्र करते हैं</span>
          </h2>
          <p>
            {isHi
              ? 'हमारी वेबसाइट पर नौकरी से जुड़ी जानकारी पढ़ने के लिए आपको किसी प्रकार का रजिस्ट्रेशन करने या व्यक्तिगत जानकारी देने की आवश्यकता नहीं है। यदि आप हमें सीधे ईमेल या संपर्क फ़ॉर्म (Contact Form) के माध्यम से संदेश भेजते हैं, तो हम केवल आपके प्रश्न का उत्तर देने के लिए आपका नाम, ईमेल पता और संदेश प्राप्त कर सकते हैं।'
              : 'You do not need to register or provide personal details to read job updates on our website. If you contact us via email or our contact form, we only receive your name, email address, and message to respond to your inquiry.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
            <span>2. लॉग फ़ाइलें (Log Files)</span>
          </h2>
          <p>
            {isHi
              ? 'अन्य वेबसाइटों की तरह, Rajasthan Vacancy भी लॉग फ़ाइलों का उपयोग करती है। इसमें इंटरनेट प्रोटोकॉल (IP) पता, ब्राउज़र का प्रकार, इंटरनेट सेवा प्रदाता (ISP), दिनांक और समय, और विज़िट किए गए पेजों की संख्या जैसी सामान्य तकनीकी जानकारी शामिल होती है। यह जानकारी किसी भी व्यक्ति की व्यक्तिगत पहचान से जुड़ी नहीं होती है।'
              : 'Like other websites, Rajasthan Vacancy uses standard log files including IP addresses, browser type, ISP, date/time stamps, and visited pages for analytics and site administration without personally identifying individuals.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>3. कुकीज़ और वेब बीकन (Cookies and Web Beacons)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारी वेबसाइट विज़िटर्स की प्राथमिकताओं (Preferences) को समझने और वेबसाइट के अनुभव को बेहतर बनाने के लिए "कुकीज़" का उपयोग करती है। आप चाहें तो अपने ब्राउज़र की सेटिंग्स से कुकीज़ को बंद या नियंत्रित कर सकते हैं।'
              : 'Our website uses cookies to store information about visitor preferences and optimize user experience based on browser settings.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-700 shrink-0" />
            <span>4. Google DoubleClick DART Cookie और Google AdSense</span>
          </h2>
          <p>
            {isHi ? (
              <>
                Google हमारी वेबसाइट पर एक थर्ड-पार्टी विज्ञापन विक्रेता (Third-Party Vendor) है। यह{' '}
                <span className="font-semibold">https://rajasthanvacancy.online</span> और इंटरनेट की अन्य वेबसाइटों पर आपकी विज़िट के आधार पर विज्ञापन दिखाने के लिए DART कुकीज़ का उपयोग करता है। उपयोगकर्ता{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-blue-700"
                >
                  Google विज्ञापन और सामग्री नेटवर्क गोपनीयता नीति (https://policies.google.com/technologies/ads)
                </a>{' '}
                तथा{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-blue-700"
                >
                  Google Ads Settings
                </a>{' '}
                पर जाकर DART कुकीज़ के उपयोग को अस्वीकार (Opt-out) कर सकते हैं।
              </>
            ) : (
              <>
                Google is a third-party vendor on our site and uses DART cookies to serve ads based on your visits to https://rajasthanvacancy.online and other websites. You may opt out of DART cookies by visiting the{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-blue-700"
                >
                  Google Ad and Content Network Privacy Policy
                </a>.
              </>
            )}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600 shrink-0" />
            <span>5. थर्ड-पार्टी गोपनीयता नीतियां (Third-Party Privacy Policies)</span>
          </h2>
          <p>
            {isHi
              ? 'Rajasthan Vacancy की गोपनीयता नीति अन्य विज्ञापनदाताओं या हमारी वेबसाइट पर दिए गए बाहरी सरकारी पोर्टल्स पर लागू नहीं होती है। अधिक जानकारी के लिए संबंधित वेबसाइटों की गोपनीयता नीति अवश्य पढ़ें।'
              : 'Rajasthan Vacancy’s Privacy Policy does not apply to other advertisers or external government portals linked from our site. Please consult their respective privacy policies for more details.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 shrink-0" />
            <span>6. बच्चों की जानकारी (Children&apos;s Information)</span>
          </h2>
          <p>
            {isHi
              ? 'Rajasthan Vacancy जानबूझकर 13 वर्ष से कम आयु के बच्चों से कोई भी व्यक्तिगत पहचान योग्य जानकारी एकत्र नहीं करती है। यदि किसी अभिभावक को लगता है कि उनके बच्चे ने ऐसी कोई जानकारी साझा की है, तो वे तुरंत हमसे संपर्क कर सकते हैं।'
              : 'Rajasthan Vacancy does not knowingly collect any personally identifiable information from children under the age of 13.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>7. सहमति (Consent)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारी वेबसाइट का उपयोग करके, आप हमारी गोपनीयता नीति और इसकी शर्तों से सहमत होते हैं।'
              : 'By using our website, you hereby consent to our Privacy Policy and agree to its terms.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600 shrink-0" />
            <span>8. संपर्क करें (Contact Us)</span>
          </h2>
          <p>
            {isHi ? (
              <>
                यदि हमारी गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो आप हमसे इस ईमेल पर संपर्क कर सकते हैं:{' '}
                <a href="mailto:rahulmathuriya7878@gmail.com" className="font-mono font-bold text-amber-700 hover:underline">
                  rahulmathuriya7878@gmail.com
                </a>
              </>
            ) : (
              <>
                If you have any questions regarding our Privacy Policy, please contact us at:{' '}
                <a href="mailto:rahulmathuriya7878@gmail.com" className="font-mono font-bold text-amber-700 hover:underline">
                  rahulmathuriya7878@gmail.com
                </a>
              </>
            )}
          </p>
        </section>

        {onOpenAdminLogin && (
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Vacancy Updates"
            >
              <span>📋</span>
              <span>{isHi ? 'वैकेंसी (Vacancy)' : 'Vacancy Updates'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
