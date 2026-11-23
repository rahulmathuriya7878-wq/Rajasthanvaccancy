import { NextResponse } from 'next/server';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';

export async function GET() {
  const body = `User-agent: *
Allow: /
Crawl-delay: 0

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Mobile
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: Google-adstxt
Allow: /ads.txt

User-agent: Bingbot
Allow: /

Sitemap: ${DEFAULT_PRODUCTION_ORIGIN}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
