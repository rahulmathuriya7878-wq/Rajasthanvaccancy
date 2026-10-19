import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Mail, 
  Send, 
  MessageCircle, 
  Building2, 
  Heart,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LanguageMode } from '../types';

interface FooterProps {
  lang: LanguageMode;
  onOpenAgeCalc: () => void;
  onOpenCalendar: () => void;
  onOpenSSOGuide: () => void;
  onSelectPolicy: (policy: 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer') => void;
  onOpenAdminLogin?: () => void;
}

interface FaqItem {
  category: 'process' | 'docs' | 'prep';
  qHi: string;
  qEn: string;
  aHi: string;
  aEn: string;
  note?: {
    hi: string;
    en: string;
  };
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onOpenAgeCalc,
  onOpenCalendar,
  onOpenSSOGuide,
  onSelectPolicy,
  onOpenAdminLogin,
}) => {
  const isHi = lang === 'hi';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // Open first by default

  const faqList: FaqItem[] = [
    {
      category: 'process',
      qHi: '1. One Time Registration (OTR) क्या है और राजस्थान में आवेदन फीस कितनी लगती है?',
      qEn: '1. What is One Time Registration (OTR) and what are the application fees in Rajasthan?',
      aHi: 'राजस्थान सरकार ने भर्ती परीक्षाओं के लिए एकल पंजीकरण (OTR) व्यवस्था लागू की है।\n• सामान्य (General) एवं क्रीमीलेयर पिछड़ा वर्ग: ₹600 (एक बार)\n• SC / ST / OBC (Non-Creamy) / MBC / EWS एवं दिव्यांगजन: ₹400 (एक बार)\nएक बार OTR शुल्क जमा कराने के बाद राजस्थान की समस्त सीधी भर्तियों (RSMSSB, RPSC आदि) में आवेदन पूरी तरह से निःशुल्क (Zero Fee) रहता है।',
      aEn: 'The Rajasthan Government implemented One Time Registration (OTR) via SSO Portal:\n• General & Creamy-Layer OBC/MBC: ₹600 (One-time)\n• SC / ST / OBC (NCL) / MBC / EWS & PwD: ₹400 (One-time)\nOnce paid, all subsequent state direct recruitment applications (RSMSSB & RPSC) require zero additional examination fees.',
      note: {
        hi: 'OTR में अपना नाम, पिता का नाम और जन्म तिथि 10वीं की अंकतालिका के अनुसार ही भरें क्योंकि बाद में संशोधन कठिन होता है।',
        en: 'Enter your name, father\'s name, and DOB exactly matching your Class 10 Certificate; post-submission edits are restricted.'
      }
    },
    {
      category: 'process',
      qHi: '2. राजस्थान CET (समान पात्रता परीक्षा) क्या है और इसमें 15 गुना नियम कैसे काम करता है?',
      qEn: '2. What is Rajasthan CET and how does the 15-times selection rule work?',
      aHi: 'राजस्थान में अधिकांश अधीनस्थ पदों (पटवारी, कनिष्ठ लेखाकार, एलडीसी, वनपाल, प्लाटून कमांडर आदि) के लिए CET अनिवार्य है। यह स्नातक (Graduation) एवं सीनियर सेकेंडरी (12th) दो स्तरों पर होती है।\n• किसी भी मुख्य भर्ती में विज्ञापित पदों की कुल संख्या के 15 गुना (15 times) अभ्यर्थियों को CET स्कोर की मेरिट और आरक्षण वर्ग के अनुसार मुख्य परीक्षा हेतु पात्र माना जाता है।\n• न्यूनतम 40% (SC/ST हेतु 35%) अंक प्राप्त करने वाले अभ्यर्थी भी मुख्य भर्ती के विचारणीय दायरे में रहते हैं।',
      aEn: 'Rajasthan Common Eligibility Test (CET) is mandatory for subordinate state cadres (Patwari, Junior Accountant, LDC, Forester, etc.) across 12th & Graduation tiers.\n• For individual job recruitments, candidates up to 15 times the total advertised category vacancies are shortlisted according to their CET merit ranking.\n• A qualifying benchmark of 40% (35% for SC/ST) is generally prescribed.',
    },
    {
      category: 'docs',
      qHi: '3. राजस्थान मूल निवास (Domicile) और जाति प्रमाण पत्र (Caste Certificate) की वैधता कितनी होती है?',
      qEn: '3. What is the validity period of Rajasthan Domicile and Caste Certificates?',
      aHi: 'राजस्थान कार्मिक विभाग के नवीनतम दिशा-निर्देशों के अनुसार:\n• डिजिटल मूल निवास प्रमाण पत्र (Bonafide Resident): आजीवन (Lifetime) मान्य होता है, बशर्ते निवास स्थान या वैवाहिक स्थिति न बदली हो।\n• SC / ST जाति प्रमाण पत्र: आजीवन (Lifetime) मान्य होता है।\n• OBC / MBC (Non-Creamy Layer): मूल प्रमाण पत्र 1 वर्ष हेतु मान्य होता है, परंतु सक्षम शपथ पत्र (Affidavit) प्रस्तुत करने पर इसे अधिकतम 3 वर्ष तक वैध माना जाता है।\n• EWS प्रमाण पत्र: जारी होने वाले वित्तीय वर्ष (1 अप्रैल से 31 मार्च) के लिए मान्य होता है।',
      aEn: 'As per Rajasthan Department of Personnel guidelines:\n• Digital Domicile / Bonafide Resident Certificate: Valid for a Lifetime unless address/marital status changes.\n• SC / ST Caste Certificate: Valid for a Lifetime.\n• OBC / MBC Non-Creamy Layer: Valid for 1 year, extendable up to 3 years with an official self-declaration affidavit.\n• EWS Certificate: Valid for the respective financial year (1st April to 31st March).',
      note: {
        hi: 'सभी प्रमाण पत्र सक्षम अधिकारी (SDM/तहसीलदार) द्वारा डिजिटल हस्ताक्षरित एवं क्यूआर कोड युक्त होने चाहिए।',
        en: 'Ensure all certificates are digitally signed by competent revenue authorities with verifiable QR codes.'
      }
    },
    {
      category: 'docs',
      qHi: '4. दस्तावेज सत्यापन (Document Verification - DV) के समय कौन-कौन से प्रमाण पत्र अनिवार्य हैं?',
      qEn: '4. Which documents are compulsory during Document Verification (DV)?',
      aHi: 'दस्तावेज सत्यापन के समय अभ्यर्थियों को मूल दस्तावेज व 2-2 स्वप्रमाणित प्रतियों का सेट प्रस्तुत करना होता है:\n1. 10वीं बोर्ड अंकतालिका व प्रमाण पत्र (जन्म तिथि का प्रामाणिक दस्तावेज)\n2. 12वीं एवं स्नातक/स्नातकोत्तर के सभी वर्षों की मूल अंकतालिकाएं व डिग्री\n3. तकनीकी योग्यता (RS-CIT, B.Ed, BSTC, ITI, डिप्लोमा आदि)\n4. सक्षम स्तर से जारी डिजिटल जाति एवं मूल निवास प्रमाण पत्र\n5. चरित्र प्रमाण पत्र (अंतिम अध्ययन संस्थान से + 2 राजपत्रित अधिकारियों द्वारा)\n6. जन आधार कार्ड एवं आधार कार्ड\n7. यदि आवेदन में आय 2.50 लाख से कम भरी है, तो सक्षम अधिकारी द्वारा जारी आय प्रमाण पत्र।',
      aEn: 'Mandatory documents required during Rajasthan DV stages (original + 2 self-attested photocopies):\n1. Class 10 marksheet & passing certificate (Date of Birth proof)\n2. Class 12, Graduation & Post-Graduation marksheets and degree certificates\n3. Technical credentials (RS-CIT, B.Ed, D.El.Ed, ITI, Diploma where applicable)\n4. Digital Caste Certificate and Rajasthan Domicile Certificate\n5. Character certificates (from the last educational institute attended + 2 from Gazetted Officers)\n6. Jan Aadhaar Card and Aadhaar Card\n7. Income Certificate if fee concession was claimed for income under ₹2.50 Lakhs.',
    },
    {
      category: 'prep',
      qHi: '5. राजस्थान भर्ती परीक्षाओं में नेगेटिव मार्किंग और 5वें विकल्प (5th Option) का क्या नियम है?',
      qEn: '5. What is the Negative Marking and 5th Option OMR rule in Rajasthan exams?',
      aHi: 'RSMSSB एवं RPSC दोनों आयोगों में परीक्षा निष्पक्षता हेतु कड़े नियम लागू हैं:\n• प्रत्येक गलत उत्तर के लिए 1/3 (एक तिहाई) अंक काटा जाता है।\n• OMR शीट में प्रत्येक प्रश्न के लिए 5 विकल्प (A, B, C, D और E) दिए जाते हैं।\n• यदि आप किसी प्रश्न का उत्तर नहीं देना चाहते, तो 5वां विकल्प \'E\' (अनुत्तरित प्रश्न) भरना अनिवार्य है।\n• यदि कोई भी गोला नहीं भरा गया, तो उस प्रश्न के 1/3 अंक काट लिए जाएंगे।\n• यदि किसी अभ्यर्थी द्वारा 10% से अधिक प्रश्नों में कोई भी गोला नहीं भरा गया, तो उसे परीक्षा से पूर्णतः अयोग्य (Disqualified) कर दिया जाता है।',
      aEn: 'Strict OMR guidelines implemented across RSMSSB & RPSC:\n• Negative marking of 1/3rd mark is deducted for each incorrect answer.\n• 5 options (A, B, C, D, and E) are provided on the OMR sheet.\n• If a candidate chooses not to answer a question, bubbling Option \'E\' (Unattempted) is mandatory.\n• Leaving all 5 circles blank results in a 1/3rd penalty deduction for that question.\n• Candidates leaving more than 10% of total questions completely unbubbled are automatically disqualified.',
      note: {
        hi: 'OMR में 5वें विकल्प के गोले भरने के लिए परीक्षा समय समाप्त होने के बाद अतिरिक्त 10 मिनट का समय दिया जाता है।',
        en: 'An extra 10 minutes is allotted at the end of the examination specifically to verify and bubble unattempted 5th options.'
      }
    },
    {
      category: 'prep',
      qHi: '6. राजस्थान प्रतियोगी परीक्षाओं की तैयारी के लिए प्रामाणिक अध्ययन सामग्री व रणनीति क्या होनी चाहिए?',
      qEn: '6. What is the recommended strategy & authentic study material for Rajasthan exams?',
      aHi: 'सफल अभ्यर्थियों और विशेषज्ञों द्वारा अनुशंसित अध्ययन रणनीति:\n1. राजस्थान माध्यमिक शिक्षा बोर्ड (RBSE) की कक्षा 6 से 10वीं तक की \'हमारा राजस्थान\' और \'राजस्थान का इतिहास एवं संस्कृति\' पुस्तकें अनिवार्य रूप से पढ़ें।\n2. राजस्थान हिंदी ग्रंथ अकादमी की अधिकृत पुस्तकें (इतिहास, कला-संस्कृति, भूगोल, प्रशासनिक व्यवस्था हेतु) प्रमाणिक मानी जाती हैं।\n3. पिछले 5 वर्षों के हल प्रश्न पत्र (Previous Year Papers) नियमित हल करें ताकि परीक्षा पैटर्न व प्रश्नों के स्तर की समझ बन सके।\n4. राजस्थान समसामयिकी (Current Affairs) के लिए सूजस (Sujas Magazine) और आर्थिक समीक्षा (Economic Survey) का निरंतर अध्ययन करें।',
      aEn: 'Recommended preparation blueprint by subject experts:\n1. Study RBSE textbooks (Classes 6-10) \'Hamara Rajasthan\' and Rajasthan History & Culture.\n2. Reference Rajasthan Hindi Granth Academy standard publications for Art, Culture, Geography, and Polity.\n3. Solve 5+ years of previous official question papers to understand question complexity.\n4. Thoroughly review Rajasthan Sujas official magazine and state Economic Survey for current affairs.',
    },
    {
      category: 'process',
      qHi: '7. बहु-पारीय (Multi-shift) परीक्षाओं में नॉर्मलाइजेशन (Normalization) कैसे किया जाता है?',
      qEn: '7. How does the Normalization process work in multi-shift recruitment exams?',
      aHi: 'जब किसी परीक्षा में अत्यधिक परीक्षार्थियों के कारण परीक्षा एक से अधिक पारियों या दिनों में आयोजित की जाती है, तो प्रश्नपत्र के कठिनाई स्तर को संतुलित करने हेतु सांख्यिकीय फॉर्मूला (Equipercentile या Mean Standard Deviation विधि) अपनाया जाता है। इससे किसी भी पारी के अभ्यर्थी को कठिन या सरल पेपर के कारण अनुचित लाभ या हानि नहीं होती।',
      aEn: 'When large candidate volumes necessitate conducting an examination across multiple shifts or dates, statistical Normalization (Mean-Standard Deviation or Equipercentile method) is applied to balance question paper variance across shifts fairly.',
    }
  ];

  const filteredFaqs = selectedCategory === 'all'
    ? faqList
    : faqList.filter((item) => item.category === selectedCategory);

  const officialLinks = [
    { name: 'RSMSSB (कर्मचारी चयन बोर्ड)', url: 'https://rsmssb.rajasthan.gov.in' },
    { name: 'RPSC (राजस्थान लोक सेवा आयोग)', url: 'https://rpsc.rajasthan.gov.in' },
    { name: 'Rajasthan SSO Portal (sso.rajasthan.gov.in)', url: 'https://sso.rajasthan.gov.in' },
    { name: 'Rajasthan Police (राजस्थान पुलिस)', url: 'https://police.rajasthan.gov.in' },
    { name: 'Rajasthan High Court Jodhpur', url: 'https://hcraj.nic.in' },
    { name: 'BSER REET Board Ajmer', url: 'https://rajeduboard.rajasthan.gov.in' },
    { name: 'Jan Soochna Portal Rajasthan', url: 'https://jansoochna.rajasthan.gov.in' },
    { name: 'Social Justice SJED Scholarships', url: 'https://sje.rajasthan.gov.in' },
  ];

  return (
    <footer className="w-full bg-white text-slate-700 pt-10 pb-8 mt-12 border-t border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xs">
                RV/J
              </div>
              <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                RAJASTHAN <span className="text-amber-600">VACCANCY/JOBS</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isHi
                ? 'राजस्थान के सभी आकांक्षी युवाओं एवं प्रतियोगी परीक्षार्थियों के लिए सबसे तेज, विश्वसनीय, सटीक एवं प्रामाणिक भर्ती सूचना मंच। राजस्थान कर्मचारी चयन बोर्ड (RSMSSB), राजस्थान लोक सेवा आयोग (RPSC), राजस्थान पुलिस, रीट (REET) तथा अन्य सभी राज्य एवं केंद्रीय प्रतियोगी परीक्षाओं के नवीनतम सरकारी जॉब अलर्ट्स, एडमिट कार्ड, सिलेबस, कट-ऑफ और परीक्षा परिणामों की पल-पल की सटीक अपडेट सबसे पहले प्राप्त करें।'
                : 'Premier recruitment and job notification portal for Rajasthan candidates. Real-time updates on RSMSSB, RPSC, Police, REET, results, admit cards, and syllabi.'}
            </p>
          </div>

          {/* Col 2: Official Portals Directory */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'आधिकारिक सरकारी वेबसाइटें' : 'Official Government Portals'}</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              {officialLinks.slice(0, 3).map((l, idx) => (
                <li key={idx}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-600 transition flex items-center gap-1 text-slate-600 font-medium"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>{l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Candidate Fast Tools */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>{isHi ? 'परीक्षा कैलेंडर' : 'Exam Calendar'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenCalendar}
                  className="hover:text-amber-600 transition text-slate-600 font-medium text-left"
                >
                  👉 {isHi ? 'RSMSSB/RPSC वार्षिक परीक्षा कैलेंडर 2025-26' : 'Exam Schedule & Calendar 2025-26'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Non-Government Disclaimer */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{isHi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer & Notice'}</span>
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-2">
              <p>
                {isHi
                  ? 'RAJASTHAN VACCANCY/JOBS एक गैर-सरकारी एवं निजी सूचनात्मक पोर्टल है। हम किसी भी सरकारी एजेंसी अथवा आयोग से संबद्ध नहीं हैं।'
                  : 'RAJASTHAN VACCANCY/JOBS is an independent job aggregation and candidate informational portal. We are not affiliated with the Government of Rajasthan or any recruitment commission.'}
              </p>
              <p>
                {isHi
                  ? 'अभ्यर्थियों को सलाह दी जाती है कि आवेदन करने से पूर्व संबंधित विभाग के अधिकृत राजपत्र व नोटिफिकेशन का अवलोकन अवश्य करें।'
                  : 'Candidates are strictly advised to consult the official Gazette / Notification PDFs released by respective boards before making application fee payments.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RAJASTHAN VACCANCY/JOBS — {isHi ? 'सर्वाधिकार सुरक्षित | राजस्थान का विश्वसनीय भर्ती मंच' : 'All Rights Reserved. Clean & Searchable Govt Job Alerts.'}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onSelectPolicy('privacy')} className="hover:text-amber-400 transition cursor-pointer">
              {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </button>
            <button onClick={() => onSelectPolicy('terms')} className="hover:text-amber-400 transition cursor-pointer">
              {isHi ? 'नियम व शर्तें' : 'Terms & Conditions'}
            </button>
            <button onClick={() => onSelectPolicy('contact')} className="hover:text-amber-400 transition cursor-pointer">
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </button>
            <button onClick={() => onSelectPolicy('about')} className="hover:text-amber-400 transition cursor-pointer">
              {isHi ? 'हमारे बारे में' : 'About Us'}
            </button>
            <button onClick={() => onSelectPolicy('disclaimer')} className="hover:text-amber-400 transition cursor-pointer">
              {isHi ? 'अस्वीकरण' : 'Disclaimer'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
