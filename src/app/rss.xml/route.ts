import { NextResponse } from 'next/server';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays, toIso8601DateString } from '@/utils/dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

export async function GET() {
  const baseUrl = DEFAULT_PRODUCTION_ORIGIN;
  const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  rss += `  <title>Rajasthan Vacancy 2026 - Sarkari Job Alerts</title>\n`;
  rss += `  <link>${baseUrl}/</link>\n`;
  rss += `  <description>Latest Rajasthan Government Job Notifications, Admit Cards, Results, and Sarkari Yojana</description>\n`;
  rss += `  <language>hi-IN</language>\n`;
  rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  activeVacancies.slice(0, 100).forEach((v) => {
    const safeIso = toIso8601DateString(v.createdAt || v.updatedAt, '2026-11-13');
    rss += `  <item>\n`;
    rss += `    <title><![CDATA[${v.titleHi || v.title}]]></title>\n`;
    rss += `    <link>${baseUrl}/?vacancy=${v.id}</link>\n`;
    rss += `    <guid isPermaLink="true">${baseUrl}/?vacancy=${v.id}</guid>\n`;
    rss += `    <description><![CDATA[${v.briefSummaryHi || v.descriptionHi || v.title}]]></description>\n`;
    rss += `    <pubDate>${new Date(safeIso).toUTCString()}</pubDate>\n`;
    rss += `  </item>\n`;
  });

  rss += `</channel>\n</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
