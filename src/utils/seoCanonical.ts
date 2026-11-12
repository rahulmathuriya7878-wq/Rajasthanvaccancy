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

export const DEFAULT_PRODUCTION_ORIGIN = 'https://rajasthanvaccancy.pages.dev';

/**
 * Detect the appropriate canonical base origin dynamically.
 * Prioritizes Cloudflare Pages (rajasthanvaccancy.pages.dev) and custom domains.
 */
export function getCanonicalOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();
    
    // Cloudflare Pages support
    if (host.includes('pages.dev')) {
      return `https://${window.location.host}`;
    }
    // Custom domain support
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
      return window.location.origin;
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
