import React from 'react';
import { LanguageMode } from '../types';
import { Info, ArrowLeft, Target, Users, Award, Sparkles } from 'lucide-react';

interface AboutUsProps {
  lang: LanguageMode;
  onBack: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang, onBack }) => {
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
        <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'हमारे बारे में (Comprehensive About Us)' : 'Comprehensive About Us'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isHi ? 'RAJASTHAN VACCANCY/JOBS पोर्टल की संपूर्ण कहानी व उद्देश्य' : 'The story and mission behind Rajasthan Vaccancy Jobs'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p>
            {isHi
              ? 'RAJASTHAN VACCANCY/JOBS राजस्थान और भारत के उन तमाम मेहनती और प्रतिभावान युवाओं के लिए निर्मित एक अग्रणी डिजिटल मंच है जो सरकारी सेवा में जाने का सपना देखते हैं। हमारे पोर्टल का मुख्य ध्येय राज्य की हर छोटी-बड़ी भर्ती, प्रवेश पत्र, आंसर की और परीक्षा परिणामों की प्रामाणिक सूचना बिना किसी विलंब के सबसे पहले अभ्यर्थियों तक पहुँचाना है।'
              : 'RAJASTHAN VACCANCY/JOBS is a premier digital recruitment alert portal dedicated to aspirants striving for government careers in Rajasthan.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span>1. हमारा मिशन और दृष्टिकोण (Mission & Vision)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारा दृष्टिकोण राजस्थान के सुदूर ग्रामीण अंचलों तक बैठे प्रत्येक प्रतियोगी छात्र तक पारदर्शी, स्पष्ट और समय पर सरकारी नौकरी की जानकारी पहुँचाना है, ताकि कोई भी योग्य अभ्यर्थी केवल सूचना के अभाव में परीक्षा से वंचित न रह जाए।'
              : 'Our vision is to empower candidates across remote regions of Rajasthan with transparent and timely recruitment updates.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-600" />
            <span>2. हम क्या-क्या सुविधाएँ प्रदान करते हैं? (Key Offerings)</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>RSMSSB & RPSC Updates:</strong> {isHi ? 'कर्मचारी चयन बोर्ड एवं लोक सेवा आयोग की हर विज्ञप्ति और परीक्षा कैलेंडर की लाइव जानकारी।' : 'Live announcements from RSMSSB and RPSC.'}</li>
            <li><strong>Candidate Utilities:</strong> {isHi ? 'उम्र सीमा गणना (Age Calculator), पात्रता जांच (Eligibility Finder), और SSO OTR फॉर्म गाइड।' : 'Age Calculator, Eligibility Finder, and SSO OTR guides.'}</li>
            <li><strong>Instant Bookmarks:</strong> {isHi ? 'महत्वपूर्ण नौकरियों को सहेजने (Save Jobs) और अपनी तैयारी को व्यवस्थित रखने का अनूठा साधन।' : 'Unique job saving and preparation tools.'}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <span>3. संपादकीय टीम (Editorial Commitment)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारी समर्पित संपादकीय टीम राजस्थान के परीक्षा पैटर्न, OTR नियमों, सिलेबस और कट-ऑफ का गहन विश्लेषण कर पाठकों के लिए सबसे सरल भाषा में लेख तैयार करती है।'
              : 'Our dedicated editorial team deeply analyzes exam patterns, OTR rules, syllabi, and cut-offs to serve our readers best.'}
          </p>
        </section>
      </div>
    </div>
  );
};
