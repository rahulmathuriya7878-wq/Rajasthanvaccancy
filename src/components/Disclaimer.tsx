import React from 'react';
import { LanguageMode } from '../types';
import { AlertTriangle, ArrowLeft, ShieldAlert, FileWarning, HelpCircle } from 'lucide-react';

interface DisclaimerProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ lang, onBack }) => {
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
        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'अस्वीकरण (Comprehensive Disclaimer & Notice)' : 'Comprehensive Disclaimer & Notice'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isHi ? 'महत्वपूर्ण विधिक एवं उत्तरदायित्व घोषणा' : 'Important Legal & Liability Notice'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p>
            {isHi
              ? 'RAJASTHAN VACCANCY/JOBS (rajasthanvacancy.in) एक स्वतंत्र, गैर-सरकारी सूचनात्मक एग्रीगेटर पोर्टल है। कृपया इस वेबसाइट का उपयोग करने से पहले इस व्यापक अस्वीकरण (Disclaimer) को अच्छी तरह समझ लें।'
              : 'RAJASTHAN VACCANCY/JOBS is an independent, non-governmental informational aggregator portal. Please read this comprehensive disclaimer carefully before using our website.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>1. गैर-सरकारी संबद्धता (Non-Government Affiliation)</span>
          </h2>
          <p>
            {isHi
              ? 'हम राजस्थान सरकार, केंद्र सरकार, RSMSSB (राजस्थान कर्मचारी चयन बोर्ड), RPSC (राजस्थान लोक सेवा आयोग) या किसी भी अन्य सरकारी रिक्रूटमेंट बोर्ड के आधिकारिक या अनुबंधित पोर्टल नहीं हैं। हमारा उद्देश्य केवल छात्रों तक सार्वजनिक रूप से उपलब्ध सरकारी विज्ञापनों की जानकारी सहज रूप में पहुँचाना है।'
              : 'We are not an official partner or affiliate of the Government of Rajasthan, RSMSSB, RPSC, or any other government recruitment board.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-600" />
            <span>2. आधिकारिक नोटिफिकेशन की प्राथमिकता (Official Notification Priority)</span>
          </h2>
          <p>
            {isHi
              ? 'यद्यपि हमारी टीम विज्ञापनों, तिथियों और रिक्तियों की संख्या को सत्यापित करने का पूरा प्रयास करती है, फिर भी किसी भी प्रकार की टाइपिंग त्रुटि, तिथि परिवर्तन या विसंगति की स्थिति में संबंधित आयोग की आधिकारिक वेबसाइट पर जारी मूल पीडीएफ विज्ञप्ति (Original PDF Notification) को ही अंतिम और सर्वमान्य सत्य माना जाएगा।'
              : 'While we ensure high accuracy, in case of any typing error or date discrepancy, the original PDF notification issued by the respective official board shall be final.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-600" />
            <span>3. वित्तीय लेन-देन और आवेदन शुल्क (Application Fee Disclaimer)</span>
          </h2>
          <p>
            {isHi
              ? 'हम किसी भी प्रकार का आवेदन शुल्क (Application Fee) या परीक्षा शुल्क सीधे तौर पर स्वीकार नहीं करते हैं। सभी फीस केवल संबंधित सरकारी पोर्टल (जैसे SSO Rajasthan, RSMSSB Portal) के माध्यम से ही जमा की जानी चाहिए। पोर्टल पर प्रकाशित लिंक्स केवल सहायता हेतु हैं।'
              : 'We do not collect any application fees directly. All candidate fee payments must be conducted strictly through official state government portals (SSO / RSMSSB).'}
          </p>
        </section>
      </div>
    </div>
  );
};
