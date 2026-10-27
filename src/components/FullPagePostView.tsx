import React, { useEffect } from 'react';
import { VacancyDetailPage } from './VacancyDetailPage';
import { VacancyItem, LanguageMode } from '../types';

/**
 * Custom hook for FullPagePostView that automatically updates the document's <head>
 * with dynamic meta tags for title, description, and a canonical URL specific to
 * the currently selected job post, ensuring optimal search engine crawling and indexing.
 */
export function useFullPagePostMeta(vacancy?: VacancyItem | null, lang: LanguageMode = 'hi') {
  useEffect(() => {
    if (!vacancy) return;

    const originalTitle = document.title;
    const isHi = lang === 'hi';
    const postTitle = isHi ? (vacancy.titleHi || vacancy.title) : vacancy.title;
    const cleanTitle = `${postTitle} - Rajasthan Vacancy 2026`;
    document.title = cleanTitle;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    const newDesc = `${postTitle}: कुल पद ${vacancy.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    if (metaDesc) {
      metaDesc.setAttribute('content', newDesc);
    }

    // OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', cleanTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', newDesc);

    // Canonical URL
    let canonicalLinkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonicalHref = canonicalLinkEl?.getAttribute('href') || 'https://rajasthanvaccancy.vercel.app/';
    const postCanonicalUrl = `https://rajasthanvaccancy.vercel.app/?vacancy=${vacancy.id}`;
    if (!canonicalLinkEl) {
      canonicalLinkEl = document.createElement('link');
      canonicalLinkEl.rel = 'canonical';
      document.head.appendChild(canonicalLinkEl);
    }
    canonicalLinkEl.setAttribute('href', postCanonicalUrl);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
      if (canonicalLinkEl) canonicalLinkEl.setAttribute('href', originalCanonicalHref);
    };
  }, [vacancy, lang]);
}

interface FullPagePostViewProps {
  vacancy: VacancyItem;
  onBack: () => void;
  lang: LanguageMode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  allVacancies: VacancyItem[];
  onSelectOtherVacancy: (item: VacancyItem) => void;
  onEditVacancy?: (vacancy: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  onUpdateVacancy?: (updatedJob: VacancyItem) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  isAlertSet?: boolean;
  onToggleAlertMe?: (id: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const FullPagePostView: React.FC<FullPagePostViewProps> = (props) => {
  useFullPagePostMeta(props.vacancy, props.lang);
  return <VacancyDetailPage {...props} />;
};

export default FullPagePostView;
