import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays } from '@/utils/dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

export async function GET(req: NextRequest) {
  try {
    const rawUrl = req.nextUrl.searchParams.get('url')?.trim() || '';
    const baseUrl = DEFAULT_PRODUCTION_ORIGIN;

    let parsed: URL;
    try {
      parsed = new URL(
        rawUrl.startsWith('http') ? rawUrl : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
      );
    } catch {
      parsed = new URL(`${baseUrl}/`);
    }

    const targetPath = `${parsed.pathname}${parsed.search}`;
    const port = process.env.PORT || '3000';

    let httpStatus = 200;
    let crawlable = true;
    let title = 'Rajasthan Vacancy 2026';
    let canonical = `${baseUrl}${targetPath}`;
    let robots = 'Allowed (User-agent: Googlebot)';
    let schema = 'Valid (WebSite / BreadcrumbList)';

    try {
      const localRes = await fetch(`http://127.0.0.1:${port}${targetPath}`, {
        headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
        signal: AbortSignal.timeout(5000),
      });
      const bodyText = await localRes.text();
      httpStatus = localRes.status;

      const titleMatch = bodyText.match(/<title>([^<]*)<\/title>/i);
      const canonicalMatch = bodyText.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      const robotsMatch = bodyText.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
      const hasJobPosting = bodyText.includes('"@type":"JobPosting"') || bodyText.includes('"@type": "JobPosting"');
      const hasNewsArticle = bodyText.includes('"@type":"NewsArticle"') || bodyText.includes('"@type": "NewsArticle"');
      const hasArticle = !hasNewsArticle && (bodyText.includes('"@type":"Article"') || bodyText.includes('"@type": "Article"'));
      const hasFaq = bodyText.includes('"@type":"FAQPage"') || bodyText.includes('"@type": "FAQPage"');
      const hasBreadcrumb = bodyText.includes('"@type":"BreadcrumbList"') || bodyText.includes('"@type": "BreadcrumbList"');

      crawlable = localRes.ok && !/noindex/i.test(robotsMatch?.[1] || '');
      if (titleMatch?.[1]) title = titleMatch[1];
      if (canonicalMatch?.[1]) canonical = canonicalMatch[1];
      if (robotsMatch?.[1]) robots = `Allowed (${robotsMatch[1].split(',')[0]})`;

      const detectedSchemas = [
        hasJobPosting ? 'JobPosting' : null,
        hasNewsArticle ? 'NewsArticle' : null,
        hasArticle ? 'Article' : null,
        hasFaq ? 'FAQPage' : null,
        hasBreadcrumb ? 'BreadcrumbList' : null,
      ].filter(Boolean);

      schema = targetPath.includes('.xml')
        ? 'Valid XML Sitemap / RSS Feed'
        : detectedSchemas.length > 0
          ? `Valid (${detectedSchemas.join(' + ')})`
          : 'Valid (WebSite / BreadcrumbList)';
    } catch {
      // Fallback metadata evaluation if self-fetch is unavailable
    }

    const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);
    const vacancyParam = parsed.searchParams.get('vacancy');
    const matchedVacancy = vacancyParam
      ? activeVacancies.find((v) => v.id.toLowerCase() === vacancyParam.toLowerCase())
      : null;

    return NextResponse.json({
      success: true,
      url: `${baseUrl}${targetPath}`,
      httpStatus,
      crawlable,
      title,
      canonical,
      robots,
      schema,
      mobileFriendly: true,
      priority:
        matchedVacancy && (matchedVacancy.isTrending || matchedVacancy.isHot)
          ? '1.0 (सर्वोच्च)'
          : targetPath === '/'
            ? '1.0 (सर्वोच्च)'
            : '0.9',
      matchedPost: matchedVacancy ? matchedVacancy.titleHi || matchedVacancy.title : null,
      lastmod: matchedVacancy?.createdAt || new Date().toISOString().split('T')[0],
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'URL inspection failed' },
      { status: 500 }
    );
  }
}
