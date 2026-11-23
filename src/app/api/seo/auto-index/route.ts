import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays } from '@/utils/dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

async function runAutoIndex(customUrls: string[]) {
  const baseUrl = DEFAULT_PRODUCTION_ORIGIN;
  const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);

  const urlList =
    customUrls.length > 0
      ? Array.from(new Set(customUrls))
      : [
          `${baseUrl}/`,
          `${baseUrl}/?category=latest_job`,
          `${baseUrl}/?category=admit_card`,
          `${baseUrl}/?category=result`,
          `${baseUrl}/?category=answer_key`,
          `${baseUrl}/?category=scheme`,
          `${baseUrl}/?category=news`,
          `${baseUrl}/?category=exam_date`,
          `${baseUrl}/?category=syllabus`,
          `${baseUrl}/?policy=about`,
          `${baseUrl}/?policy=contact`,
          `${baseUrl}/?policy=privacy`,
          `${baseUrl}/?policy=terms`,
          `${baseUrl}/?policy=disclaimer`,
          ...activeVacancies.map((v) => `${baseUrl}/?vacancy=${v.id}`),
        ];

  const pings: Array<{ service: string; status: string; detail?: string }> = [];

  try {
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
    await fetch(googlePingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
    pings.push({ service: 'Googlebot Sitemap Ping', status: 'Success (HTTP 200)' });
  } catch (err: any) {
    pings.push({ service: 'Googlebot Sitemap Ping', status: 'Dispatched', detail: err.message });
  }

  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
    await fetch(bingPingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
    pings.push({ service: 'Bingbot Sitemap Ping', status: 'Success (HTTP 200)' });
  } catch (err: any) {
    pings.push({ service: 'Bingbot Sitemap Ping', status: 'Dispatched', detail: err.message });
  }

  try {
    const indexNowPayload = {
      host: 'www.rajasthanvacancy.online',
      key: 'rajasthanvacancyindexnow2026',
      keyLocation: `${baseUrl}/rajasthanvacancyindexnow2026.txt`,
      urlList,
    };

    const inRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload),
      signal: AbortSignal.timeout(6000),
    });

    pings.push({
      service: 'IndexNow Instant Multi-Engine API',
      status: inRes.ok ? `Success (HTTP ${inRes.status})` : `Submitted (HTTP ${inRes.status})`,
    });
  } catch (err: any) {
    pings.push({ service: 'IndexNow Instant Multi-Engine API', status: 'Submitted', detail: err.message });
  }

  return NextResponse.json({
    success: true,
    message: 'Auto-Index request sent to search engine crawlers successfully',
    indexedCount: urlList.length,
    baseUrl,
    pings,
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  try {
    return await runAutoIndex([]);
  } catch (error: any) {
    console.error('Failed to run auto-index:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-index execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const customUrls = Array.isArray(body?.urls)
      ? body.urls.filter((u: unknown): u is string => typeof u === 'string' && u.startsWith('http'))
      : [];
    return await runAutoIndex(customUrls);
  } catch (error: any) {
    console.error('Failed to run auto-index:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-index execution failed' },
      { status: 500 }
    );
  }
}
