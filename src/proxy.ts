import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays } from '@/utils/dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN as CANONICAL_ORIGIN, normalizeBreadcrumbCategoryKey } from '@/utils/seoCanonical';

const KNOWN_POLICY_ALIASES: Record<string, string> = {
  about: 'about',
  'about-us': 'about',
  contact: 'contact',
  'contact-us': 'contact',
  privacy: 'privacy',
  'privacy-policy': 'privacy',
  terms: 'terms',
  'terms-and-conditions': 'terms',
  disclaimer: 'disclaimer',
  sitemap: 'sitemap',
};

const KNOWN_CATEGORIES = new Set([
  'latest_job',
  'admit_card',
  'result',
  'answer_key',
  'scheme',
  'news',
  'exam_date',
  'syllabus',
  'upcoming',
  'ugc_net',
  'job',
]);

const ACTIVE_VACANCY_SLUG_MAP: Map<string, string> = new Map(
  filterActivePostsWithinDays(INITIAL_VACANCIES).map((v) => [v.id.toLowerCase(), v.id])
);

const NOISE_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'yclid',
  'mc_cid',
  'mc_eid',
  'm',
  'amp',
  'ref',
  'si',
  'source',
  '_ga',
]);

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const rawHost = (request.headers.get('host') || '').toLowerCase();
  const hostname = rawHost.split(':')[0];
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  const rawPath = nextUrl.pathname || '/';

  // Skip API routes, Next.js internals, and static files with extensions (except /index.html)
  if (
    rawPath.startsWith('/api/') ||
    rawPath.startsWith('/_next/') ||
    (rawPath !== '/index.html' && /\.[a-z0-9]+$/i.test(rawPath))
  ) {
    return NextResponse.next();
  }

  // Canonical host/index.html redirect
  if (rawPath === '/index.html') {
    const target = nextUrl.clone();
    target.pathname = '/';
    return NextResponse.redirect(target, 301);
  }

  if (!isLocalHost && hostname === 'rajasthanvacancy.online') {
    const target = new URL(`${nextUrl.pathname}${nextUrl.search}`, CANONICAL_ORIGIN);
    return NextResponse.redirect(target, 301);
  }

  // Canonical slug & query normalization for GET/HEAD
  if (request.method === 'GET' || request.method === 'HEAD') {
    const cleanPath = rawPath.replace(/^\/+|\/+$/g, '');
    const lowerPath = cleanPath.toLowerCase();

    if (!nextUrl.searchParams.get('tool') && !nextUrl.searchParams.get('indexation') && !nextUrl.searchParams.get('search')) {
      if (cleanPath && KNOWN_POLICY_ALIASES[lowerPath]) {
        const target = nextUrl.clone();
        target.pathname = '/';
        target.search = `?policy=${encodeURIComponent(KNOWN_POLICY_ALIASES[lowerPath])}`;
        return NextResponse.redirect(target, 301);
      }

      if (cleanPath && KNOWN_CATEGORIES.has(lowerPath)) {
        const normCat = normalizeBreadcrumbCategoryKey(lowerPath);
        const target = nextUrl.clone();
        target.pathname = '/';
        target.search = `?category=${encodeURIComponent(normCat)}`;
        return NextResponse.redirect(target, 301);
      }

      if (cleanPath && !cleanPath.includes('.') && cleanPath !== 'photo-signature-resize-tool') {
        const matchedId = ACTIVE_VACANCY_SLUG_MAP.get(lowerPath);
        if (matchedId) {
          const target = nextUrl.clone();
          target.pathname = '/';
          target.search = `?vacancy=${encodeURIComponent(matchedId)}`;
          return NextResponse.redirect(target, 301);
        }
      }

      const queryCategory = nextUrl.searchParams.get('category');
      if (queryCategory && queryCategory.toUpperCase() === 'ALL') {
        const target = nextUrl.clone();
        target.pathname = '/';
        target.search = '';
        return NextResponse.redirect(target, 301);
      }

      // Strip tracking noise params on homepage
      if (rawPath === '/') {
        const keys = Array.from(nextUrl.searchParams.keys());
        if (keys.some((k) => NOISE_QUERY_PARAMS.has(k.toLowerCase()))) {
          const target = nextUrl.clone();
          keys.forEach((k) => {
            if (NOISE_QUERY_PARAMS.has(k.toLowerCase())) {
              target.searchParams.delete(k);
            }
          });
          return NextResponse.redirect(target, 301);
        }
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  const isPreviewMirrorHost =
    hostname.endsWith('.run.app') ||
    hostname.endsWith('.pages.dev') ||
    hostname.endsWith('.workers.dev');
  if (isPreviewMirrorHost) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
