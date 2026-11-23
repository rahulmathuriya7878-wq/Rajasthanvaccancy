import { NextResponse } from 'next/server';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

export async function GET() {
  const baseUrl = DEFAULT_PRODUCTION_ORIGIN;
  const todayIso = new Date().toISOString().split('T')[0];
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${baseUrl}/sitemap.xml</loc>\n    <lastmod>${todayIso}</lastmod>\n  </sitemap>\n</sitemapindex>`;

  return new NextResponse(indexXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
