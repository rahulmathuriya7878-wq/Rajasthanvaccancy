import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/index.css';
import { AuthProvider } from '@/context/AuthContext';
import { PortalProvider } from '@/context/PortalContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingSocialButtons from '@/components/FloatingSocialButtons';
import { PortalShellExtras } from '@/components/PortalShellExtras';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DEFAULT_PRODUCTION_ORIGIN as SITE_URL } from '@/utils/seoCanonical';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d97706',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal',
  description:
    'Rajasthan Vacancy 2026: Latest Rajasthan & Central Govt job alerts, RSMSSB, RPSC, Rajasthan Police, Patwari, REET, Pashu Parichar, Admit Cards, Answer Keys, and Sarkari Results.',
  keywords: [
    'rajasthan vacancy',
    'rajasthan vacancy 2026',
    'rajasthan govt jobs',
    'rsmssb recruitment',
    'rpsc vacancy',
    'rajasthan police constable',
    'pashu parichar',
    'patwari bharti',
    'reet 2026',
    'sarkari result',
    'admit card',
    'answer key',
    'rojgar samachar',
  ],
  authors: [{ name: 'Rajasthan Vacancy Portal' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Rajasthan Vacancy 2026 RSS Feed' },
      ],
    },
  },
  openGraph: {
    siteName: 'Rajasthan Vacancy',
    locale: 'hi_IN',
    type: 'website',
    title: 'Rajasthan Vacancy 2026 - Govt Job Notifications, Admit Cards & Sarkari Results',
    description:
      'Rajasthan & Central Govt job alerts 2026: RSMSSB, RPSC, Rajasthan Police, REET, Patwari, Pashu Parichar, Admit Card, Answer Key & Sarkari Results.',
    url: `${SITE_URL}/`,
    images: [{ url: `${SITE_URL}/og-preview.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rajasthan Vacancy 2026 - Govt Job Notifications & Sarkari Results',
    description:
      'Rajasthan & Central Govt job alerts: RSMSSB, RPSC, Rajasthan Police, REET, Patwari, Admit Card, Answer Key & Sarkari Result.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  other: {
    'google-site-verification': [
      'AkqUWtVgC1HPENLj_SBrFv7PcJ9i71wEK34SbAbQiT0',
      'lTKi1f0ZNHKY5XMyfOKA0U6GyrqfzVUXkfy_BVvC6I4',
      'bAKCo-Lc77-L8y34N_6hBGgCnBeCRLdCr8Ev1R6Wspc',
    ],
    'google-adsense-account': 'ca-pub-3176571184961509',
  },
};

const BASE_GRAPH_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Rajasthan Vacancy - Sarkari Job Alerts & Recruitment Portal',
      description:
        'Latest Rajasthan Government Job Notifications, Admit Cards, Results, Syllabus, and Sarkari Yojana.',
      inLanguage: ['hi-IN', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#application`,
      name: 'Rajasthan Vacancy Portal',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
        />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(BASE_GRAPH_JSON_LD) }}
        />
      </head>
      <body>
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3176571184961509"
          crossOrigin="anonymous"
        />
        <ErrorBoundary>
          <AuthProvider>
            <PortalProvider>
              <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-white">
                <Header />
                <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 pb-8 flex-1 bg-white">
                  {children}
                </main>
                <Footer />
                <FloatingSocialButtons />
                <PortalShellExtras />
              </div>
            </PortalProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
