import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSessionEdge';

const CANONICAL_ORIGIN = (() => {
  const fallback = 'https://rajasthanvacancy.online';
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return fallback;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!parsed.hostname.includes('.') || /^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
      return fallback;
    }
    return parsed.origin;
  } catch {
    return fallback;
  }
})();

function normalizeCategoryKey(category: string): string {
  const lower = category.trim().toLowerCase();
  return lower === 'ugc_net' || lower === 'job' ? 'latest_job' : lower;
}

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

const ACTIVE_VACANCY_SLUGS: readonly string[] = [
  'uptet-2026-notification-online-form',
  'rrc-nr-apprentice-recruitment-2026',
  'dsssb-sweeper-chowkidar-recruitment-2026',
  'indian-army-tes-57-recruitment-2026',
  'ibps-so-specialist-officer-recruitment-2026',
  'rajasthan-police-constable-recruitment-2026',
  'rajasthan-high-court-system-assistant-clerk-2026',
  'ssc-gd-constable-recruitment-2026',
  'rajasthan-palanhar-yojana-2026',
  'rajasthan-cet-admit-card-2026',
  'gopal-credit-card-yojana-2026',
  'rrb-group-d-result-2026',
  'rpsc-protection-officer-admit-card-2026',
  'rsmssb-teaching-associate-admit-card-2026',
  'ibps-rrb-officer-scale-1-admit-card-2026',
  'ssc-cgl-tier-1-result-2026',
  'rsmssb-junior-instructor-result-2026',
  'ibps-po-mains-result-scorecard-2026',
  'rpsc-ras-prelims-exam-date-2026',
  'ssc-chsl-tier-1-exam-date-2026',
  'upsc-ifs-mains-exam-schedule-2026',
  'rajasthan-sjed-scholarship-last-date-news-2026',
  'cm-higher-education-scholarship-yojana-2026',
  'devnarayan-chhatra-scooty-yojana-2026',
  'kalibai-scooty-yojana-2026',
];

const ACTIVE_VACANCY_SLUG_MAP = new Map<string, string>([
  ...ACTIVE_VACANCY_SLUGS.map((id): [string, string] => [id.toLowerCase(), id]),
  ['rajasthan-cet-12th-level-admit-card-2026', 'rajasthan-cet-admit-card-2026'],
]);

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

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const rawHost = (request.headers.get('host') || '').toLowerCase();
  const hostname = rawHost.split(':')[0];
  const isLocalHost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  const rawPath = nextUrl.pathname || '/';

  // Enforce Edge session / bearer auth check on protected /api/admin/* routes
  if (rawPath.startsWith('/api/admin/') && rawPath !== '/api/admin/session') {
    const authHeader = request.headers.get('authorization') || '';
    const hasBearer = authHeader.toLowerCase().startsWith('bearer ') && authHeader.length > 25;
    if (!hasBearer) {
      const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      const validSession = await verifyAdminSessionToken(sessionCookie);
      if (!validSession) {
        return NextResponse.json(
          { ok: false, error: 'Unauthorized: Admin sign-in required.' },
          { status: 401, headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
        );
      }
    }
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    return res;
  }

  // Dedicated /admin panel routes: skip public slug redirects and always prevent search indexing
  if (rawPath === '/admin' || rawPath.startsWith('/admin/')) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    return res;
  }

  // Skip API routes, Next.js internals, and static files with extensions (except /index.html)
  if (
    rawPath.startsWith('/api/') ||
    rawPath.startsWith('/_next/') ||
    (rawPath !== '/index.html' && /\.[a-z0-9]+$/i.test(rawPath))
  ) {
    return NextResponse.next();
  }

  // Canonical /index.html redirect
  if (rawPath === '/index.html') {
    const target = nextUrl.clone();
    target.pathname = '/';
    return NextResponse.redirect(target, 301);
  }

  let canonicalHost = 'rajasthanvacancy.online';
  try {
    canonicalHost = new URL(CANONICAL_ORIGIN).hostname.toLowerCase();
  } catch {
    canonicalHost = 'rajasthanvacancy.online';
  }
  const alternateHost = canonicalHost.startsWith('www.')
    ? canonicalHost.slice(4)
    : `www.${canonicalHost}`;

  if (!isLocalHost && hostname === alternateHost && hostname !== canonicalHost) {
    try {
      const target = new URL(`${nextUrl.pathname}${nextUrl.search}`, CANONICAL_ORIGIN);
      return NextResponse.redirect(target, 301);
    } catch {
      // Continue safely if URL construction fails
    }
  }

  // Canonical slug & query normalization for GET/HEAD
  if (request.method === 'GET' || request.method === 'HEAD') {
    const cleanPath = rawPath.replace(/^\/+|\/+$/g, '');
    const lowerPath = cleanPath.toLowerCase();

    if (!nextUrl.searchParams.get('search')) {
      if (cleanPath && KNOWN_POLICY_ALIASES[lowerPath]) {
        const target = nextUrl.clone();
        target.pathname = '/';
        target.search = `?policy=${encodeURIComponent(KNOWN_POLICY_ALIASES[lowerPath])}`;
        return NextResponse.redirect(target, 301);
      }

      if (cleanPath && KNOWN_CATEGORIES.has(lowerPath)) {
        const normCat = normalizeCategoryKey(lowerPath);
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
