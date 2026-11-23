import { NextResponse } from 'next/server';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays, toIso8601DateString } from '@/utils/dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN, normalizeBreadcrumbCategoryKey } from '@/utils/seoCanonical';
import type { VacancyItem } from '@/types';

const INDEXABLE_CATEGORIES = [
  'latest_job',
  'admit_card',
  'result',
  'answer_key',
  'scheme',
  'exam_date',
  'syllabus',
  'news',
] as const;

function hasCategoryItems(vacancies: VacancyItem[], cat: string): boolean {
  const normCat = normalizeBreadcrumbCategoryKey(cat);
  return vacancies.some((v) => {
    if (normCat === 'latest_job') return v.category === 'latest_job' || v.category === 'ugc_net';
    if (normCat === 'admit_card') return v.category === 'admit_card' || v.status === 'admit_card_out';
    if (normCat === 'result') return v.category === 'result' || v.status === 'result_declared';
    if (normCat === 'answer_key') return v.category === 'answer_key' || v.status === 'answer_key_out';
    if (normCat === 'scheme') return v.category === 'scheme' || v.organization === 'Sarkari Yojana';
    return v.category === normCat;
  });
}

export async function GET() {
  const baseUrl = DEFAULT_PRODUCTION_ORIGIN;
  const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);
  const todayIso = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  const populatedCategories = INDEXABLE_CATEGORIES.filter((cat) => hasCategoryItems(activeVacancies, cat));
  populatedCategories.forEach((cat) => {
    xml += `  <url>\n    <loc>${baseUrl}/?category=${cat}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
  });

  xml += `  <url>\n    <loc>${baseUrl}/photo-signature-resize-tool</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

  const policyPages = ['about', 'contact', 'privacy', 'terms', 'disclaimer'];
  policyPages.forEach((p) => {
    xml += `  <url>\n    <loc>${baseUrl}/?policy=${p}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  });

  activeVacancies.forEach((v) => {
    const rawDate = v.updatedAt || v.createdAt || '';
    const validLastmod = toIso8601DateString(rawDate, todayIso).split('T')[0];
    const priority = v.isTrending || v.isHot ? '1.0' : '0.9';
    xml += `  <url>\n    <loc>${baseUrl}/?vacancy=${v.id}</loc>\n    <lastmod>${validLastmod}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
