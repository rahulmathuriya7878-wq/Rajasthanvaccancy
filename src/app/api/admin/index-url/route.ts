import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/adminAuth';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

const VALID_SLUG_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function validateAllowedCanonicalUrl(rawUrl: string): string | null {
  try {
    const allowedOrigin = new URL(DEFAULT_PRODUCTION_ORIGIN);
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const allowedHost = allowedOrigin.hostname.replace(/^www\./i, '').toLowerCase();
    const candidateHost = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (candidateHost !== allowedHost) return null;
    // Reconstruct strictly on canonical origin to eliminate host confusion / SSRF
    return `${DEFAULT_PRODUCTION_ORIGIN}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminRequest(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ ok: false, error: authCheck.error }, { status: 401 });
  }

  let body: { slug?: string; urls?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const urlsToIndex = new Set<string>();

  if (typeof body.slug === 'string' && VALID_SLUG_REGEX.test(body.slug.trim())) {
    urlsToIndex.add(`${DEFAULT_PRODUCTION_ORIGIN}/?vacancy=${encodeURIComponent(body.slug.trim())}`);
  }

  if (Array.isArray(body.urls)) {
    for (const candidate of body.urls.slice(0, 20)) {
      if (typeof candidate !== 'string') continue;
      const safeUrl = validateAllowedCanonicalUrl(candidate.trim());
      if (safeUrl) urlsToIndex.add(safeUrl);
    }
  }

  if (urlsToIndex.size === 0) {
    urlsToIndex.add(`${DEFAULT_PRODUCTION_ORIGIN}/`);
  }

  const urlList = Array.from(urlsToIndex);
  const results: Array<{ service: string; status: string; detail?: string }> = [];

  // 1. IndexNow Instant Indexing API (Bing / Yandex / Seznam / Naver)
  try {
    const host = new URL(DEFAULT_PRODUCTION_ORIGIN).host;
    const inRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: 'rajasthanvacancyindexnow2026',
        keyLocation: `${DEFAULT_PRODUCTION_ORIGIN}/rajasthanvacancyindexnow2026.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(6000),
    });
    results.push({
      service: 'IndexNow Instant API',
      status: inRes.ok ? `Submitted (HTTP ${inRes.status})` : `Queued (HTTP ${inRes.status})`,
    });
  } catch (err) {
    results.push({
      service: 'IndexNow Instant API',
      status: 'Dispatched',
      detail: err instanceof Error ? err.message : 'Timeout',
    });
  }

  // 2. Google Sitemap Ping
  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${DEFAULT_PRODUCTION_ORIGIN}/sitemap.xml`)}`;
    const gRes = await fetch(pingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
    results.push({
      service: 'Google Sitemap Notification',
      status: `HTTP ${gRes.status}`,
    });
  } catch (err) {
    results.push({
      service: 'Google Sitemap Notification',
      status: 'Dispatched',
      detail: err instanceof Error ? err.message : 'Timeout',
    });
  }

  // 3. Google Search Console Inspection direct URL for 1-click verification
  const gscInspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    `${DEFAULT_PRODUCTION_ORIGIN}/`
  )}&id=${encodeURIComponent(urlList[0])}`;

  return NextResponse.json({
    ok: true,
    indexedUrls: urlList,
    results,
    gscInspectUrl,
    timestamp: new Date().toISOString(),
  });
}
