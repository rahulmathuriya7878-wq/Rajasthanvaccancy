import type { Request } from 'express';
import { INITIAL_VACANCIES } from '../data/mockVacancies';
import { VacancyItem } from '../types';
import { getJobFeaturedImage } from '../utils/thumbnailGenerator';
import { parseVacancyTimestamp, compareVacanciesNewestFirst } from '../utils/dateUtils';

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

const POLICY_SEO_META: Record<
  string,
  { title: string; description: string; heading: string; bodyHtml: string; noindex?: boolean }
> = {
  about: {
    title: 'About Us (हमारे बारे में) - Rajasthan Vacancy 2026',
    description:
      'Rajasthan Vacancy (www.rajasthanvacancy.online) के बारे में जानें: राजस्थान एवं केंद्र सरकार की सभी भर्तियों, एडमिट कार्ड, रिजल्ट व सरकारी योजनाओं की सटीक जानकारी।',
    heading: 'हमारे बारे में (About Rajasthan Vacancy)',
    bodyHtml:
      '<p>Rajasthan Vacancy (www.rajasthanvacancy.online) राजस्थान एवं भारत सरकार की नवीनतम सरकारी भर्तियों (RSMSSB, RPSC, Rajasthan Police, SSC, Railway, UPSC), प्रवेश पत्र, परीक्षा तिथियां, उत्तर कुंजी, रिजल्ट एवं जनकल्याणकारी योजनाओं की त्वरित और प्रमाणित जानकारी प्रदान करने वाला समर्पित पोर्टल है।</p><p>हमारा उद्देश्य प्रत्येक अभ्यर्थी तक सरल हिंदी एवं अंग्रेजी भाषा में आधिकारिक नोटिफिकेशन पर आधारित सही जानकारी समय पर पहुँचाना है।</p>',
  },
  contact: {
    title: 'Contact Us (संपर्क करें) - Rajasthan Vacancy 2026',
    description:
      'Rajasthan Vacancy टीम से संपर्क करें: किसी भर्ती अपडेट, त्रुटि सुधार या सुझाव के लिए आधिकारिक ईमेल व सहायता माध्यम।',
    heading: 'संपर्क करें (Contact Us)',
    bodyHtml:
      '<p>किसी भी सरकारी भर्ती अधिसूचना, एडमिट कार्ड, परीक्षा तिथि अथवा वेबसाइट से जुड़े सुझाव व सुधार के लिए आप हमारी संपादकीय टीम से संपर्क कर सकते हैं।</p><p><strong>आधिकारिक पोर्टल:</strong> https://www.rajasthanvacancy.online/<br/><strong>सहायता समय:</strong> सोमवार से शनिवार, सुबह 10:00 बजे से शाम 6:00 बजे तक।</p>',
  },
  privacy: {
    title: 'Privacy Policy (गोपनीयता नीति) - Rajasthan Vacancy 2026',
    description:
      'Rajasthan Vacancy गोपनीयता नीति: उपयोगकर्ता की गोपनीयता, ब्राउज़र स्टोरेज, कुकीज़ तथा Google AdSense विज्ञापन मानकों की पूरी जानकारी।',
    heading: 'गोपनीयता नीति (Privacy Policy)',
    bodyHtml:
      '<p>Rajasthan Vacancy (www.rajasthanvacancy.online) अपने आगंतुकों की गोपनीयता का पूर्ण सम्मान करता है। पोर्टल पर आपकी पसंदीदा भर्तियां व भाषा वरीयता आपके ब्राउज़र में सुरक्षित रहती हैं।</p><p>तृतीय-पक्ष विज्ञापन नेटवर्क (जैसे Google AdSense) प्रासंगिक विज्ञापन प्रदर्शित करने के लिए मानक कुकीज़ का उपयोग कर सकते हैं। पोर्टल किसी भी सरकारी आवेदन हेतु शुल्क या निजी दस्तावेज एकत्र नहीं करता है।</p>',
  },
  terms: {
    title: 'Terms & Conditions (नियम एवं शर्तें) - Rajasthan Vacancy 2026',
    description:
      'Rajasthan Vacancy पोर्टल के उपयोग की नियम एवं शर्तें। आधिकारिक वेबसाइट सत्यापन व सामग्री उपयोग दिशा-निर्देश।',
    heading: 'नियम एवं शर्तें (Terms & Conditions)',
    bodyHtml:
      '<p>Rajasthan Vacancy पर प्रकाशित सभी भर्ती, एडमिट कार्ड, रिजल्ट व योजना संबंधी सूचनाएं संबंधित विभागों द्वारा जारी आधिकारिक विज्ञप्तियों पर आधारित होती हैं।</p><p>अभ्यर्थियों को सलाह दी जाती है कि ऑनलाइन आवेदन या शुल्क भुगतान करने से पूर्व संबंधित भर्ती बोर्ड (जैसे rpsc.rajasthan.gov.in, rsmssb.rajasthan.gov.in) की आधिकारिक वेबसाइट से अंतिम तिथि व पात्रता अवश्य सत्यापित करें।</p>',
  },
  disclaimer: {
    title: 'Disclaimer (अस्वीकरण) - Rajasthan Vacancy 2026',
    description:
      'Rajasthan Vacancy अस्वीकरण: यह एक स्वतंत्र सूचनात्मक रोजगार समाचार पोर्टल है, किसी सरकारी संस्था से संबद्ध नहीं है।',
    heading: 'अस्वीकरण (Disclaimer)',
    bodyHtml:
      '<p>Rajasthan Vacancy (www.rajasthanvacancy.online) एक स्वतंत्र शैक्षणिक एवं रोजगार समाचार सूचना पोर्टल है। यह किसी भी राज्य अथवा केंद्र सरकार के मंत्रालय या भर्ती बोर्ड से आधिकारिक रूप से संबद्ध नहीं है।</p><p>सभी जानकारियां आधिकारिक रोजगार समाचार व विभागीय वेबसाइटों से संकलित की जाती हैं। किसी भी त्रुटि या परिवर्तन के लिए संबंधित विभाग की आधिकारिक वेबसाइट ही अंतिम मानी जाएगी।</p>',
  },
  sitemap: {
    title: 'HTML Sitemap Directory - Rajasthan Vacancy 2026',
    description: 'Rajasthan Vacancy 2026 पोर्टल के सभी सक्रिय पेज, श्रेणियां एवं पोस्ट्स की सूची।',
    heading: 'पोर्टल साइटमैप निर्देशिका (Portal Directory)',
    bodyHtml:
      '<p>यह पृष्ठ पोर्टल की सभी श्रेणियों और सक्रिय भर्ती अधिसूचनाओं की त्वरित निर्देशिका है। सर्च इंजन क्रॉलिंग के लिए XML Sitemap (/sitemap.xml) सक्रिय है।</p>',
    noindex: true,
  },
};

