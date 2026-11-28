import type { Metadata } from 'next';
import { PortalHomeClient } from '@/components/PortalHomeClient';
import { INITIAL_VACANCIES } from '@/data/mockVacancies';
import { filterActivePostsWithinDays } from '@/utils/dateUtils';
import { buildFaqPageJsonLd } from '@/utils/faqSchemaBuilder';
import { getSocialOgImageUrl } from '@/utils/shareUtils';
import {
  DEFAULT_PRODUCTION_ORIGIN as CANONICAL_ORIGIN,
  getBreadcrumbCategoryLabel,
  normalizeBreadcrumbCategoryKey,
} from '@/utils/seoCanonical';

const CATEGORY_TITLES: Record<string, string> = {
  latest_job: 'लेटेस्ट जॉब्स 2026 - राजस्थान व केंद्र सरकारी नौकरियां',
  admit_card: 'एडमिट कार्ड 2026 - प्रवेश पत्र डाउनलोड करें',
  result: 'रिजल्ट 2026 - सरकारी भर्ती परिणाम एवं कट ऑफ मार्क्स',
  answer_key: 'उत्तर कुंजी (Answer Key) 2026 - आधिकारिक आंसर की',
  scheme: 'सरकारी योजनाएं 2026 - राजस्थान एवं केंद्र सरकारी योजनाएं',
  news: 'लेटेस्ट न्यूज़ 2026 - सरकारी भर्ती व परीक्षा ताज़ा समाचार',
  exam_date: 'परीक्षा तिथियां (Exam Dates) 2026 - एग्जाम कैलेंडर',
  syllabus: 'पाठ्यक्रम (Syllabus) 2026 - विस्तृत सिलेबस एवं परीक्षा पैटर्न',
};

const POLICY_META: Record<string, { title: string; desc: string; noindex?: boolean }> = {
  about: {
    title: 'About Us (हमारे बारे में) - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy (www.rajasthanvacancy.online) के बारे में जानें: राजस्थान एवं केंद्र सरकार की सभी भर्तियों, एडमिट कार्ड, रिजल्ट व सरकारी योजनाओं की सटीक जानकारी।',
  },
  contact: {
    title: 'Contact Us (संपर्क करें) - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy टीम से संपर्क करें: किसी भर्ती अपडेट, त्रुटि सुधार या सुझाव के लिए आधिकारिक ईमेल व सहायता माध्यम।',
  },
  privacy: {
    title: 'Privacy Policy (गोपनीयता नीति) - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy गोपनीयता नीति: उपयोगकर्ता की गोपनीयता, ब्राउज़र स्टोरेज, कुकीज़ तथा Google AdSense विज्ञापन मानकों की पूरी जानकारी।',
  },
  terms: {
    title: 'Terms & Conditions (नियम एवं शर्तें) - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy पोर्टल के उपयोग की नियम एवं शर्तें। आधिकारिक वेबसाइट सत्यापन व सामग्री उपयोग दिशा-निर्देश।',
  },
  disclaimer: {
    title: 'Disclaimer (अस्वीकरण) - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy अस्वीकरण: यह एक स्वतंत्र सूचनात्मक रोजगार समाचार पोर्टल है, किसी सरकारी संस्था से संबद्ध नहीं है।',
  },
  sitemap: {
    title: 'HTML Sitemap Directory - Rajasthan Vacancy 2026',
    desc: 'Rajasthan Vacancy 2026 पोर्टल के सभी सक्रिय पेज, श्रेणियां एवं पोस्ट्स की सूची।',
    noindex: true,
  },
};

