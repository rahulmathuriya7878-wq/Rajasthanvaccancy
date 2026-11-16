/**
 * SEO & Canonical URL Management Utility
 * Solves Google Search Console "Alternate page with proper canonical tag" indexation issues.
 * 
 * Rules enforced:
 * 1. Self-referential canonical tags on ALL crawlable pages (Homepage, Category pages, Vacancy detail pages).
 * 2. Unifies URL formats: canonicalizes ?vacancy=id across sitemaps, RSS, pushState, and social shares.
 * 3. Sanitizes tracking parameters (utm_*, fbclid, gclid, etc.) from canonical links.
 * 4. Ensures exactly one <link rel="canonical"> tag in <head>.
 * 5. Dynamically adapts to production domain (rajasthanvacancy.com or vercel.app).
 */

export const DEFAULT_PRODUCTION_ORIGIN = 'https://www.rajasthanvacancy.online';

/**
 * Detect the appropriate canonical base origin dynamically.
 * Prioritizes custom production domain (www.rajasthanvacancy.online) and cloud hosts.
 */
export function getCanonicalOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();
    
    // Primary custom domain support
    if (host.includes('rajasthanvacancy.online')) {
      return 'https://www.rajasthanvacancy.online';
    }
    // Cloudflare Pages support
    if (host.includes('pages.dev')) {
      return `https://${window.location.host}`;
    }
    // Custom domain variants
    if (host.includes('rajasthanvacancies.com')) {
      return 'https://rajasthanvacancies.com';
    }
    if (host.includes('rajasthanvacancy.com')) {
      return 'https://rajasthanvacancy.com';
    }
    // Vercel deployment domain
    if (host.includes('vercel.app')) {
      return `https://${window.location.host}`;
    }
    // Any live production domain that is not localhost or cloud development preview
    if (host !== 'localhost' && !host.includes('run.app') && !host.includes('127.0.0.1')) {
      return `https://${window.location.host}`;
    }
  }
  return DEFAULT_PRODUCTION_ORIGIN;
}

export interface CanonicalParams {
  vacancyId?: string | null;
  category?: string | null;
  pathname?: string | null;
}

/**
 * Calculates the exact canonical URL for the current view state.
 * Guarantees that every distinct view has a self-referential canonical tag
 * so search engines never misclassify pages as "Alternate page with proper canonical tag".
 */
export function buildCanonicalUrl(params: CanonicalParams = {}): string {
  const origin = getCanonicalOrigin();

  // 1. Vacancy / Post Detail View
  if (params.vacancyId) {
    const cleanId = params.vacancyId.replace(/^\/+|\/+$/g, '').trim();
    return `${origin}/?vacancy=${encodeURIComponent(cleanId)}`;
  }

  // 2. Category Archive View (e.g. ?category=latest_job, ?category=result, etc.)
  // CRITICAL: Category pages must have self-referential canonical tags to be indexed
  if (params.category && params.category !== 'ALL') {
    return `${origin}/?category=${encodeURIComponent(params.category)}`;
  }

  // 3. Fallback to clean path if specific valid subpath
  if (params.pathname) {
    const cleanPath = params.pathname.replace(/^\/+|\/+$/g, '').trim();
    if (cleanPath && !cleanPath.includes('.') && cleanPath !== '') {
      return `${origin}/?vacancy=${encodeURIComponent(cleanPath)}`;
    }
  }

  // 4. Default Home Portal URL with trailing slash (Google standard)
  return `${origin}/`;
}

/**
 * Applies the canonical link tag and OpenGraph URL tag to the document <head>.
 * Removes any stray duplicate canonical tags.
 */
export function applyCanonicalTag(canonicalUrl: string): void {
  if (typeof document === 'undefined') return;

  try {
    // Clean up any extra duplicate canonical tags that might have been injected
    const allCanonicals = document.querySelectorAll('link[rel="canonical"]');
    if (allCanonicals.length > 1) {
      for (let i = 1; i < allCanonicals.length; i++) {
        allCanonicals[i].remove();
      }
    }

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      canonicalEl.id = 'primary-canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // Sync OpenGraph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);
  } catch (err) {
    console.warn('Failed to apply canonical tag', err);
  }
}

export interface BreadcrumbTrailInput {
  origin?: string;
  lang?: 'hi' | 'en';
  categoryKey?: string | null;
  categoryLabel?: string | null;
  vacancyId?: string | null;
  vacancyTitle?: string | null;
  policyKey?: string | null;
  policyLabel?: string | null;
}

