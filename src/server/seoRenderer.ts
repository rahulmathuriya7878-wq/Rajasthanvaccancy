import type { Request } from 'express';
import { INITIAL_VACANCIES } from '../data/mockVacancies';
import { VacancyItem, CategoryType } from '../types';
import { getJobFeaturedImage } from '../utils/thumbnailGenerator';

const CATEGORY_NAMES_HI: Record<string, string> = {
  latest_job: 'सरकारी नौकरियां (Latest Govt Jobs)',
  admit_card: 'प्रवेश पत्र (Admit Card)',
  result: 'परीक्षा परिणाम (Sarkari Result)',
  answer_key: 'उत्तर कुंजी (Answer Key)',
  scheme: 'सरकारी योजनाएं (Sarkari Yojana)',
  news: 'लेटेस्ट न्यूज़ व रोजगार समाचार (Latest News)',
  exam_date: 'परीक्षा तिथियां (Exam Dates)',
  syllabus: 'पाठ्यक्रम एवं परीक्षा पैटर्न (Syllabus)',
  upcoming: 'आगामी भर्तियां (Upcoming Vacancies)',
};

export function getBaseOriginFromRequest(req: Request): string {
  const host = (req.get('host') || '').toLowerCase();
  
  if (host.includes('rajasthanvacancy.online')) {
    return 'https://rajasthanvacancy.online';
  }
  if (host.includes('pages.dev')) {
    return `https://${req.get('host')}`;
  }
  if (host.includes('rajasthanvacancies.com')) {
    return 'https://rajasthanvacancies.com';
  }
  if (host.includes('rajasthanvacancy.com')) {
    return 'https://rajasthanvacancy.com';
  }
  if (host.includes('vercel.app')) {
    return `https://${req.get('host')}`;
  }
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('run.app')) {
    return `https://${req.get('host')}`;
  }
  return 'https://rajasthanvacancy.online';
}

