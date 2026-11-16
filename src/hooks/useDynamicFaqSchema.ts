import { useEffect, useMemo } from 'react';
import { LanguageMode, VacancyItem } from '../types';
import { resolveJobDates } from '../utils/dateUtils';
import { buildCanonicalUrl, getCanonicalOrigin } from '../utils/seoCanonical';

export interface UseDynamicFaqSchemaOptions {
  vacancy: VacancyItem | null;
  lang?: LanguageMode;
}

const DEFAULT_HOME_FAQS = [
  {
    q: 'राजस्थान सरकारी भर्तियों के लिए SSO ID से ऑनलाइन आवेदन कैसे करें?',
    a: 'sso.rajasthan.gov.in पर लॉगिन करें, Recruitment Portal चुनें, One Time Registration (OTR) पूरा करें और इच्छित भर्ती के सामने Apply Now पर क्लिक करें।',
  },
  {
    q: 'One Time Registration (OTR) फीस कितनी है?',
    a: 'सामान्य व क्रीमीलेयर पिछड़ा वर्ग के लिए ₹600/- तथा राजस्थान के नॉन-क्रीमीलेयर OBC/EWS/SC/ST/PH के लिए ₹400/-। एक बार भुगतान के बाद सभी भर्ती फॉर्म निःशुल्क हैं।',
  },
  {
    q: 'राजस्थान सरकारी योजनाओं के लिए कौन से दस्तावेज जरूरी हैं?',
    a: 'जन आधार कार्ड (Jan Aadhaar Card), मूल निवास प्रमाण पत्र, आय प्रमाण पत्र और आधार कार्ड अनिवार्य हैं।',
  },
];

/**
 * Keeps `<script id="dynamic-faq-schema-ld" type="application/ld+json">` synchronized
 * with the active vacancy FAQs (when viewing a full post) or default portal FAQs (on Home/Category).
 */
export function useDynamicFaqSchema({
  vacancy,
  lang = 'hi',
}: UseDynamicFaqSchemaOptions): void {
  const faqJson = useMemo(() => {
    const isHi = lang === 'hi';
    const origin = getCanonicalOrigin();

    if (!vacancy) {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${origin}/#faq`,
          mainEntity: DEFAULT_HOME_FAQS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        },
        null,
        2
      );
    }

    const canonicalUrl = buildCanonicalUrl({ vacancyId: vacancy.id });
    const postTitle = isHi ? vacancy.titleHi || vacancy.title : vacancy.title;
    const orgUrl = vacancy.officialLinks?.officialWebsiteUrl || `${origin}/`;
    const resolvedDates = resolveJobDates(vacancy);

    const postFaqs =
      vacancy.faqs && vacancy.faqs.length > 0
        ? vacancy.faqs.map((f) => ({
            q: isHi ? f.qHi || f.q : f.q,
            a: isHi ? f.aHi || f.a : f.a,
          }))
        : [
            {
              q: `${postTitle} के लिए आधिकारिक वेबसाइट और आवेदन लिंक क्या है?`,
              a: `अभ्यर्थी आधिकारिक वेबसाइट ${orgUrl} अथवा इस पृष्ठ पर दिए गए डायरेक्ट लिंक से संपूर्ण जानकारी व ऑनलाइन फॉर्म प्राप्त कर सकते हैं।`,
            },
            {
              q: `${postTitle} की महत्वपूर्ण तिथियां एवं पद संख्या क्या है?`,
              a: `कुल पद/विवरण: ${vacancy.totalPosts || 'विज्ञप्ति अनुसार'}। अंतिम तिथि: ${resolvedDates.applyLastDate || 'आधिकारिक नोटिफिकेशन देखें'}।`,
            },
            {
              q: `${postTitle} के लिए शैक्षणिक योग्यता एवं आयु सीमा क्या है?`,
              a: `शैक्षणिक योग्यता: ${vacancy.qualificationDetailsHi || 'विज्ञप्ति अनुसार'}। आयु सीमा: ${vacancy.ageLimit?.min || 18} से ${vacancy.ageLimit?.max || 40} वर्ष (नियमानुसार छूट)।`,
            },
          ];

    return JSON.stringify(
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
  }, [vacancy, lang]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let faqScript = document.getElementById('dynamic-faq-schema-ld') as HTMLScriptElement | null;
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.id = 'dynamic-faq-schema-ld';
      faqScript.type = 'application/ld+json';
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = faqJson;
  }, [faqJson]);
}
