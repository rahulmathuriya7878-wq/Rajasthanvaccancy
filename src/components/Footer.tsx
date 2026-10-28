import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  AlertCircle,
  Scale,
  Globe
} from 'lucide-react';
import { LanguageMode, VacancyItem } from '../types';
import { INITIAL_VACANCIES } from '../data/mockVacancies';

interface FooterProps {
  lang: LanguageMode;
  onOpenAgeCalc: () => void;
  onOpenCalendar: () => void;
  onOpenSSOGuide: () => void;
  onSelectPolicy: (policy: 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer') => void;
  onOpenAdminLogin?: () => void;
  onOpenUrlIndexation?: () => void;
  onSelectVacancy?: (item: VacancyItem) => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onOpenAgeCalc,
  onOpenCalendar,
  onOpenSSOGuide,
  onSelectPolicy,
  onOpenAdminLogin,
  onOpenUrlIndexation,
  onSelectVacancy,
  isAdmin = false,
}) => {
  const isHi = lang === 'hi';
  const [showFullLegal, setShowFullLegal] = useState<boolean>(false);

  const officialLinks = [
    { name: 'WhatsApp चैनल (Official Alerts)', url: 'https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e' },
    { name: 'Telegram चैनल (Official Channel)', url: 'https://t.me/newrajsthanjobs' },
    { name: 'राजस्थान वैकेंसी (Home Portal)', url: 'https://rajasthanvaccancy.vercel.app/' },
    { name: 'RSMSSB (कर्मचारी चयन बोर्ड)', url: 'https://rsmssb.rajasthan.gov.in' },
    { name: 'RPSC (राजस्थान लोक सेवा आयोग)', url: 'https://rpsc.rajasthan.gov.in' },
    { name: 'Rajasthan SSO Portal (sso.rajasthan.gov.in)', url: 'https://sso.rajasthan.gov.in' },
    { name: 'Rajasthan Police (राजस्थान पुलिस)', url: 'https://police.rajasthan.gov.in' },
    { name: 'BSER REET Board Ajmer', url: 'https://rajeduboard.rajasthan.gov.in' },
    { name: 'Jan Soochna Portal Rajasthan', url: 'https://jansoochna.rajasthan.gov.in' },
  ];

  return (
    <footer 
      className="w-full bg-white text-slate-700 pt-10 pb-8 mt-12 border-t border-slate-200 shadow-sm"
      style={{
        fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '12pt'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Official Portals Directory */}
          <div>
            <h4 
              className="text-slate-900 font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5"
              style={{ 
                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                fontSize: '14pt', 
                fontWeight: 'bold' 
              }}
            >
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>{isHi ? 'आधिकारिक सरकारी वेबसाइटें' : 'Official Government Portals'}</span>
            </h4>
            <ul className="space-y-2" style={{ fontSize: '12pt' }}>
              {officialLinks.slice(0, 5).map((l, idx) => (
                <li key={idx}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-600 transition flex items-center gap-1.5 text-slate-600 font-medium"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>{l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Candidate Fast Tools */}
          <div>
            <h4 
              className="text-slate-900 font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5"
              style={{ 
                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                fontSize: '14pt', 
                fontWeight: 'bold' 
              }}
            >
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              <span>{isHi ? 'परीक्षा कैलेंडर' : 'Exam Calendar'}</span>
            </h4>
            <ul className="space-y-2" style={{ fontSize: '12pt' }}>
              <li>
                <button
                  onClick={onOpenCalendar}
                  className="hover:text-amber-600 transition text-slate-600 font-medium text-left cursor-pointer"
                >
                  👉 {isHi ? 'RSMSSB/RPSC वार्षिक परीक्षा कैलेंडर 2025-26' : 'Exam Schedule & Calendar 2025-26'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSSOGuide}
                  className="hover:text-amber-600 transition text-slate-600 font-medium text-left cursor-pointer"
                >
                  👉 {isHi ? 'SSO ID व OTR संपूर्ण गाइडलाइन' : 'SSO ID & OTR Complete Guide'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAgeCalc}
                  className="hover:text-amber-600 transition text-slate-600 font-medium text-left cursor-pointer"
                >
                  👉 {isHi ? 'आयु सीमा कैलकुलेटर (Age Calculator)' : 'Age Eligibility Calculator'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: कानूनी जानकारी व डिस्क्लेमर (Legal Information & Disclaimer) */}
          <div>
            <h4 
              className="text-slate-900 font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5"
              style={{ 
                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                fontSize: '14pt', 
                fontWeight: 'bold' 
              }}
            >
              <Scale className="w-5 h-5 text-rose-600" />
              <span>{isHi ? 'कानूनी जानकारी व डिस्क्लेमर' : 'Legal & Disclaimer Notice'}</span>
            </h4>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-slate-600 leading-relaxed space-y-2.5" style={{ fontSize: '11pt' }}>
              <div className="flex items-start gap-1.5 font-bold text-slate-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {isHi
                    ? 'गैर-सरकारी पोर्टल स्पष्टीकरण (Non-Affiliation Notice):'
                    : 'Non-Government Portal Clarification:'}
                </span>
              </div>
              <p>
                {isHi
                  ? 'RAJASTHAN JOBS/VACANCY एक गैर-सरकारी एवं निजी सूचनात्मक पोर्टल है। हम किसी भी सरकारी एजेंसी, विभाग अथवा आयोग (RSMSSB, RPSC) से आधिकारिक रूप से संबद्ध नहीं हैं।'
                  : 'RAJASTHAN JOBS/VACANCY is an independent job aggregation and candidate informational portal. We are not affiliated with the Government of Rajasthan or any recruitment commission.'}
              </p>
              <p>
                {isHi
                  ? 'अभ्यर्थियों को सलाह दी जाती है कि आवेदन करने या शुल्क जमा करने से पूर्व संबंधित विभाग के अधिकृत राजपत्र व मूल नोटिफिकेशन का अवलोकन अवश्य करें।'
                  : 'Candidates are strictly advised to consult the official Gazette / Notification PDFs released by respective boards before making application fee payments.'}
              </p>
              
              <button
                onClick={() => setShowFullLegal(!showFullLegal)}
                className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>{showFullLegal ? (isHi ? 'विस्तृत विधिक नियम छुपाएं ▲' : 'Hide Full Legal Terms ▲') : (isHi ? 'विस्तृत विधिक जानकारी देखें ▼' : 'View Full Legal Details ▼')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Detailed Legal & Cyber Security Advisory */}
        {showFullLegal && (
          <div className="mb-8 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Scale className="w-5 h-5 text-slate-800" />
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                {isHi ? 'विस्तृत कानूनी नियम, साइबर सुरक्षा चेतावनी व दायित्व विमुक्ति' : 'Comprehensive Statutory Disclaimers & Legal Compliance'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>1. दायित्व की सीमा एवं सूचना की शुद्धता (Accuracy & Limitation of Liability)</span>
                  </h5>
                  <p className="text-slate-600">
                    हमारा उद्देश्य केवल जनहित में विभिन्न सरकारी वेबसाइटों, दैनिक समाचार पत्रों एवं रोजगार विज्ञापनों से प्राप्त सूचनाओं को सरल हिंदी भाषा में छात्रों तक पहुँचाना है। यद्यपि हम प्रत्येक सूचना की पूर्ण प्रामाणिकता सुनिश्चित करने का भरसक प्रयास करते हैं, परंतु मानवीय भूल, टाइपिंग त्रुटि या विभाग द्वारा अंतिम समय में किए गए परिवर्तनों के लिए यह पोर्टल किसी भी प्रकार से कानूनी रूप से उत्तरदायी नहीं होगा।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>2. साइबर धोखाधड़ी व फर्जीवाड़े से सुरक्षा चेतावनी (Anti-Scam & Fraud Advisory)</span>
                  </h5>
                  <p className="text-slate-600">
                    हमारा पोर्टल किसी भी अभ्यर्थी से प्रत्यक्ष रूप से कोई बैंक खाता नंबर, यूपीआई पिन, क्रेडिट/डेबिट कार्ड सीवीवी अथवा आवेदन शुल्क की मांग नहीं करता है। सरकारी भर्ती का शुल्क केवल संबंधित विभाग के अधिकृत पेमेंट गेटवे (जैसे राजस्थान SSO / e-Mitra / SBI e-Pay) पर ही जमा होता है। नौकरी लगवाने के नाम पर पैसे मांगने वाले किसी भी व्यक्ति या गिरोह के झांसे में न आएं।
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>3. कॉपीराइट, ट्रेडमार्क व उचित उपयोग (Fair Use & Intellectual Property)</span>
                  </h5>
                  <p className="text-slate-600">
                    इस पोर्टल पर प्रदर्शित सरकारी विभागों, आयोगों, मंत्रालयों के लोगो, प्रतीक चिह्न एवं नाम उनके संबंधित सांविधिक निकायों की बौद्धिक संपदा हैं। इनका उपयोग भारतीय कॉपीराइट अधिनियम की धारा 52 (उचित व्यवहार/Fair Use) के अंतर्गत केवल समाचार संकलन, शैक्षणिक मार्गदर्शन एवं पहचान के उद्देश्य से किया गया है।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>4. शिकायत निवारण एवं संपर्क (Grievance Redressal & DMCA Compliance)</span>
                  </h5>
                  <p className="text-slate-600">
                    यदि किसी भी संस्था, विभाग अथवा उपयोगकर्ता को पोर्टल पर उपलब्ध किसी सूचना, लिंक या सामग्री से कोई आपत्ति है, तो वे तुरंत हमारी संपर्क टीम को ईमेल द्वारा सूचित कर सकते हैं। सत्यापन के पश्चात उचित संशोधन या सामग्री को 24-48 घंटों के भीतर हटा दिया जाएगा।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crawlable Internal Links Section (Googlebot Crawl Directory) */}
        <div className={isAdmin ? "my-8 pt-6 border-t border-slate-200" : "sr-only"}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'महत्वपूर्ण सरकारी भर्ती एवं योजना डायरेक्टरी (Quick Web Links)' : 'Rajasthan Govt Jobs & Schemes Directory'}</span>
            </h4>
            {isAdmin && onOpenUrlIndexation && (
              <button
                onClick={onOpenUrlIndexation}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title={isHi ? 'Google Search Console URL Indexation Assistant' : 'URL Indexation Assistant'}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHi ? 'सर्च कंसोल इंडेक्सेशन (GSC)' : 'URL Indexation'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {isHi 
              ? 'गूगल सर्च बॉट्स एवं छात्रों की सीधी पहुंच हेतु पोर्टल की सभी सक्रिय भर्तियों के डायरेक्ट लिंक:' 
              : 'Direct crawlable hyperlinks for candidates and search engine indexing:'}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {INITIAL_VACANCIES.map((vac) => {
              const postTitle = isHi ? (vac.titleHi || vac.title) : vac.title;
              return (
                <a
                  key={vac.id}
                  href={`/?vacancy=${vac.id}`}
                  onClick={(e) => {
                    if (onSelectVacancy) {
                      e.preventDefault();
                      onSelectVacancy(vac);
                    }
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-md transition text-xs font-medium"
                >
                  {postTitle}
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500" style={{ fontSize: '12pt' }}>
          <div>
            © {new Date().getFullYear()} RAJASTHAN JOBS/VACANCY — {isHi ? 'सर्वाधिकार सुरक्षित | राजस्थान का विश्वसनीय भर्ती मंच' : 'All Rights Reserved. Clean & Searchable Govt Job Alerts.'}
          </div>
          <div className="flex flex-wrap items-center gap-4" style={{ fontSize: '12pt' }}>
            {isAdmin && onOpenUrlIndexation && (
              <button onClick={onOpenUrlIndexation} className="text-emerald-700 font-bold hover:text-emerald-800 transition cursor-pointer flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{isHi ? 'URL Indexation' : 'URL Indexation'}</span>
              </button>
            )}
            <button onClick={() => onSelectPolicy('privacy')} className="hover:text-amber-600 transition cursor-pointer">
              {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </button>
            <button onClick={() => onSelectPolicy('terms')} className="hover:text-amber-600 transition cursor-pointer">
              {isHi ? 'नियम व शर्तें' : 'Terms & Conditions'}
            </button>
            <button onClick={() => onSelectPolicy('contact')} className="hover:text-amber-600 transition cursor-pointer">
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </button>
            <button onClick={() => onSelectPolicy('about')} className="hover:text-amber-600 transition cursor-pointer">
              {isHi ? 'हमारे बारे में' : 'About Us'}
            </button>
            <button onClick={() => onSelectPolicy('disclaimer')} className="hover:text-amber-600 transition cursor-pointer">
              {isHi ? 'अस्वीकरण' : 'Disclaimer'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
