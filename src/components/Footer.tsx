'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOptionalPortal } from '../context/PortalContext';
import { LanguageMode, VacancyItem } from '../types';

interface FooterProps {
  lang?: LanguageMode;
  onSelectPolicy?: (policy: 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap') => void;
  onSelectVacancy?: (item: VacancyItem) => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang: langProp,
  onSelectPolicy: onSelectPolicyProp,
  onSelectVacancy: onSelectVacancyProp,
  isAdmin: isAdminProp,
}) => {
  const { isAdmin: authIsAdmin } = useAuth();
  const portal = useOptionalPortal();
  const lang = langProp ?? portal?.lang ?? 'hi';
  const onSelectPolicy = onSelectPolicyProp ?? portal?.handleSelectPolicy ?? (() => {});
  const onSelectVacancy = onSelectVacancyProp ?? portal?.handleSelectVacancy;
  const isAdmin = isAdminProp ?? authIsAdmin;
  const isHi = lang === 'hi';

  return (
    <footer 
      className="w-full bg-white text-slate-700 pt-6 pb-24 sm:py-8 mt-10 border-t border-slate-200 shadow-sm"
      style={{
        fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '12pt'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Crawl & Quick Web Directory (Visible to Admin only; public pages already expose all visible <a> links) */}
        {isAdmin && (
          <div className="mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>{isHi ? 'महत्वपूर्ण सरकारी भर्ती एवं योजना डायरेक्टरी (Quick Web Links)' : 'Rajasthan Govt Jobs & Schemes Directory'}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {isHi 
                ? 'गूगल सर्च बॉट्स एवं छात्रों की सीधी पहुंच हेतु पोर्टल की सभी सक्रिय भर्तियों के डायरेक्ट लिंक:' 
                : 'Direct crawlable hyperlinks for candidates and search engine indexing:'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {(portal?.vacancies ?? []).map((vac) => {
                const postTitle = isHi ? (vac.titleHi || vac.title) : vac.title;
                return (
                  <a
                    key={vac.id}
                    href={`/?vacancy=${encodeURIComponent(vac.id)}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
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
        )}

        {/* Bottom copyright & Policy Links */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-slate-600" style={{ fontSize: '12pt' }}>
          <div>
            © {new Date().getFullYear()} RAJASTHAN JOBS/VACANCY — {isHi ? 'सर्वाधिकार सुरक्षित | राजस्थान का विश्वसनीय भर्ती मंच' : 'All Rights Reserved. Clean & Searchable Govt Job Alerts.'}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5" style={{ fontSize: '12pt' }}>
            {isAdmin && (
              <>
                <a
                  href="/?policy=sitemap"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectPolicy('sitemap');
                  }}
                  className="hover:text-amber-600 transition cursor-pointer font-semibold text-slate-700"
                >
                  {isHi ? 'साइटमैप (Sitemap)' : 'Sitemap'}
                </a>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition">
                  XML Sitemap
                </a>
              </>
            )}
            <a
              href="/?policy=about"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectPolicy('about');
              }}
              className="text-slate-600 no-underline hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'हमारे बारे में (About Us)' : 'About Us'}
            </a>
            <a
              href="/?policy=contact"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectPolicy('contact');
              }}
              className="text-slate-600 no-underline hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'संपर्क करें (Contact Us)' : 'Contact Us'}
            </a>
            <a
              href="/?policy=privacy"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectPolicy('privacy');
              }}
              className="text-slate-600 no-underline hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
            </a>
            <a
              href="/?policy=terms"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectPolicy('terms');
              }}
              className="text-slate-600 no-underline hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'नियम व शर्तें (Terms)' : 'Terms & Conditions'}
            </a>
            <a
              href="/?policy=disclaimer"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectPolicy('disclaimer');
              }}
              className="text-slate-600 no-underline hover:text-amber-700 transition cursor-pointer"
            >
              {isHi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