interface PageSearchParams {
  vacancy?: string;
  category?: string;
  policy?: string;
  search?: string;
  tool?: string;
  indexation?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);

  const vacancyParam = typeof sp.vacancy === 'string' ? sp.vacancy.trim() : '';
  const categoryParam = typeof sp.category === 'string' ? sp.category.trim() : '';
  const policyParam = typeof sp.policy === 'string' ? sp.policy.trim().toLowerCase() : '';

  if (policyParam && POLICY_META[policyParam]) {
    const pMeta = POLICY_META[policyParam];
    const canonical = `${CANONICAL_ORIGIN}/?policy=${encodeURIComponent(policyParam)}`;
    return {
      title: pMeta.title,
      description: pMeta.desc,
      alternates: { canonical },
      robots: pMeta.noindex ? { index: false, follow: true } : { index: true, follow: true },
      openGraph: {
        title: pMeta.title,
        description: pMeta.desc,
        url: canonical,
      },
    };
  }

  if (vacancyParam) {
    const matched = activeVacancies.find(
      (v) => v.id.toLowerCase() === vacancyParam.toLowerCase()
    );
    if (matched) {
      const postTitle = matched.titleHi || matched.title;
      const title = `${postTitle} - Rajasthan Vacancy 2026`;
      const isAdmitPost = matched.category === 'admit_card' || matched.status === 'admit_card_out';
      const isResultPost = matched.category === 'result' || matched.status === 'result_declared';
      const fallbackDesc = isAdmitPost
        ? `${postTitle}: एडमिट कार्ड जारी, परीक्षा तिथि, शिफ्ट समय, डाउनलोड करने की प्रक्रिया, केंद्र निर्देश एवं डायरेक्ट लिंक।`
        : isResultPost
          ? `${postTitle}: आधिकारिक मेरिट लिस्ट PDF, कैटेगरी वाइज कट-ऑफ मार्क्स, स्कोरकार्ड व अगली चयन प्रक्रिया की पूरी जानकारी।`
          : `${postTitle}: कुल पद ${matched.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
      const description = matched.briefSummaryHi || fallbackDesc;
      const canonical = `${CANONICAL_ORIGIN}/?vacancy=${encodeURIComponent(matched.id)}`;
      const ogImageUrl = getSocialOgImageUrl(matched);

      return {
        title,
        description,
        alternates: { canonical },
        robots: { index: true, follow: true },
        openGraph: {
          siteName: 'Rajasthan Vacancy',
          locale: 'hi_IN',
          title,
          description,
          url: canonical,
          type: 'article',
          images: [{ url: ogImageUrl, width: 1200, height: 630, alt: postTitle }],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImageUrl],
        },
      };
    }

    return {
      title: 'पोस्ट उपलब्ध नहीं है (404) - Rajasthan Vacancy 2026',
      robots: { index: false, follow: true },
    };
  }

  if (categoryParam && categoryParam.toUpperCase() !== 'ALL') {
    const normCat = normalizeBreadcrumbCategoryKey(categoryParam);
    const catTitle = `${CATEGORY_TITLES[normCat] || getBreadcrumbCategoryLabel(normCat, 'hi')} - Rajasthan Vacancy`;
    const catDesc = `सभी ${getBreadcrumbCategoryLabel(normCat, 'hi')} की नवीनतम सूची, ऑनलाइन आवेदन, महत्वपूर्ण तिथियां व आधिकारिक अधिसूचना पीडीएफ यहां देखें।`;
    const canonical = `${CANONICAL_ORIGIN}/?category=${encodeURIComponent(normCat)}`;
    return {
      title: catTitle,
      description: catDesc,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        title: catTitle,
        description: catDesc,
        url: canonical,
      },
    };
  }

  return {
    title: 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal',
    description:
      'Rajasthan Vacancy 2026: Latest Rajasthan & Central Govt job alerts, RSMSSB, RPSC, Rajasthan Police, Patwari, REET, Pashu Parichar, Admit Cards, Answer Keys, and Sarkari Results.',
    alternates: { canonical: `${CANONICAL_ORIGIN}/` },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const sp = await searchParams;
  const vacancyParam = typeof sp.vacancy === 'string' ? sp.vacancy.trim() : null;
  const categoryParam = typeof sp.category === 'string' ? sp.category.trim() : null;
  const policyParam = typeof sp.policy === 'string' ? sp.policy.trim().toLowerCase() : null;
  const searchQuery = typeof sp.search === 'string' ? sp.search.trim() : null;
  const openIndexation = sp.tool === 'indexation' || sp.indexation === '1' || sp.indexation === 'true';

  const activeVacancies = filterActivePostsWithinDays(INITIAL_VACANCIES);
  const matchedVacancy = vacancyParam
    ? activeVacancies.find((v) => v.id.toLowerCase() === vacancyParam.toLowerCase()) || null
    : null;

  const ssrFaqJson = !policyParam
    ? buildFaqPageJsonLd({
        vacancy: matchedVacancy,
        category: matchedVacancy ? null : categoryParam,
        vacancies: activeVacancies,
        lang: 'hi',
        origin: CANONICAL_ORIGIN,
      }).replace(/</g, '\\u003c')
    : '';

  return (
    <>
      {!policyParam && ssrFaqJson && (
        <script
          id="dynamic-faq-schema-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ssrFaqJson }}
        />
      )}
      <PortalHomeClient
        initialVacancyId={vacancyParam}
        initialCategory={categoryParam}
        initialPolicy={policyParam}
        initialSearch={searchQuery}
        initialOpenIndexation={openIndexation}
      />
    </>
  );
}
