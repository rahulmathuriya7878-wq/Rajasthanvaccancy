import React, { useEffect } from 'react';
import { VacancyDetailPage } from './VacancyDetailPage';
import { VacancyItem, LanguageMode } from '../types';

/**
 * useDocumentHeadMeta
 * Custom hook for FullPagePostView that automatically updates the document's <head>
 * with dynamic meta tags for title, description, OpenGraph tags, and canonical URL
 * specific to the currently selected job post, ensuring optimal search engine crawling and indexing.
 */
export function useDocumentHeadMeta(vacancy?: VacancyItem | null, lang: LanguageMode = 'hi') {
  useEffect(() => {
    if (!vacancy) return;

    const originalTitle = document.title;
    const isHi = lang === 'hi';
    const postTitle = isHi ? (vacancy.titleHi || vacancy.title) : vacancy.title;
    const cleanTitle = `${postTitle} - Rajasthan Vacancy 2026`;
    document.title = cleanTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    const newDesc = `${postTitle}: कुल पद ${vacancy.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', newDesc);

    // OpenGraph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', cleanTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', newDesc);

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

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', postCanonicalUrl);
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) metaDesc.setAttribute('content', originalDesc);
      if (canonicalLinkEl) canonicalLinkEl.setAttribute('href', originalCanonicalHref);
    };
  }, [vacancy, lang]);
}

// Backwards compatibility alias
export const useFullPagePostMeta = useDocumentHeadMeta;

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
  useDocumentHeadMeta(props.vacancy, props.lang);
  return <VacancyDetailPage {...props} />;
};

export default FullPagePostView;
