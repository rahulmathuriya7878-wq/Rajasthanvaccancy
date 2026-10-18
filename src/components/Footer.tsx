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
    <footer className="w-full bg-slate-900 text-slate-300 pt-10 pb-8 mt-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xs">
                RV/J
              </div>
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                RAJASTHAN <span className="text-amber-500">VACCANCY/JOBS</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isHi
                ? 'राजस्थान के बेरोजगार युवाओं एवं प्रतियोगी परीक्षार्थियों के लिए सबसे तेज, सटीक एवं प्रमाणित भर्ती सूचना पोर्टल। RSMSSB, RPSC, पुलिस, रीट एवं केंद्रीय परीक्षाओं के निःशुल्क अलर्ट्स।'
                : 'Premier recruitment and job notification portal for Rajasthan candidates. Real-time updates on RSMSSB, RPSC, Police, REET, results, admit cards, and syllabi.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Alert</span>
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Group</span>
              </a>
            </div>
          </div>

          {/* Col 2: Official Portals Directory */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>{isHi ? 'आधिकारिक सरकारी वेबसाइटें' : 'Official Government Portals'}</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              {officialLinks.slice(0, 5).map((l, idx) => (
                <li key={idx}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1 text-slate-400"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-600" />
                    <span>{l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Candidate Fast Tools */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>{isHi ? 'प्रतियोगी परीक्षार्थी टूल्स' : 'Candidate Utilities'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAgeCalc}
                  className="hover:text-amber-400 transition text-slate-400 text-left"
                >
                  👉 {isHi ? 'राजस्थान भर्ती आयु कैलकुलेटर (Age Calculator)' : 'Rajasthan Govt Age Calculator'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCalendar}
                  className="hover:text-amber-400 transition text-slate-400 text-left"
                >
                  👉 {isHi ? 'RSMSSB/RPSC वार्षिक परीक्षा कैलेंडर 2025-26' : 'Exam Schedule & Calendar 2025-26'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSSOGuide}
                  className="hover:text-amber-400 transition text-slate-400 text-left"
                >
                  👉 {isHi ? 'SSO Portal व OTR फॉर्म भरने की गाइड' : 'Rajasthan SSO OTR Registration Steps'}
                </button>
              </li>
              <li>
                <a
                  href="https://sso.rajasthan.gov.in/signin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition text-slate-400 flex items-center gap-1"
                >
                  👉 <span>Rajasthan SSO Login Direct Link</span>
                </a>
              </li>
              <li>
                <a
                  href="https://rsmssb.rajasthan.gov.in/page?menuName=Results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition text-slate-400 flex items-center gap-1"
                >
                  👉 <span>RSMSSB Official Results Archive</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Non-Government Disclaimer */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{isHi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer & Notice'}</span>
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-[11px] text-slate-400 leading-relaxed space-y-2">
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

        {/* FAQ Section - Frequently Asked Questions */}
        <div className="my-10 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isHi ? 'सहायता केंद्र एवं दिशा-निर्देश' : 'Help & Guidelines Center'}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isHi ? 'अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions)' : 'Frequently Asked Questions (FAQ)'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isHi
                  ? 'राजस्थान सरकारी भर्तियों की तैयारी, SSO OTR पंजीयन, आवश्यक दस्तावेज और परीक्षा नियमों से जुड़ी संपूर्ण जानकारी।'
                  : 'Essential answers on Rajasthan recruitment processes, SSO OTR registration, document requirements, and exam rules.'}
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', labelHi: 'सभी प्रश्न', labelEn: 'All FAQs' },
                { id: 'process', labelHi: 'भर्ती व OTR प्रक्रिया', labelEn: 'Recruitment & OTR' },
                { id: 'docs', labelHi: 'दस्तावेज व वैधता', labelEn: 'Document Criteria' },
                { id: 'prep', labelHi: 'परीक्षा नियम व तैयारी', labelEn: 'Exam & Rules' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isHi ? tab.labelHi : tab.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-bold text-amber-400 shrink-0 mt-0.5">
                        Q
                      </span>
                      <span className="text-sm font-semibold text-white leading-snug">
                        {isHi ? faq.qHi : faq.qEn}
                      </span>
                    </div>
                    <span className="text-slate-400 shrink-0 mt-1">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-700/50">
                      <p className="whitespace-pre-line text-slate-300">
                        {isHi ? faq.aHi : faq.aEn}
                      </p>
                      {faq.note && (
                        <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>{isHi ? faq.note.hi : faq.note.en}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RAJASTHAN VACCANCY/JOBS — {isHi ? 'सर्वाधिकार सुरक्षित | राजस्थान का विश्वसनीय भर्ती मंच' : 'All Rights Reserved. Clean & Searchable Govt Job Alerts.'}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-slate-400 cursor-pointer">{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
            <span className="hover:text-slate-400 cursor-pointer">{isHi ? 'नियम व शर्तें' : 'Terms of Use'}</span>
            <span className="hover:text-slate-400 cursor-pointer">{isHi ? 'संपर्क करें' : 'Contact Us'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