export function getBaseOriginFromRequest(req: Request): string {
  const host = (req.get('host') || '').toLowerCase();

  if (host.includes('rajasthanvacancy.online')) {
    return 'https://www.rajasthanvacancy.online';
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
  return 'https://www.rajasthanvacancy.online';
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

function toIsoDateString(val?: string | null, fallback = '2026-12-31'): string {
  if (!val || typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const ts = parseVacancyTimestamp(trimmed);
  if (ts > 0 && ts < Number.MAX_SAFE_INTEGER) {
    return new Date(ts).toISOString().split('T')[0];
  }
  return fallback;
}

function renderApplicationFeeHtml(fee: any): string {
  if (!fee) return '';
  if (typeof fee === 'string') return `<p>${escapeHtml(fee)}</p>`;
  if (Array.isArray(fee)) {
    return `<ul style="margin: 8px 0; padding-left: 20px;">${fee
      .map((row: any) => `<li><strong>${escapeHtml(row.category || row.label)}:</strong> ${escapeHtml(row.amount || row.fee || row.value)}</li>`)
      .join('')}</ul>`;
  }
  if (typeof fee === 'object') {
    const rows: string[] = [];
    if (fee.general) rows.push(`<li><strong>सामान्य / अनारक्षित (General/UR):</strong> ${escapeHtml(fee.general)}</li>`);
    if (fee.obc) rows.push(`<li><strong>OBC / EWS / MBC:</strong> ${escapeHtml(fee.obc)}</li>`);
    if (fee.scSt) rows.push(`<li><strong>SC / ST / PH:</strong> ${escapeHtml(fee.scSt)}</li>`);
    if (fee.female) rows.push(`<li><strong>महिला (Female):</strong> ${escapeHtml(fee.female)}</li>`);
    if (fee.paymentMode) rows.push(`<li><strong>भुगतान माध्यम:</strong> ${escapeHtml(fee.paymentMode)}</li>`);
    if (rows.length > 0) return `<ul style="margin: 8px 0; padding-left: 20px;">${rows.join('')}</ul>`;
  }
  return '';
}

export function renderSeoEnhancedHtml(htmlTemplate: string, req: Request): string {
  const baseUrl = getBaseOriginFromRequest(req);
  const urlPath = (req.path || '/').replace(/^\/+|\/+$/g, '');
  const lowerPath = urlPath.toLowerCase();

  const queryVacancy = typeof req.query.vacancy === 'string' ? req.query.vacancy.trim() : null;
  const queryCategory = typeof req.query.category === 'string' ? req.query.category.trim() : null;
  const queryPolicy = typeof req.query.policy === 'string' ? req.query.policy.trim().toLowerCase() : null;
  const querySearch = typeof req.query.search === 'string' ? req.query.search.trim() : null;

  // 1. Identify target policy page (?policy=... or /about, /privacy, /contact, /terms, /disclaimer, /sitemap)
  let matchedPolicy: string | null = queryPolicy && POLICY_SEO_META[queryPolicy] ? queryPolicy : null;
  if (!matchedPolicy && !queryVacancy && !queryCategory && POLICY_SEO_META[lowerPath]) {
    matchedPolicy = lowerPath;
  }

  // 2. Identify target category
  let matchedCategory: string | null = queryCategory;
  if (!matchedCategory && !matchedPolicy && urlPath && CATEGORY_NAMES_HI[lowerPath]) {
    matchedCategory = lowerPath;
  }

  // 3. Identify target vacancy
  let targetVacancyId = queryVacancy;
  if (
    !targetVacancyId &&
    !matchedPolicy &&
    !matchedCategory &&
    urlPath &&
    !urlPath.includes('.') &&
    !urlPath.startsWith('api') &&
    lowerPath !== 'sitemap.xml' &&
    lowerPath !== 'sitemap_index.xml' &&
    lowerPath !== 'robots.txt' &&
    lowerPath !== 'rss.xml' &&
    lowerPath !== 'index.html'
  ) {
    targetVacancyId = urlPath;
  }

  let matchedVacancy: VacancyItem | undefined;
  if (targetVacancyId) {
    matchedVacancy = INITIAL_VACANCIES.find(
      (v) => v.id.toLowerCase() === targetVacancyId!.toLowerCase()
    );
  }

  let title = 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal';
  let description =
    'Rajasthan Vacancy 2026: Latest Rajasthan & Central Govt job alerts, RSMSSB, RPSC, Rajasthan Police, Patwari, REET, Pashu Parichar, Admit Cards, Answer Keys, and Sarkari Results.';
  let canonicalUrl = `${baseUrl}/`;
  let ogType = 'website';
  let robotsDirective = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  let structuredDataSnippet = '';
  let faqReplacementJson: string | null = null;
  let ssrBodyContent = '';

  const sortedVacancies = [...INITIAL_VACANCIES].sort(compareVacanciesNewestFirst);

  if (matchedVacancy) {
    const postTitle = matchedVacancy.titleHi || matchedVacancy.title;
    title = `${postTitle} - Rajasthan Vacancy 2026`;
    description =
      matchedVacancy.briefSummaryHi ||
      `${postTitle}: कुल पद ${matchedVacancy.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    canonicalUrl = `${baseUrl}/?vacancy=${encodeURIComponent(matchedVacancy.id)}`;
    ogType = 'article';

    const datePostedIso = toIsoDateString(matchedVacancy.createdAt, '2026-11-13');
    const validThroughIso = toIsoDateString(matchedVacancy.importantDates?.applyLastDate, '2026-12-31');
    const orgUrl = matchedVacancy.officialLinks?.officialWebsiteUrl || `${baseUrl}/`;
    const thumbUrl = getJobFeaturedImage(matchedVacancy);

    if (matchedVacancy.category === 'latest_job') {
      const jobPostingLd = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        '@id': `${canonicalUrl}#job`,
        title: postTitle,
        description: matchedVacancy.descriptionHi || matchedVacancy.briefSummaryHi || description,
        datePosted: datePostedIso,
        validThrough: validThroughIso,
        employmentType: 'FULL_TIME',
        directApply: true,
        applicantLocationRequirements: {
          '@type': 'Country',
          name: 'India',
        },
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: 28500,
            unitText: 'MONTH',
          },
        },
        hiringOrganization: {
          '@type': 'Organization',
          name:
            matchedVacancy.departmentHi ||
            matchedVacancy.department ||
            matchedVacancy.organization ||
            'Rajasthan Govt Department',
          sameAs: orgUrl,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: matchedVacancy.jobLocation || 'Rajasthan',
            addressCountry: 'IN',
          },
        },
      };
      structuredDataSnippet = `<script type="application/ld+json">\n${JSON.stringify(jobPostingLd, null, 2)}\n</script>`;
    } else {
      const articleLd = {
        '@context': 'https://schema.org',
        '@type': matchedVacancy.category === 'scheme' ? 'Article' : 'NewsArticle',
        '@id': `${canonicalUrl}#article`,
        headline: postTitle,
        description: matchedVacancy.briefSummaryHi || description,
        datePublished: datePostedIso,
        dateModified: datePostedIso,
        image: [thumbUrl],
        author: {
          '@type': 'Organization',
          name: 'Rajasthan Vacancy Editorial Team',
          url: `${baseUrl}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Rajasthan Vacancy',
          url: `${baseUrl}/`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };
      structuredDataSnippet = `<script type="application/ld+json">\n${JSON.stringify(articleLd, null, 2)}\n</script>`;
    }

    const postFaqs =
      matchedVacancy.faqs && matchedVacancy.faqs.length > 0
        ? matchedVacancy.faqs.map((f) => ({
            q: f.qHi || f.q,
            a: f.aHi || f.a,
          }))
        : [
            {
              q: `${postTitle} के लिए आधिकारिक वेबसाइट और आवेदन लिंक क्या है?`,
              a: `अभ्यर्थी आधिकारिक वेबसाइट ${orgUrl} अथवा इस पृष्ठ पर दिए गए डायरेक्ट लिंक से संपूर्ण जानकारी व ऑनलाइन फॉर्म प्राप्त कर सकते हैं।`,
            },
            {
              q: `${postTitle} की महत्वपूर्ण तिथियां एवं पद संख्या क्या है?`,
              a: `कुल पद/विवरण: ${matchedVacancy.totalPosts || 'विज्ञप्ति अनुसार'}। अंतिम तिथि: ${matchedVacancy.importantDates?.applyLastDate || 'आधिकारिक नोटिफिकेशन देखें'}।`,
            },
            {
              q: `${postTitle} के लिए शैक्षणिक योग्यता एवं आयु सीमा क्या है?`,
              a: `शैक्षणिक योग्यता: ${matchedVacancy.qualificationDetailsHi || 'विज्ञप्ति अनुसार'}। आयु सीमा: ${matchedVacancy.ageLimit?.min || 18} से ${matchedVacancy.ageLimit?.max || 40} वर्ष (नियमानुसार छूट)।`,
            },
          ];

    faqReplacementJson = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: postFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
      null,
      2
    );

    const feeHtml = renderApplicationFeeHtml(matchedVacancy.applicationFee);
    const selectionHtml =
      matchedVacancy.selectionProcessHi && matchedVacancy.selectionProcessHi.length > 0
        ? `<ol style="padding-left: 20px; line-height: 1.8;">${matchedVacancy.selectionProcessHi
            .map((step) => `<li>${escapeHtml(step)}</li>`)
            .join('')}</ol>`
        : '';
    const howToApplyHtml =
      matchedVacancy.howToApplyHi && matchedVacancy.howToApplyHi.length > 0
        ? `<ol style="padding-left: 20px; line-height: 1.8;">${matchedVacancy.howToApplyHi
            .map((step) => `<li>${escapeHtml(step)}</li>`)
            .join('')}</ol>`
        : '';
    const breakdownHtml =
      matchedVacancy.postBreakdown && matchedVacancy.postBreakdown.length > 0
        ? `<table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;"><thead><tr style="background:#f1f5f9;"><th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">पद नाम</th><th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">पद संख्या</th><th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">योग्यता</th></tr></thead><tbody>${matchedVacancy.postBreakdown
            .map(
              (pb) =>
                `<tr><td style="border:1px solid #cbd5e1; padding:8px;">${escapeHtml(pb.postNameHi || pb.postName)}</td><td style="border:1px solid #cbd5e1; padding:8px;">${escapeHtml(pb.postsCount)}</td><td style="border:1px solid #cbd5e1; padding:8px;">${escapeHtml(pb.qualificationHi || pb.qualification)}</td></tr>`
            )
            .join('')}</tbody></table>`
        : '';

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
                <td style="padding: 8px 4px; font-weight: bold;">विज्ञापन / संदर्भ संख्या</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.advtNo || 'आधिकारिक सूचना 2026')}</td>
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
                <td style="padding: 8px 4px; font-weight: bold;">स्थान</td>
                <td style="padding: 8px 4px; color: #334155;">${escapeHtml(matchedVacancy.jobLocation || 'राजस्थान')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            संक्षिप्त विवरण एवं मुख्य जानकारी (Overview)
          </h2>
          <p style="font-size: 15px; line-height: 1.8; color: #334155; margin-bottom: 12px;">
            ${escapeHtml(matchedVacancy.briefSummaryHi || '')}
          </p>
          <p style="font-size: 15px; line-height: 1.8; color: #334155; white-space: pre-line;">
            ${escapeHtml(matchedVacancy.descriptionHi || matchedVacancy.description || '')}
          </p>
        </section>

        ${breakdownHtml ? `<section style="margin-bottom: 24px;"><h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">पद विवरण (Vacancy Breakdown)</h2>${breakdownHtml}</section>` : ''}

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            शैक्षणिक योग्यता एवं आयु सीमा (Eligibility & Age Limit)
          </h2>
          <p style="font-size: 15px; line-height: 1.8; color: #334155;">
            <strong>शैक्षणिक योग्यता:</strong> ${escapeHtml(matchedVacancy.qualificationDetailsHi || matchedVacancy.qualificationDetails || matchedVacancy.qualification?.join(', ') || 'विज्ञप्ति अनुसार')}
          </p>
          <p style="font-size: 15px; line-height: 1.8; color: #334155; margin-top: 6px;">
            <strong>आयु सीमा:</strong> न्यूनतम ${matchedVacancy.ageLimit?.min || 18} वर्ष एवं अधिकतम ${matchedVacancy.ageLimit?.max || 40} वर्ष (गणना तिथि: ${escapeHtml(matchedVacancy.ageLimit?.asOnDate || 'नियमानुसार')})। ${escapeHtml(matchedVacancy.ageLimit?.relaxationNotesHi || '')}
          </p>
        </section>

        ${feeHtml ? `<section style="margin-bottom: 24px;"><h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">आवेदन शुल्क (Application Fee)</h2>${feeHtml}</section>` : ''}

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            महत्वपूर्ण तिथियां (Important Dates)
          </h2>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>नोटिफिकेशन जारी तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.notificationDate || datePostedIso)}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>प्रारंभ तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.applyStartDate || 'नवंबर 2026')}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>अंतिम तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.applyLastDate || 'आधिकारिक नोटिफिकेशन देखें')}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>परीक्षा / कार्यक्रम तिथि:</strong> ${escapeHtml(matchedVacancy.importantDates?.examDate || 'यथासमय घोषित')}</p>
          </div>
        </section>

        ${selectionHtml ? `<section style="margin-bottom: 24px;"><h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">चयन प्रक्रिया (Selection Process)</h2>${selectionHtml}</section>` : ''}

        ${howToApplyHtml ? `<section style="margin-bottom: 24px;"><h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">आवेदन / डाउनलोड करने की प्रक्रिया (How to Apply)</h2>${howToApplyHtml}</section>` : ''}

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            महत्वपूर्ण लिंक्स (Important Direct Links)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="${escapeHtml(matchedVacancy.officialLinks?.applyOnlineUrl || orgUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #d97706; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              ऑनलाइन आवेदन / लिंक खोलें (Apply / View Link)
            </a>
            <a href="${escapeHtml(matchedVacancy.officialLinks?.notificationPdfUrl || orgUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              आधिकारिक नोटिफिकेशन / PDF (Notification PDF)
            </a>
            <a href="${escapeHtml(orgUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 16px; background-color: #475569; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; width: fit-content;">
              आधिकारिक वेबसाइट (Official Website)
            </a>
          </div>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px;">
            अक्सर पूछे जाने वाले प्रश्न (FAQs)
          </h2>
          ${postFaqs
            .map(
              (f) =>
                `<div style="margin-bottom: 10px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;"><p style="font-weight: bold; margin: 0 0 4px 0;">प्र. ${escapeHtml(f.q)}</p><p style="margin: 0; color: #475569;">उ. ${escapeHtml(f.a)}</p></div>`
            )
            .join('')}
        </section>

        <section style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 14px;">
            Recent Posts
          </h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sortedVacancies
              .filter((v) => v.id !== matchedVacancy!.id)
              .slice(0, 8)
              .map(
                (other) => `
              <div>
                <a href="${baseUrl}/?vacancy=${encodeURIComponent(other.id)}" style="color: #0066cc; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; font-size: 16px; line-height: 1.4; display: block;">
                  ${escapeHtml(other.titleHi || other.title)}
                </a>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      </main>
    `;
  } else if (matchedPolicy && POLICY_SEO_META[matchedPolicy]) {
    const pMeta = POLICY_SEO_META[matchedPolicy];
    title = pMeta.title;
    description = pMeta.description;
    canonicalUrl = `${baseUrl}/?policy=${encodeURIComponent(matchedPolicy)}`;
    if (pMeta.noindex) {
      robotsDirective = 'noindex, follow';
    }

    ssrBodyContent = `
      <main class="ssr-seo-policy" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', sans-serif; color: #1e293b;">
        <nav style="font-size: 13px; margin-bottom: 16px; color: #64748b;">
          <a href="${baseUrl}/" style="color: #2563eb; text-decoration: none;">मुख्य पृष्ठ (Home)</a> &gt; <span>${escapeHtml(pMeta.heading)}</span>
        </nav>
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">${escapeHtml(pMeta.heading)}</h1>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; line-height: 1.8; font-size: 15px;">
          ${pMeta.bodyHtml}
        </div>
      </main>
    `;
  } else if (matchedCategory && matchedCategory !== 'ALL') {
    const catHi = CATEGORY_NAMES_HI[matchedCategory] || matchedCategory;
    title = `${catHi} 2026 - Rajasthan Vacancy Portal`;
    description = `राजस्थान एवं केंद्र सरकार की ${catHi} 2026 की नवीनतम अपडेट, नोटिफिकेशन, परीक्षा तिथि, प्रवेश पत्र एवं रिजल्ट।`;
    canonicalUrl = `${baseUrl}/?category=${encodeURIComponent(matchedCategory)}`;

    const categoryJobs = sortedVacancies.filter((v) => v.category === matchedCategory);

    ssrBodyContent = `
      <main class="ssr-seo-category" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', sans-serif;">
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
          ${escapeHtml(catHi)} (2026)
        </h1>
        <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
          ${escapeHtml(description)}
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${categoryJobs
            .map(
              (job) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; background: #ffffff;">
              <h2 style="font-size: 17px; margin: 0 0 8px 0;">
                <a href="${baseUrl}/?vacancy=${encodeURIComponent(job.id)}" style="color: #0f172a; text-decoration: none; font-weight: 700;">
                  ${escapeHtml(job.titleHi || job.title)}
                </a>
              </h2>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">${escapeHtml(job.briefSummaryHi || '')}</p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                <strong>पद:</strong> ${escapeHtml(job.totalPosts || 'विभिन्न')} | <strong>योग्यता:</strong> ${escapeHtml(job.qualification?.join(', ') || '12वीं/स्नातक')}
              </p>
            </div>
          `
            )
            .join('')}
        </div>
      </main>
    `;
  } else if (targetVacancyId && !matchedVacancy) {
    // Unknown/deleted vacancy slug -> prevent soft-404 duplicate canonical conflict
    robotsDirective = 'noindex, follow';
    canonicalUrl = `${baseUrl}/`;
  } else if (querySearch) {
    // Search result parameter pages -> prevent crawl bloat & duplicate canonical conflict
    robotsDirective = 'noindex, follow';
    canonicalUrl = `${baseUrl}/`;
  } else {
    // Homepage
    canonicalUrl = `${baseUrl}/`;
    const topJobs = sortedVacancies.slice(0, 100);
    ssrBodyContent = `
      <main class="ssr-seo-home" style="max-width: 1000px; margin: 0 auto; padding: 20px 16px; font-family: 'Mangal', 'Noto Sans Devanagari', sans-serif;">
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-align: center;">
          Rajasthan Vacancy 2026 - राजस्थान सरकारी भर्ती एवं रोजगार समाचार पोर्टल
        </h1>
        <p style="font-size: 15px; color: #475569; text-align: center; margin-bottom: 24px;">
          RSMSSB, RPSC, राजस्थान पुलिस, पटवारी, रीट, पशु परिचर, प्रवेश पत्र, आंसर की एवं सरकारी रिजल्ट की सबसे तेज और सटीक अपडेट।
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${topJobs
            .map(
              (job) => `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #ffffff;">
              <h2 style="font-size: 16px; margin: 0 0 6px 0;">
                <a href="${baseUrl}/?vacancy=${encodeURIComponent(job.id)}" style="color: #1e3a8a; text-decoration: none; font-weight: 700;">
                  ${escapeHtml(job.titleHi || job.title)}
                </a>
              </h2>
              <span style="font-size: 12px; color: #16a34a; font-weight: bold;">कुल पद: ${escapeHtml(job.totalPosts || 'विभिन्न')}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </main>
    `;
  }

  // Replace Title (robust against whitespace/minification)
  let modifiedHtml = htmlTemplate.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*name=["']?description["']?[^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Replace Meta Robots
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*name=["']?robots["']?[^>]*>/i,
    `<meta name="robots" content="${robotsDirective}" />`
  );

  // Replace Canonical Tag with strict self-referential canonical URL (matches any attribute order)
  modifiedHtml = modifiedHtml.replace(
    /<link\b[^>]*rel=["']?canonical["']?[^>]*>/i,
    `<link rel="canonical" id="primary-canonical" href="${canonicalUrl}" />`
  );

  // Replace OpenGraph & Twitter Tags
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*property=["']?og:title["']?[^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*property=["']?og:description["']?[^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*property=["']?og:url["']?[^>]*>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*property=["']?og:type["']?[^>]*>/i,
    `<meta property="og:type" content="${ogType}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*name=["']?twitter:title["']?[^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*name=["']?twitter:description["']?[^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  const featuredThumbUrl = matchedVacancy
    ? getJobFeaturedImage(matchedVacancy)
    : `${baseUrl}/og-preview.png`;

  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*property=["']?og:image["']?[^>]*>/i,
    `<meta property="og:image" content="${featuredThumbUrl}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\b[^>]*name=["']?twitter:image["']?[^>]*>/i,
    `<meta name="twitter:image" content="${featuredThumbUrl}" />`
  );

  // Replace static #dynamic-faq-schema-ld with page-specific FAQPage JSON-LD so we never emit duplicate FAQPage schemas
  if (faqReplacementJson) {
    modifiedHtml = modifiedHtml.replace(
      /<script\b[^>]*id=["']?dynamic-faq-schema-ld["']?[^>]*>[\s\S]*?<\/script>/i,
      `<script id="dynamic-faq-schema-ld" type="application/ld+json">\n${faqReplacementJson}\n</script>`
    );
  }

  // Inject Viral Keywords & Tags meta tags for organic SEO reach
  const viralTagsList =
    matchedVacancy?.tags && matchedVacancy.tags.length > 0
      ? matchedVacancy.tags.map((t) => t.replace(/^#/, ''))
      : [
          matchedVacancy ? matchedVacancy.titleHi || matchedVacancy.title : 'Rajasthan Vacancy',
          matchedVacancy?.organization || 'Rajasthan Govt',
          'Rajasthan Vacancy 2026',
          'Sarkari Result',
          'Govt Job Alert',
          'RPSC',
          'RSMSSB',
        ];
  const keywordsContent = viralTagsList.join(', ');

  if (/<meta\b[^>]*name=["']?keywords["']?[^>]*>/i.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(
      /<meta\b[^>]*name=["']?keywords["']?[^>]*>/i,
      `<meta name="keywords" content="${escapeHtml(keywordsContent)}" />`
    );
  } else {
    modifiedHtml = modifiedHtml.replace(
      '</head>',
      `<meta name="keywords" content="${escapeHtml(keywordsContent)}" />\n</head>`
    );
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
      /<div\s+id=["']?root["']?\s*><\/div>/i,
      `<div id="root">${ssrBodyContent}</div>`
    );
  }

  return modifiedHtml;
}
