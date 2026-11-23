import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import { PhotoSignResizeTool } from '@/components/PhotoSignResizeTool';
import { DEFAULT_PRODUCTION_ORIGIN as SITE_URL } from '@/utils/seoCanonical';

const CANONICAL_URL = `${SITE_URL}/photo-signature-resize-tool`;

export const metadata: Metadata = {
  title: 'Photo & Signature Resize Tool Online Free (20KB, 50KB) - SSC, UPSC, RPSC, RSSB | Rajasthan Vacancy',
  description:
    'Free online Photo and Signature Resize Tool for Rajasthan RPSC, RSSB, SSO, REET, SSC, UPSC and Railway forms. Resize passport photo to 20KB–50KB and signature to 10KB–20KB instantly in your browser.',
  keywords: [
    'photo signature resize tool',
    'photo resize 20kb to 50kb',
    'signature resize 10kb to 20kb',
    'rajasthan sso photo resize',
    'rpsc photo signature size',
    'rssb rsmssb photo resize tool',
    'ssc photo signature resize',
    'upsc photo resize online',
    'sarkari form photo resizer',
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: CANONICAL_URL,
    siteName: 'Rajasthan Vacancy',
    title: 'Photo & Signature Resize Tool Online Free — SSC, UPSC, Rajasthan Exams',
    description:
      'सरकारी नौकरी फॉर्म (RPSC, RSSB, SSO, SSC, UPSC, Railway) के लिए पासपोर्ट फोटो और हस्ताक्षर का सटीक साइज़ (KB व Pixel) तुरंत बनाएं।',
    images: [{ url: `${SITE_URL}/og-preview.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo & Signature Resize Tool Online Free — Rajasthan Vacancy',
    description:
      'Resize Passport Photo (20KB–50KB) & Signature (10KB–20KB) for Rajasthan SSO, RPSC, RSSB, SSC, UPSC & Railway forms.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

const FAQ_ITEMS = [
  {
    q: 'क्या यह Photo & Signature Resize Tool पूरी तरह सुरक्षित और फ्री है?',
    a: 'जी हाँ, यह टूल 100% मुफ़्त है और पूरी तरह आपके मोबाइल या कंप्यूटर ब्राउज़र (HTML5 Canvas) में काम करता है। आपकी फोटो या हस्ताक्षर किसी भी बाहरी सर्वर पर अपलोड या सेव नहीं किए जाते।',
  },
  {
    q: 'राजस्थान SSO / RPSC / RSSB भर्ती फॉर्म के लिए फोटो और सिग्नेचर का सही साइज़ क्या है?',
    a: 'राजस्थान SSO पोर्टल (RPSC व RSSB/RSMSSB भर्तियों) के लिए पासपोर्ट फोटो का साइज़ सामान्यतः 50 KB से 100 KB (लगभग 240 × 320 पिक्सेल, 3.5 × 4.5 सेमी) और हस्ताक्षर (Signature) का साइज़ 20 KB से 50 KB (लगभग 280 × 80 पिक्सेल) JPG/JPEG फ़ॉर्मेट में होना चाहिए।',
  },
  {
    q: 'SSC (CGL, CHSL, GD, MTS) फॉर्म के लिए फोटो और सिग्नेचर कितने KB का होना चाहिए?',
    a: 'SSC की परीक्षाओं के लिए पासपोर्ट फोटो 20 KB से 50 KB (3.5 सेमी चौड़ाई × 4.5 सेमी ऊंचाई) और हस्ताक्षर 10 KB से 20 KB (4.0 सेमी चौड़ाई × 2.0 सेमी ऊंचाई) के बीच JPEG फ़ॉर्मेट में मांगे जाते हैं।',
  },
  {
    q: 'UPSC (IAS, NDA, CDS) के लिए फोटो और सिग्नेचर का पिक्सेल साइज़ क्या होता है?',
    a: 'UPSC आवेदन में फोटो और सिग्नेचर दोनों का न्यूनतम पिक्सेल 350 × 350 और अधिकतम 1000 × 1000 पिक्सेल तथा फ़ाइल साइज़ 20 KB से 300 KB के बीच JPG फ़ॉर्मेट में होना आवश्यक है।',
  },
  {
    q: 'क्या मोबाइल से खींची गई सिग्नेचर फोटो का बैकग्राउंड सफ़ेद किया जा सकता है?',
    a: 'हाँ, टूल में "हस्ताक्षर (Signature)" मोड चुनकर "सफ़ेद बैकग्राउंड साफ़ करें (Clean White Signature Background)" विकल्प चालू करें। इससे कागज़ की हल्की छाया हट जाएगी और आपके हस्ताक्षर साफ़ व गहरे दिखाई देंगे।',
  },
  {
    q: 'क्या इस टूल से फोटो के नीचे नाम और फोटो खींचने की तारीख (DOP) लिखी जा सकती है?',
    a: 'हाँ, पासपोर्ट फोटो मोड में "फोटो के नीचे नाम और तारीख लिखें" विकल्प चुनकर आप अभ्यर्थी का नाम और Date of Photo (DOP) सीधे फोटो के नीचे जोड़ सकते हैं।',
  },
];

const TOOL_SCHEMA_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Photo & Signature Resize Tool',
          item: CANONICAL_URL,
        },
      ],
    },
    {
      '@type': 'WebApplication',
      name: 'Rajasthan Vacancy Photo & Signature Resize Tool',
      url: CANONICAL_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: ['hi-IN', 'en-IN'],
      description:
        'Free browser-based Photo and Signature Resize Tool for Rajasthan RPSC, RSSB, SSO, SSC, UPSC, Railway and Banking exam forms.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
};

export default function PhotoSignatureResizeToolPage() {
  return (
    <article className="w-full space-y-8 pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOL_SCHEMA_JSON_LD) }}
      />

      {/* Breadcrumb & Page Hero */}
      <header className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[#15803d] font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>होम पेज (Rajasthan Vacancy)</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-700 font-medium">Photo &amp; Signature Resize Tool</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          फोटो और सिग्नेचर रीसाइज़ टूल (Photo &amp; Signature Resize Tool Online)
        </h1>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl">
          राजस्थान SSO, RPSC, RSSB (RSMSSB), REET, पुलिस, SSC, UPSC, रेलवे (RRB) और बैंकिंग की ऑनलाइन सरकारी भर्तियों के लिए अपनी पासपोर्ट साइज़ फोटो (20 KB – 100 KB) और हस्ताक्षर (10 KB – 50 KB) को सटीक पिक्सेल व JPG फ़ॉर्मेट में तुरंत तैयार करें।
        </p>
      </header>

      {/* Interactive Tool Component */}
      <PhotoSignResizeTool />

      {/* Comprehensive SEO & Candidate Guide Content (~600 words) */}
      <div className="space-y-8 pt-2 text-slate-800 leading-relaxed">
        {/* How to Use Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Photo &amp; Signature Resize Tool कैसे इस्तेमाल करें? (Step-by-Step Guide)
          </h2>
          <p className="text-sm sm:text-base text-slate-700">
            सरकारी नौकरी का ऑनलाइन आवेदन फॉर्म भरते समय सबसे अधिक समस्या फोटो और सिग्नेचर के गलत KB साइज़ या पिक्सेल के कारण आती है। इस ऑनलाइन टूल की मदद से आप बिना किसी ऐप को डाउनलोड किए केवल 30 सेकंड में अपनी इमेज को सही साइज़ में बदल सकते हैं:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-slate-700">
            <li>
              <strong>मोड चुनें:</strong> सबसे पहले ऊपर दिए गए बटन से <strong>पासपोर्ट फोटो (Photo)</strong> या <strong>हस्ताक्षर (Signature)</strong> में से अपनी ज़रूरत का विकल्प चुनें।
            </li>
            <li>
              <strong>परीक्षा प्रीसेट सिलेक्ट करें:</strong> Rajasthan (RPSC / RSSB / SSO), SSC, UPSC, Railway या Banking प्रीसेट पर क्लिक करते ही सटीक चौड़ाई, ऊंचाई और KB सीमा अपने-आप सेट हो जाएगी। आप चाहें तो अपनी मर्ज़ी से Custom Width, Height और Max KB भी डाल सकते हैं।
            </li>
            <li>
              <strong>फ़ाइल अपलोड करें:</strong> अपने मोबाइल की गैलरी या कंप्यूटर से JPG, PNG या WebP फोटो चुनें। यह टूल आपकी फोटो को सीधे आपके ब्राउज़र में प्रोसेस करता है।
            </li>
            <li>
              <strong>वैकल्पिक सुधार करें:</strong> यदि हस्ताक्षर की फोटो पर कागज़ की परछाई आ रही है, तो <em>Clean White Signature Background</em> चालू करें। पासपोर्ट फोटो के नीचे नाम व तारीख (DOP) लिखने के लिए <em>Name &amp; Date of Photo</em> विकल्प का उपयोग करें।
            </li>
            <li>
              <strong>लाइव प्रीव्यू जांचें और डाउनलोड करें:</strong> दाईं ओर नया पिक्सेल साइज़ और KB देखकर <strong>Download</strong> बटन पर क्लिक करें और सीधे आवेदन पोर्टल पर अपलोड करें।
            </li>
          </ol>
        </section>

        {/* Exam-wise Official Size Chart */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            SSC, UPSC और Rajasthan Exams के लिए फोटो व सिग्नेचर का सही साइज़ (Official Size Chart 2026)
          </h2>
          <p className="text-sm sm:text-base text-slate-700">
            हर भर्ती बोर्ड (जैसे RPSC, RSSB, SSC, UPSC और RRB) के ऑनलाइन पोर्टल पर दस्तावेज़ अपलोड करने के लिए अलग-अलग पिक्सेल, सेंटीमीटर और KB सीमा तय होती है। आवेदन करने से पहले नीचे दी गई मानक तालिका की जांच ज़रूर करें:
          </p>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                  <th className="py-3 px-3.5 font-bold">परीक्षा / बोर्ड (Exam / Board)</th>
                  <th className="py-3 px-3.5 font-bold">पासपोर्ट फोटो (Photo Size)</th>
                  <th className="py-3 px-3.5 font-bold">हस्ताक्षर (Signature Size)</th>
                  <th className="py-3 px-3.5 font-bold">फ़ॉर्मेट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    Rajasthan SSO / RPSC / RSSB / REET / Police
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    50 KB – 100 KB · 240 × 320 px (3.5 × 4.5 cm)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    20 KB – 50 KB · 280 × 80 px (7 × 2 cm)
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">JPG / JPEG</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    SSC (CGL, CHSL, GD, MTS, CPO)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    20 KB – 50 KB · 3.5 × 4.5 cm (~276 × 354 px)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    10 KB – 20 KB · 4.0 × 2.0 cm (~315 × 157 px)
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">JPEG</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    UPSC (IAS / Civil Services, NDA, CDS)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    20 KB – 300 KB · 350 × 350 से 1000 × 1000 px
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    20 KB – 300 KB · 350 × 350 से 1000 × 1000 px
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">JPG</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    Railway RRB (NTPC, Group D, ALP, RPF)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    30 KB – 70 KB · 35 × 45 mm (~276 × 354 px)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    30 KB – 70 KB · 50 × 20 mm (~394 × 157 px)
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">JPG / JPEG</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    Banking (IBPS PO/Clerk, SBI, RBI)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    20 KB – 50 KB · 200 × 230 px (4.5 × 3.5 cm)
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    10 KB – 20 KB · 140 × 60 px
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">JPG / JPEG</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600">
            नोट: किसी विशेष भर्ती का फॉर्म भरते समय हमेशा आधिकारिक अधिसूचना (Official Notification) में दिए गए नवीनतम निर्देशों की पुष्टि अवश्य करें।
          </p>
        </section>

        {/* Guidelines to Avoid Form Rejection */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#15803d] shrink-0" aria-hidden="true" />
            <span>आवेदन फॉर्म रिजेक्ट होने से बचने के ज़रूरी नियम (Photo &amp; Signature Guidelines)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">पासपोर्ट फोटो के लिए सावधानियां</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>फोटो पिछले 3 से 6 महीने के भीतर की नवीनतम होनी चाहिए और बैकग्राउंड सादा सफ़ेद या हल्का रंग का हो।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>फोटो में दोनों कान व पूरा चेहरा स्पष्ट दिखना चाहिए; टोपी, काला चश्मा या भारी फ़िल्टर का उपयोग न करें।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>धुंधली (blur), उल्टी या सेल्फ़ी वाली फोटो अपलोड करने पर SSC व RPSC आवेदन निरस्त कर सकते हैं।</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">हस्ताक्षर (Signature) के लिए सावधानियां</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>हस्ताक्षर हमेशा बिना लाइन वाले सादे सफ़ेद कागज़ पर काले या गहरे नीले पेन (Black/Blue Ink) से करें।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>पूरे हस्ताक्षर केवल CAPITAL LETTERS में न लिखें — अधिकांश परीक्षाओं में रनिंग हैंड सिग्नेचर ही मान्य होते हैं।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>सिग्नेचर के चारों ओर का अतिरिक्त खाली हिस्सा क्रॉप कर लें और हमेशा JPG/JPEG फ़ॉर्मेट में सेव करें।</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#15803d] shrink-0" aria-hidden="true" />
            <span>अक्सर पूछे जाने वाले सवाल (FAQs)</span>
          </h2>
          <div className="divide-y divide-slate-200">
            {FAQ_ITEMS.map((faq, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {idx + 1}. {faq.q}
                </h3>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
