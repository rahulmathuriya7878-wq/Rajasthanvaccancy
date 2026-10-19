import React from 'react';
import { LanguageMode } from '../types';
import { FileText, ArrowLeft, CheckCircle2, AlertOctagon, Scale, BookOpen } from 'lucide-react';

interface TermsAndConditionsProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ lang, onBack }) => {
  const isHi = lang === 'hi';

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
        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'नियम व शर्तें (Comprehensive Terms & Conditions)' : 'Comprehensive Terms & Conditions'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isHi ? 'अंतिम अपडेट: अक्टूबर 2026 | उपयोग की शर्तें' : 'Last Updated: October 2026'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p>
            {isHi
              ? 'RAJASTHAN VACCANCY/JOBS पोर्टल पर आपका स्वागत है। इस वेबसाइट (rajasthanvacancy.in) का उपयोग करने से पहले कृपया इन नियमों और शर्तों को ध्यान से पढ़ें। इस प्लेटफ़ॉर्म का उपयोग करके आप इस बात की पुष्टि करते हैं कि आप इन शर्तों से पूरी तरह सहमत हैं।'
              : 'Welcome to RAJASTHAN VACCANCY/JOBS. By accessing and using this website, you agree to comply with and be bound by the following comprehensive terms and conditions.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>1. पोर्टल का उद्देश्य (Purpose of Portal)</span>
          </h2>
          <p>
            {isHi
              ? 'यह पोर्टल राजस्थान एवं केंद्र सरकार की सीधी भर्तियों, प्रवेश पत्रों (Admit Cards), परीक्षा परिणाम (Results), उत्तरकुंजियों (Answer Keys) एवं रोजगार समाचारों की जानकारी को एक ही स्थान पर सहज और सरल हिंदी में उपलब्ध कराने के लिए बनाया गया एक स्वतंत्र सूचना मंच है।'
              : 'This portal is an independent informational platform created to aggregate Rajasthan and Central government recruitment notifications in simple Hindi.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>2. सूचना की प्रामाणिकता और सत्यापन (Verification)</span>
          </h2>
          <p>
            {isHi
              ? 'यद्यपि हम प्रत्येक भर्ती नोटिफिकेशन, परीक्षा तिथि और परिणाम अपडेट को प्रकाशित करने से पहले पूरी सतर्कता बरतते हैं, फिर भी मानवीय त्रुटियों या तकनीकी कारणों से अशुद्धता की संभावना से इंकार नहीं किया जा सकता। सभी अभ्यर्थियों को सख्त सलाह दी जाती है कि वे आवेदन करने या फीस जमा करने से पहले संबंधित आयोग (जैसे RSMSSB, RPSC) की आधिकारिक वेबसाइट पर जारी मूल विज्ञापन (Official Notification) का मिलान अवश्य कर लें।'
              : 'While we ensure high accuracy, candidates are strongly advised to cross-verify official notifications on respective board websites before applying.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>3. बौद्धिक संपदा और कॉपीराइट (Intellectual Property)</span>
          </h2>
          <p>
            {isHi
              ? 'इस वेबसाइट पर प्रस्तुत सभी लेआउट, ग्राफिक्स, डेटाबेस और विशेष रूप से तैयार की गई सारांश सामग्री RAJASTHAN VACCANCY/JOBS के स्वामित्व में हैं। लिखित अनुमति के बिना इस सामग्री का वाणिज्यिक उपयोग, स्क्रेपिंग या कॉपी करना कानूनी रूप से वर्जित है।'
              : 'All layouts, graphics, and summarized content on this website are owned by RAJASTHAN VACCANCY/JOBS. Commercial reproduction without written permission is prohibited.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <span>4. दायित्व की अस्वीकृति (Disclaimer of Liability)</span>
          </h2>
          <p>
            {isHi
              ? 'इस पोर्टल पर दी गई सूचनाओं के आधार पर लिए गए किसी भी निर्णय, आवेदन विलंब, परीक्षा चयन या वित्तीय लेन-देन से होने वाले किसी भी प्रत्यक्ष या अप्रत्यक्ष नुकसान के लिए RAJASTHAN VACCANCY/JOBS उत्तरदायी नहीं होगा।'
              : 'RAJASTHAN VACCANCY/JOBS shall not be held liable for any direct or indirect losses resulting from reliance on the information provided.'}
          </p>
        </section>
      </div>
    </div>
  );
};
