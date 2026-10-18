import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { LanguageMode } from '../types';

interface FAQItem {
  id: string;
  qHi: string;
  qEn: string;
  aHi: string;
  aEn: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'sso-apply',
    qHi: 'राजस्थान सरकारी भर्तियों के लिए आवेदन कैसे करें?',
    qEn: 'How to apply for Rajasthan Government jobs?',
    aHi: 'राजस्थान की सरकारी भर्तियों (RSMSSB, RPSC आदि) के लिए sso.rajasthan.gov.in पर लॉगिन करें। इसके बाद "Recruitment Portal" में जाकर इच्छित भर्ती के सामने "Apply Now" पर क्लिक करके फॉर्म भरें।',
    aEn: 'Log in to sso.rajasthan.gov.in, navigate to "Recruitment Portal", select your desired vacancy under Ongoing Recruitments, and click "Apply Now" to submit your application.'
  },
  {
    id: 'otr-fees',
    qHi: 'One Time Registration (OTR) फीस कितनी है?',
    qEn: 'What is the One Time Registration (OTR) fee?',
    aHi: 'सामान्य व अन्य राज्य के अभ्यर्थियों के लिए ₹600/- तथा राजस्थान के आरक्षित वर्गों (OBC, EWS, SC, ST, दिव्यांगजन) के लिए ₹400/- है। एक बार OTR फीस देने के बाद आगामी सभी भर्तियों के फॉर्म निःशुल्क भरे जाते हैं।',
    aEn: '₹600 for General/Other state candidates and ₹400 for reserved categories (OBC, EWS, SC, ST, PH) of Rajasthan. After paying OTR once, subsequent application forms are free.'
  },
  {
    id: 'age-relaxation',
    qHi: 'आयु सीमा में कितनी छूट मिलती है?',
    qEn: 'What age relaxation is available for reserved categories?',
    aHi: 'राजस्थान के SC, ST, OBC, MBC, EWS पुरुष अभ्यर्थियों एवं सामान्य वर्ग की महिला अभ्यर्थियों को 5 वर्ष तथा आरक्षित वर्ग की महिला अभ्यर्थियों को 10 वर्ष की अधिकतम आयु सीमा में छूट मिलती है।',
    aEn: '5 years relaxation for SC, ST, OBC, MBC, EWS male candidates and General female candidates; 10 years relaxation for reserved category female candidates of Rajasthan.'
  },
  {
    id: 'other-state',
    qHi: 'क्या अन्य राज्यों के अभ्यर्थी भी आवेदन कर सकते हैं?',
    qEn: 'Can candidates from other states apply?',
    aHi: 'हाँ, अन्य राज्यों के सभी पात्र अभ्यर्थी आवेदन कर सकते हैं, किंतु उन्हें सामान्य (General/Unreserved) श्रेणी के अंतर्गत माना जाएगा।',
    aEn: 'Yes, eligible candidates from other states can apply, but they will be treated under the General / Unreserved category.'
  },
  {
    id: 'admit-card',
    qHi: 'एडमिट कार्ड व रिजल्ट कैसे देखें?',
    qEn: 'How to check Admit Card and Result?',
    aHi: 'परीक्षा से 7 दिन पूर्व हमारे पोर्टल के "प्रवेश पत्र (Admit Card)" सेक्शन में एडमिट कार्ड का सीधा लिंक मिल जाएगा। रिजल्ट घोषित होने पर "परीक्षा परिणाम (Result)" सेक्शन में जाकर रोल नंबर से परिणाम देख सकते हैं।',
    aEn: 'Direct download links for Admit Cards are published 7 days prior to exams in the Admit Card section. Results can be checked in the Results section using roll number/DOB.'
  },
  {
    id: 'scheme-docs',
    qHi: 'सरकारी योजनाओं के लिए क्या दस्तावेज चाहिए?',
    qEn: 'What documents are required for Government Schemes?',
    aHi: 'राजस्थान की योजनाओं (अनुप्रति कोचिंग, आयुष्मान आरोग्य, लाडो प्रोत्साहन आदि) के लिए जन आधार कार्ड (Jan Aadhaar Card), मूल निवास, आय प्रमाण पत्र व बैंक खाता अनिवार्य हैं।',
    aEn: 'Jan Aadhaar Card, Domicile certificate, Income certificate, and linked Bank Account are mandatory for Rajasthan welfare schemes.'
  }
];

interface FAQSectionProps {
  lang: LanguageMode;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ lang }) => {
  const isHi = lang === 'hi';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs scroll-mt-6">
      {/* Normal Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {isHi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h2>
          <p className="text-xs text-slate-500">
            {isHi 
              ? 'राजस्थान सरकारी नौकरी, OTR व योजनाओं से जुड़े सामान्य सवाल-जवाब'
              : 'Common questions and answers regarding Rajasthan Govt Jobs & Schemes'}
          </p>
        </div>
      </div>

      {/* Normal Simple Accordion List */}
      <div className="divide-y divide-slate-100 mt-2">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const question = isHi ? faq.qHi : faq.qEn;
          const answer = isHi ? faq.aHi : faq.aEn;

          return (
            <div key={faq.id} className="py-3">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left gap-3 py-1 text-slate-800 hover:text-amber-700 transition cursor-pointer"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-amber-600 font-bold text-xs">{idx + 1}.</span>
                  <span>{question}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-amber-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2 text-xs sm:text-sm text-slate-600 pl-5 pr-2 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  {answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
