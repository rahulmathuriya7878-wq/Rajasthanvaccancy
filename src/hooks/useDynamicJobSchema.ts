'use client';

import { useEffect, useMemo } from 'react';
import { LanguageMode, VacancyItem } from '../types';
import { resolveJobSchemaDates } from '../utils/dateUtils';
import { buildCanonicalUrl } from '../utils/seoCanonical';

export interface UseDynamicJobSchemaOptions {
  vacancy: VacancyItem | null;
  lang?: LanguageMode;
  origin?: string;
}

/**
 * Dynamically builds (via useMemo) and injects/updates `<script id="dynamic-job-schema-ld" type="application/ld+json">`
 * in `document.head` (via useEffect) with strictly validated ISO 8601 `datePosted` and `validThrough` dates
 * for Google Rich Results compliance.
 */
export function useDynamicJobSchema({
  vacancy,
  lang = 'hi',
  origin,
}: UseDynamicJobSchemaOptions): void {
  const jobSchemaJson = useMemo(() => {
    if (!vacancy) return null;

    const isHi = lang === 'hi';
    const canonicalUrl = buildCanonicalUrl({ vacancyId: vacancy.id });
    const baseOrigin = (origin || 'https://www.rajasthanvacancy.online').replace(/\/+$/, '');
    const title = isHi ? vacancy.titleHi || vacancy.title : vacancy.title;
    const description =
      (isHi
        ? vacancy.briefSummaryHi || vacancy.descriptionHi
        : vacancy.briefSummary || vacancy.description) ||
      `${title} - Rajasthan Vacancy 2026`;

    const { datePosted, validThrough } = resolveJobSchemaDates(vacancy);
    const orgName =
      vacancy.departmentHi ||
      vacancy.department ||
      vacancy.organization ||
      'Rajasthan Government Department';
    const orgUrl = vacancy.officialLinks?.officialWebsiteUrl || `${baseOrigin}/`;

    if (vacancy.category === 'scheme') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `${canonicalUrl}#article`,
          headline: title,
          description,
          datePublished: datePosted,
          dateModified: datePosted,
          author: {
            '@type': 'Organization',
            name: 'Rajasthan Vacancy Editorial Team',
            url: `${baseOrigin}/`,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Rajasthan Vacancy',
            url: `${baseOrigin}/`,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
          },
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        '@id': `${canonicalUrl}#job`,
        title,
        description,
        identifier: {
          '@type': 'PropertyValue',
          name: orgName,
          value: vacancy.id,
        },
        datePosted,
        validThrough,
        employmentType: 'FULL_TIME',
        directApply: true,
        applicantLocationRequirements: {
          '@type': 'Country',
          name: 'India',
        },
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: 28500,
            unitText: 'MONTH',
          },
        },
        hiringOrganization: {
          '@type': 'Organization',
          name: orgName,
          sameAs: orgUrl,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: vacancy.jobLocation || 'Rajasthan',
            addressCountry: 'IN',
          },
        },
      },
      null,
      2
    );
  }, [vacancy, lang, origin]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Remove legacy duplicate script if present so Rich Results sees a single canonical schema
    const legacyEl = document.getElementById('vacancy-job-posting-ld');
    if (legacyEl) {
      legacyEl.remove();
    }

    if (!jobSchemaJson) {
      const existing = document.getElementById('dynamic-job-schema-ld');
      if (existing) existing.remove();
      return;
    }

    let scriptEl = document.getElementById('dynamic-job-schema-ld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-job-schema-ld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = jobSchemaJson;

    return () => {
      const target = document.getElementById('dynamic-job-schema-ld');
      if (target && !jobSchemaJson) {
        target.remove();
      }
    };
  }, [jobSchemaJson]);
}