function escapeHtml(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderSeoEnhancedHtml(htmlTemplate: string, req: Request): string {
  const baseUrl = getBaseOriginFromRequest(req);
  const urlPath = (req.path || '/').replace(/^\/+|\/+$/g, '');
  const queryVacancy = typeof req.query.vacancy === 'string' ? req.query.vacancy : null;
  const queryCategory = typeof req.query.category === 'string' ? req.query.category : null;

  // 1. Identify target vacancy if requested via query or clean slug path
  let targetVacancyId = queryVacancy;
  if (!targetVacancyId && urlPath && !urlPath.includes('.') && !urlPath.startsWith('api') && urlPath !== 'sitemap' && urlPath !== 'sitemap.xml' && urlPath !== 'sitemap_index.xml' && urlPath !== 'robots.txt') {
    targetVacancyId = urlPath;
  }

  let matchedVacancy: VacancyItem | undefined;
  if (targetVacancyId) {
    matchedVacancy = INITIAL_VACANCIES.find(
      v => v.id.toLowerCase() === targetVacancyId?.toLowerCase()
    );
  }

  // 2. Identify target category
  let matchedCategory = queryCategory;
  if (!matchedCategory && urlPath && CATEGORY_NAMES_HI[urlPath]) {
    matchedCategory = urlPath;
  }

  let title = 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal';
  let description = 'Rajasthan Vacancy 2026: Latest Rajasthan & Central Govt job alerts, RSMSSB, RPSC, Rajasthan Police, Patwari, REET, Pashu Parichar, Admit Cards, Answer Keys, and Sarkari Results.';
  let canonicalUrl = `${baseUrl}/`;
  let ogType = 'website';
  let structuredDataSnippet = '';
  let ssrBodyContent = '';

  if (matchedVacancy) {
    const postTitle = matchedVacancy.titleHi || matchedVacancy.title;
    title = `${postTitle} - Rajasthan Vacancy 2026`;
    description = matchedVacancy.briefSummaryHi || 
      `${postTitle}: कुल पद ${matchedVacancy.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    canonicalUrl = `${baseUrl}/?vacancy=${encodeURIComponent(matchedVacancy.id)}`;
    ogType = 'article';

    const jobPostingLd = {
      '@context': 'https://schema.org/',
      '@type': matchedVacancy.category === 'scheme' ? 'Article' : 'JobPosting',
      '@id': `${canonicalUrl}#job`,
      title: postTitle,
      description: matchedVacancy.briefSummaryHi || description,
      datePosted: matchedVacancy.createdAt || '2026-10-25',
      validThrough: matchedVacancy.importantDates?.applyLastDate || '2026-11-25',
      employmentType: 'FULL_TIME',
      directApply: true,
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'India'
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          value: 28500,
          unitText: 'MONTH'
        }
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: matchedVacancy.departmentHi || matchedVacancy.department || matchedVacancy.organization || 'Rajasthan Govt Department',
        sameAs: matchedVacancy.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in',
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'Rajasthan',
          addressCountry: 'IN',
        },
      },
    };

    const faqSchemaLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: `${postTitle} के लिए आवेदन कैसे करें?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `अभ्यर्थी आधिकारिक पोर्टल ${matchedVacancy.officialLinks?.officialWebsiteUrl || 'samvida-sathi.kvs.gov.in'} अथवा ऊपर दिए गए डायरेक्ट लिंक के माध्यम से ऑनलाइन फॉर्म भर सकते हैं।`
          }
        },
        {
          '@type': 'Question',
          name: `${postTitle} में कुल पद और अंतिम तिथि क्या है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `इस भर्ती में कुल पद ${matchedVacancy.totalPosts || 'विभिन्न पद'} हैं तथा आवेदन की अंतिम तिथि ${matchedVacancy.importantDates?.applyLastDate || 'विज्ञप्ति अनुसार'} है।`
          }
        },
        {
          '@type': 'Question',
          name: `${postTitle} के लिए योग्यता एवं आयु सीमा क्या है?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `शैक्षणिक योग्यता: ${matchedVacancy.qualificationDetailsHi || 'विज्ञप्ति अनुसार'}। आयु सीमा: ${matchedVacancy.ageLimit?.min || 18} से ${matchedVacancy.ageLimit?.max || 40} वर्ष निर्धारित है।`
          }
        }
      ]
    };

    structuredDataSnippet = `<script type="application/ld+json">\n${JSON.stringify(jobPostingLd, null, 2)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(faqSchemaLd, null, 2)}\n</script>`;

    // Rich Pre-rendered SEO HTML for Search Crawlers before JS hydration
    ssrBodyContent = `
      <main class="ssr-seo-post" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', -apple-system, sans-serif; color: #1e293b;">
        <nav style="font-size: 13px; margin-bottom: 16px; color: #64748b;">
          <a href="${baseUrl}/" style="color: #2563eb; text-decoration: none;">होम (Home)</a> &gt; 
          <a href="${baseUrl}/?category=${matchedVacancy.category}" style="color: #2563eb; text-decoration: none;">${CATEGORY_NAMES_HI[matchedVacancy.category] || matchedVacancy.category}</a> &gt; 
          <span>${escapeHtml(matchedVacancy.shortTitleHi || matchedVacancy.shortTitle || matchedVacancy.id)}</span>
        </nav>

        <h1 style="font-size: 26px; line-height: 1.4; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
          ${escapeHtml(postTitle)}
        </h1>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 4px; font-weight: bold; width: 35%;">विभाग / संस्था</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.departmentHi || matchedVacancy.department || matchedVacancy.organization)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 4px; font-weight: bold;">कुल पद (Total Posts)</td>
                <td style="padding: 8px 4px; color: #15803d; font-weight: bold;">${escapeHtml(matchedVacancy.totalPosts || 'विभिन्न पद')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 4px; font-weight: bold;">पद का नाम (Post Name)</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.postNameHi || matchedVacancy.postName || 'विभिन्न')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 4px; font-weight: bold;">वेतनमान (Salary)</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.salaryHi || matchedVacancy.salary || 'नियमानुसार')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 4px; font-weight: bold;">नौकरी का स्थान</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.jobLocation || 'राजस्थान')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            भर्ती का संक्षिप्त विवरण (Overview)
          </h2>
          <p style="font-size: 15px; line-height: 1.8; color: #334155;">
            ${escapeHtml(matchedVacancy.briefSummaryHi || matchedVacancy.descriptionHi || '')}
          </p>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            शैक्षणिक योग्यता एवं पात्रता (Eligibility Criteria)
          </h2>
          <p style="font-size: 15px; line-height: 1.8; color: #334155;">
            ${escapeHtml(matchedVacancy.qualificationDetailsHi || matchedVacancy.qualificationDetails || matchedVacancy.qualification?.join(', ') || 'विज्ञप्ति अनुसार')}
          </p>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            महत्वपूर्ण तिथियां (Important Dates)
          </h2>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>ऑनलाइन आवेदन प्रारंभ:</strong> ${escapeHtml(matchedVacancy.importantDates?.applyStartDate || 'अक्टूबर 2026')}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>आवेदन की अंतिम तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.applyLastDate || 'नवंबर 2026')}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>परीक्षा तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.examDate || 'जल्द घोषित होगी')}</p>
          </div>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            महत्वपूर्ण लिंक्स (Important Direct Links)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="${matchedVacancy.officialLinks?.applyOnlineUrl || '#'}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #d97706; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              ऑनलाइन आवेदन करें (Apply Online)
            </a>
            <a href="${matchedVacancy.officialLinks?.notificationPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              आधिकारिक नोटिफिकेशन डाउनलोड करें (PDF)
            </a>
            <a href="${matchedVacancy.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #475569; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              आधिकारिक वेबसाइट (Official Website)
            </a>
          </div>
        </section>

        <section style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 18px;">
            Recent Posts
          </h2>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${INITIAL_VACANCIES.filter(v => v.id !== matchedVacancy!.id).slice(0, 8).map(other => `
              <div>
                <a href="${baseUrl}/?vacancy=${other.id}" style="color: #0066cc; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; font-size: 17px; line-height: 1.4; display: block;">
                  ${escapeHtml(other.titleHi || other.title)}
                </a>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (matchedCategory && matchedCategory !== 'ALL') {
    const catHi = CATEGORY_NAMES_HI[matchedCategory] || matchedCategory;
    title = `${catHi} 2026 - Rajasthan Vacancy Portal`;
    description = `राजस्थान एवं केंद्र सरकार की ${catHi} 2026 की नवीनतम अपडेट, नोटिफिकेशन, परीक्षा तिथि, प्रवेश पत्र एवं रिजल्ट।`;
    canonicalUrl = `${baseUrl}/?category=${encodeURIComponent(matchedCategory)}`;

    const categoryJobs = INITIAL_VACANCIES.filter(v => v.category === matchedCategory);

    ssrBodyContent = `
      <main class="ssr-seo-category" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', sans-serif;">
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
          ${escapeHtml(catHi)} (2026)
        </h1>
        <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
          ${escapeHtml(description)}
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${categoryJobs.map(job => `
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; background: #ffffff;">
              <h2 style="font-size: 17px; margin: 0 0 8px 0;">
                <a href="${baseUrl}/?vacancy=${job.id}" style="color: #0f172a; text-decoration: none; font-weight: 700;">
                  ${escapeHtml(job.titleHi || job.title)}
                </a>
              </h2>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                <strong>पद:</strong> ${escapeHtml(job.totalPosts || 'विभिन्न')} | <strong>योग्यता:</strong> ${escapeHtml(job.qualification?.join(', ') || '12वीं/स्नातक')}
              </p>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  } else {
    // Homepage
    canonicalUrl = `${baseUrl}/`;
    const topJobs = INITIAL_VACANCIES.slice(0, 100);
    ssrBodyContent = `
      <main class="ssr-seo-home" style="max-width: 1000px; margin: 0 auto; padding: 20px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', sans-serif;">
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-align: center;">
          Rajasthan Vacancy 2026 - राजस्थान सरकारी भर्ती एवं रोजगार समाचार पोर्टल
        </h1>
        <p style="font-size: 15px; color: #475569; text-align: center; margin-bottom: 24px;">
          RSMSSB, RPSC, राजस्थान पुलिस, पटवारी, रीट, पशु परिचर, प्रवेश पत्र, आंसर की एवं सरकारी रिजल्ट की सबसे तेज और सटीक अपडेट।
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${topJobs.map(job => `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #ffffff;">
              <h2 style="font-size: 16px; margin: 0 0 6px 0;">
                <a href="${baseUrl}/?vacancy=${job.id}" style="color: #1e3a8a; text-decoration: none; font-weight: 700;">
                  ${escapeHtml(job.titleHi || job.title)}
                </a>
              </h2>
              <span style="font-size: 12px; color: #16a34a; font-weight: bold;">कुल पद: ${escapeHtml(job.totalPosts || 'विभिन्न')}</span>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  }

  // Replace Title
  let modifiedHtml = htmlTemplate.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Replace Canonical Tag with strict self-referential canonical URL
  modifiedHtml = modifiedHtml.replace(
    /<link\s+rel="canonical".*?\/?>/i,
    `<link rel="canonical" id="primary-canonical" href="${canonicalUrl}" />`
  );

  // Replace OpenGraph & Twitter Tags
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  const featuredThumbUrl = matchedVacancy 
    ? getJobFeaturedImage(matchedVacancy)
    : `${baseUrl}/og-preview.png`;

  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${featuredThumbUrl}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${featuredThumbUrl}" />`
  );

  // Inject Viral Keywords & Tags meta tags for organic SEO reach
  const viralTagsList = (matchedVacancy?.tags && matchedVacancy.tags.length > 0)
    ? matchedVacancy.tags.map(t => t.replace(/^#/, ''))
    : [
        matchedVacancy ? (matchedVacancy.titleHi || matchedVacancy.title) : 'Rajasthan Vacancy',
        matchedVacancy?.organization || 'Rajasthan Govt',
        'Rajasthan Vacancy 2026',
        'Sarkari Result',
        'Govt Job Alert',
        'RPSC',
        'RSMSSB'
      ];
  const keywordsContent = viralTagsList.join(', ');

  if (modifiedHtml.includes('<meta name="keywords"')) {
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(keywordsContent)}" />`
    );
  } else {
    modifiedHtml = modifiedHtml.replace('</head>', `<meta name="keywords" content="${escapeHtml(keywordsContent)}" />\n</head>`);
  }

  const additionalTags = `
    <meta name="news_keywords" content="${escapeHtml(keywordsContent)}" />
    <meta name="viral-tags" content="${escapeHtml(keywordsContent)}" />
  `;
  modifiedHtml = modifiedHtml.replace('</head>', `${additionalTags}\n</head>`);

  // Inject structured data before </head>
  if (structuredDataSnippet) {
    modifiedHtml = modifiedHtml.replace('</head>', `${structuredDataSnippet}\n</head>`);
  }

  // Pre-render content inside <div id="root"></div> for search crawlers (Googlebot, Bingbot)
  if (ssrBodyContent) {
    modifiedHtml = modifiedHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${ssrBodyContent}</div>`
    );
  }

  return modifiedHtml;
}
