'use client';

import { useEffect, useMemo } from 'react';
import { CategoryType, LanguageMode, VacancyItem } from '../types';
import { getCanonicalOrigin } from '../utils/seoCanonical';
import { buildFaqPageJsonLd } from '../utils/faqSchemaBuilder';

export interface UseDynamicFaqSchemaOptions {
  vacancy: VacancyItem | null;
  selectedCategory?: CategoryType | 'ALL';
  vacancies?: VacancyItem[];
  activePolicyView?: string | null;
  lang?: LanguageMode;
}

/**
 * Keeps `<script id="dynamic-faq-schema-ld" type="application/ld+json">` synchronized
 * with the active post's dynamic content FAQs (Admit Card, Result, Jobs, Schemes)
 * or category archive FAQs (Admit Card / Result sections) or default portal FAQs.
 */
export function useDynamicFaqSchema({
  vacancy,
  selectedCategory = 'ALL',
  vacancies = [],
  activePolicyView = null,
  lang = 'hi',
}: UseDynamicFaqSchemaOptions): void {
  const faqJson = useMemo(() => {
    if (activePolicyView && !vacancy) {
      return null;
    }

    return buildFaqPageJsonLd({
      vacancy,
      category: selectedCategory,
      vacancies,
      lang,
      origin: getCanonicalOrigin(),
    });
  }, [vacancy, selectedCategory, vacancies, activePolicyView, lang]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let faqScript = document.getElementById('dynamic-faq-schema-ld') as HTMLScriptElement | null;

    if (!faqJson) {
      if (faqScript) {
        faqScript.textContent = '';
      }
      return;
    }

    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.id = 'dynamic-faq-schema-ld';
      faqScript.type = 'application/ld+json';
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = faqJson;
  }, [faqJson]);
}
