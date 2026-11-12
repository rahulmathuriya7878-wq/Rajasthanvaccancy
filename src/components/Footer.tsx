import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  Globe
} from 'lucide-react';
import { LanguageMode, VacancyItem } from '../types';
import { INITIAL_VACANCIES } from '../data/mockVacancies';

interface FooterProps {
  lang: LanguageMode;
  onSelectPolicy: (policy: 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer') => void;
  onOpenAdminLogin?: () => void;
  onOpenUrlIndexation?: () => void;
  onSelectVacancy?: (item: VacancyItem) => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectPolicy,
  onOpenAdminLogin,
  onOpenUrlIndexation,
  onSelectVacancy,
  isAdmin = false,
}) => {
  const isHi = lang === 'hi';

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
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mb-8">
          {/* Official Portals Directory */}
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2" style={{ fontSize: '12pt' }}>
              {officialLinks.slice(0, 6).map((l, idx) => (
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
        </div>

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
