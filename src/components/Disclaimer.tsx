'use client';

import React from 'react';
import { LanguageMode } from '../types';
import { AlertTriangle, ArrowLeft, ShieldAlert, FileWarning, Info, ExternalLink, Scale } from 'lucide-react';

interface DisclaimerProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ lang, onBack }) => {
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
        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'अस्वीकरण (Disclaimer) – Rajasthan Vacancy' : 'Disclaimer – Rajasthan Vacancy'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isHi
              ? 'अंतिम अपडेट: 22 नवंबर 2026 | https://rajasthanvacancy.online (www.rajasthanvacancy.online)'
              : 'Last Updated: 22 November 2026 | https://www.rajasthanvacancy.online'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>1. यह कोई आधिकारिक सरकारी वेबसाइट नहीं है</span>
          </h2>
          <p>
            {isHi
              ? 'Rajasthan Vacancy (https://rajasthanvacancy.online) एक निजी और स्वतंत्र शैक्षणिक (Educational) तथा सूचनात्मक वेबसाइट है। हमारा राजस्थान सरकार, भारत सरकार, या किसी भी सरकारी विभाग, बोर्ड या भर्ती एजेंसी (जैसे RPSC, RSSB/RSMSSB आदि) से कोई संबंध नहीं है और न ही हम इनके द्वारा अधिकृत हैं।'
              : 'Rajasthan Vacancy (https://www.rajasthanvacancy.online) is a private, independent educational and informational website. We are not affiliated with, endorsed by, or authorized by the Government of Rajasthan, Government of India, RPSC, RSSB/RSMSSB, or any government recruitment board.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>2. जानकारी का उद्देश्य</span>
          </h2>
          <p>
            {isHi
              ? 'इस वेबसाइट पर प्रकाशित सभी सरकारी नौकरी की अधिसूचनाएं (Notifications), परीक्षा तिथियां, एडमिट कार्ड, परिणाम (Results) और योजनाओं की जानकारी केवल छात्रों और नौकरी की तलाश कर रहे उम्मीदवारों की सुविधा व सामान्य जागरूकता के लिए आधिकारिक पोर्टल, समाचार पत्रों और सार्वजनिक सूचनाओं से एकत्र की जाती है।'
              : 'All job notifications, exam dates, admit cards, results, and government scheme details published on this portal are compiled from official portals, newspapers, and public notices purely for candidates’ convenience and general awareness.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-600 shrink-0" />
            <span>3. सटीकता और सत्यापन (Verification)</span>
          </h2>
          <p>
            {isHi
              ? 'हम हमेशा सही और समय पर जानकारी देने का प्रयास करते हैं, लेकिन मानवीय त्रुटि या आधिकारिक नियमों में अंतिम समय पर बदलाव संभव है। rajasthanvacancy.online पर दी गई किसी भी जानकारी के आधार पर आवेदन करने या कोई निर्णय लेने से पहले, उपयोगकर्ताओं को सलाह दी जाती है कि वे संबंधित विभाग की आधिकारिक वेबसाइट और आधिकारिक नोटिफिकेशन (PDF) से सभी विवरणों की पुष्टि अवश्य करें।'
              : 'While we strive to provide accurate and timely updates, human error or last-minute rule changes are possible. Before applying or acting on any information on rajasthanvacancy.online, users are strongly advised to verify all details from the official department website and original PDF notification.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-rose-600 shrink-0" />
            <span>4. बाहरी लिंक (External Links)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारे लेखों में सीधे आवेदन करने या नोटिफिकेशन डाउनलोड करने के लिए बाहरी आधिकारिक वेबसाइटों के लिंक दिए जाते हैं। उन बाहरी वेबसाइटों की सामग्री, उपलब्धता या गोपनीयता नीतियों पर हमारा कोई नियंत्रण नहीं है।'
              : 'Our articles contain external links to official websites for direct applications or notification downloads. We have no control over the content, availability, or privacy policies of those external sites.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-600 shrink-0" />
            <span>5. उत्तरदायित्व की सीमा</span>
          </h2>
          <p>
            {isHi
              ? 'इस वेबसाइट पर प्रकाशित जानकारी पर भरोसा करने से होने वाले किसी भी नुकसान, अंतिम तिथि चूकने या असुविधा के लिए rajasthanvacancy.online और इसकी टीम जिम्मेदार नहीं होगी। हम किसी भी प्रकार का आवेदन शुल्क सीधे स्वीकार नहीं करते हैं; सभी शुल्क केवल संबंधित सरकारी पोर्टल पर ही जमा किए जाने चाहिए।'
              : 'rajasthanvacancy.online and its team shall not be liable for any loss, missed deadline, or inconvenience arising from reliance on information published on this website.'}
          </p>
        </section>
      </div>
    </div>
  );
};
