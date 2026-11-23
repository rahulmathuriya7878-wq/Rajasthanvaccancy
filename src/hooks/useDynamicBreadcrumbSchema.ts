'use client';

import { useEffect } from 'react';
import { LanguageMode, VacancyItem } from '../types';
import {
  applyBreadcrumbSchema,
  getBreadcrumbCategoryLabel,
  getCanonicalOrigin,
  normalizeBreadcrumbCategoryKey,
} from '../utils/seoCanonical';

export type ActivePolicyType = 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap' | null;

export interface UseDynamicBreadcrumbSchemaOptions {
  lang: LanguageMode;
  selectedCategory: string;
  selectedVacancy: VacancyItem | null;
  activePolicyView?: ActivePolicyType;
}

const POLICY_LABELS: Record<string, { hi: string; en: string }> = {
  about: { hi: 'हमारे बारे में (About Us)', en: 'About Us' },
  contact: { hi: 'संपर्क करें (Contact Us)', en: 'Contact Us' },
  privacy: { hi: 'गोपनीयता नीति (Privacy Policy)', en: 'Privacy Policy' },
  terms: { hi: 'नियम एवं शर्तें (Terms & Conditions)', en: 'Terms & Conditions' },
  disclaimer: { hi: 'अस्वीकरण (Disclaimer)', en: 'Disclaimer' },
  sitemap: { hi: 'साइटमैप (Sitemap)', en: 'Sitemap' },
};

/**
 * Dynamically updates <script id="dynamic-breadcrumb-schema-ld" type="application/ld+json">
 * in document <head> to match the active navigation hierarchy:
 * - Main Page: Home
 * - Category View: Home > Selected Category
 * - Full Job Post: Home > Category > Job Title
 * - Policy Page: Home > Policy Title
 */
export function useDynamicBreadcrumbSchema({
  lang,
  selectedCategory,
  selectedVacancy,
  activePolicyView = null,
}: UseDynamicBreadcrumbSchemaOptions): void {
  useEffect(() => {
    const origin = getCanonicalOrigin();
    const isHi = lang === 'hi';

    if (selectedVacancy) {
      const rawCategory =
        selectedCategory && selectedCategory !== 'ALL'
          ? selectedCategory
          : selectedVacancy.category;
      const categoryKey = normalizeBreadcrumbCategoryKey(rawCategory);
      const categoryLabel = getBreadcrumbCategoryLabel(categoryKey, lang);
      const vacancyTitle = isHi
        ? selectedVacancy.titleHi || selectedVacancy.shortTitleHi || selectedVacancy.title
        : selectedVacancy.title || selectedVacancy.shortTitle;

      applyBreadcrumbSchema({
        origin,
        lang,
        categoryKey,
        categoryLabel,
        vacancyId: selectedVacancy.id,
        vacancyTitle,
      });
      return;
    }

    if (selectedCategory && selectedCategory !== 'ALL') {
      const categoryKey = normalizeBreadcrumbCategoryKey(selectedCategory);
      applyBreadcrumbSchema({
        origin,
        lang,
        categoryKey,
        categoryLabel: getBreadcrumbCategoryLabel(categoryKey, lang),
      });
      return;
    }

    if (activePolicyView) {
      const policyMeta = POLICY_LABELS[activePolicyView];
      applyBreadcrumbSchema({
        origin,
        lang,
        policyKey: activePolicyView,
        policyLabel: policyMeta ? (isHi ? policyMeta.hi : policyMeta.en) : activePolicyView,
      });
      return;
    }

    applyBreadcrumbSchema({ origin, lang });
  }, [lang, selectedCategory, selectedVacancy, activePolicyView]);
}