export function getBreadcrumbCategoryLabel(categoryKey: string, lang: 'hi' | 'en' = 'hi'): string {
  const map: Record<string, { hi: string; en: string }> = {
    latest_job: { hi: 'सरकारी नौकरियां (Latest Jobs)', en: 'Latest Jobs' },
    ugc_net: { hi: 'सरकारी नौकरियां (Latest Jobs)', en: 'Latest Jobs' },
    admit_card: { hi: 'प्रवेश पत्र (Admit Card)', en: 'Admit Cards' },
    result: { hi: 'परीक्षा परिणाम (Result)', en: 'Results' },
    answer_key: { hi: 'उत्तर कुंजी (Answer Key)', en: 'Answer Key' },
    scheme: { hi: 'सरकारी योजनाएं (Sarkari Yojana)', en: 'Sarkari Yojana' },
    news: { hi: 'लेटेस्ट न्यूज़ (Latest News)', en: 'Latest News' },
    exam_date: { hi: 'परीक्षा तिथियां (Exam Dates)', en: 'Exam Dates' },
    syllabus: { hi: 'पाठ्यक्रम (Syllabus)', en: 'Syllabus' },
    upcoming: { hi: 'आगामी भर्तियां (Upcoming)', en: 'Upcoming Vacancies' },
  };
  const entry = map[categoryKey];
  if (entry) return lang === 'hi' ? entry.hi : entry.en;
  return lang === 'hi' ? 'सरकारी भर्तियां (Latest Jobs)' : 'Latest Jobs';
}

export function normalizeBreadcrumbCategoryKey(categoryKey?: string | null): string {
  if (!categoryKey || categoryKey === 'ALL' || categoryKey === 'job' || categoryKey === 'ugc_net') {
    return 'latest_job';
  }
  return categoryKey;
}

/**
 * Builds a valid Schema.org BreadcrumbList JSON-LD object matching the current navigation hierarchy:
 * - Home: [Home]
 * - Category: [Home, Category]
 * - Job Post: [Home, Category, Job]
 * - Policy Page: [Home, Policy]
 */
export function buildBreadcrumbSchema(input: BreadcrumbTrailInput = {}) {
  const origin = (input.origin || getCanonicalOrigin()).replace(/\/+$/, '');
  const lang = input.lang || 'hi';
  const homeName = lang === 'hi' ? 'मुख्य पृष्ठ (Home)' : 'Home';
  const homeUrl = `${origin}/`;

  const items: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: homeUrl,
    },
  ];

  let pageCanonical = homeUrl;

  if (input.vacancyId) {
    const cleanCat = normalizeBreadcrumbCategoryKey(input.categoryKey);
    const catLabel = input.categoryLabel || getBreadcrumbCategoryLabel(cleanCat, lang);
    const catUrl = `${origin}/?category=${encodeURIComponent(cleanCat)}`;
    const jobUrl = `${origin}/?vacancy=${encodeURIComponent(input.vacancyId)}`;

    items.push({
      '@type': 'ListItem',
      position: 2,
      name: catLabel,
      item: catUrl,
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: input.vacancyTitle || input.vacancyId,
      item: jobUrl,
    });
    pageCanonical = jobUrl;
  } else if (input.categoryKey && input.categoryKey !== 'ALL') {
    const cleanCat = normalizeBreadcrumbCategoryKey(input.categoryKey);
    const catLabel = input.categoryLabel || getBreadcrumbCategoryLabel(cleanCat, lang);
    const catUrl = `${origin}/?category=${encodeURIComponent(cleanCat)}`;

    items.push({
      '@type': 'ListItem',
      position: 2,
      name: catLabel,
      item: catUrl,
    });
    pageCanonical = catUrl;
  } else if (input.policyKey) {
    const policyUrl = `${origin}/?policy=${encodeURIComponent(input.policyKey)}`;
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: input.policyLabel || input.policyKey,
      item: policyUrl,
    });
    pageCanonical = policyUrl;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageCanonical}#breadcrumb`,
    itemListElement: items,
  };
}

/**
 * Updates or injects <script id="dynamic-breadcrumb-schema-ld" type="application/ld+json">
 * in document <head> so Search Bots & Rich Results see the live breadcrumb hierarchy.
 */
export function applyBreadcrumbSchema(input: BreadcrumbTrailInput = {}): void {
  if (typeof document === 'undefined') return;
  try {
    // Ensure we never leave duplicate standalone BreadcrumbList scripts in <head>
    const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldScripts.forEach((scriptEl) => {
      if (scriptEl.id !== 'dynamic-breadcrumb-schema-ld' && scriptEl.textContent?.includes('"BreadcrumbList"') && !scriptEl.textContent?.includes('"@graph"')) {
        scriptEl.remove();
      }
    });

    let breadcrumbScript = document.getElementById('dynamic-breadcrumb-schema-ld') as HTMLScriptElement | null;
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = 'dynamic-breadcrumb-schema-ld';
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }
    const schema = buildBreadcrumbSchema(input);
    breadcrumbScript.textContent = JSON.stringify(schema, null, 2);
  } catch (err) {
    console.warn('Failed to apply dynamic BreadcrumbList JSON-LD', err);
  }
}

