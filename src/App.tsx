import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  FastUpdatesGrid 
} from './components/FastUpdatesGrid';
import { 
  Footer 
} from './components/Footer';
import { FloatingSocialButtons } from './components/FloatingSocialButtons';
import { 
  OfflineIndicator 
} from './components/OfflineIndicator';
import { useAuth } from './context/AuthContext';

const FullPagePostView = lazy(() =>
  import('./components/FullPagePostView').then((m) => ({ default: m.FullPagePostView }))
);
const CategoryArchiveView = lazy(() =>
  import('./components/CategoryArchiveView').then((m) => ({ default: m.CategoryArchiveView }))
);
const PrivacyPolicy = lazy(() =>
  import('./components/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsAndConditions = lazy(() =>
  import('./components/TermsAndConditions').then((m) => ({ default: m.TermsAndConditions }))
);
const ContactUs = lazy(() =>
  import('./components/ContactUs').then((m) => ({ default: m.ContactUs }))
);
const AboutUs = lazy(() =>
  import('./components/AboutUs').then((m) => ({ default: m.AboutUs }))
);
const Disclaimer = lazy(() =>
  import('./components/Disclaimer').then((m) => ({ default: m.Disclaimer }))
);
const SitemapPage = lazy(() =>
  import('./components/SitemapPage').then((m) => ({ default: m.SitemapPage }))
);
const AdminLoginModal = lazy(() =>
  import('./components/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal }))
);
const SubscribeAlertsModal = lazy(() =>
  import('./components/SubscribeAlertsModal').then((m) => ({ default: m.SubscribeAlertsModal }))
);
const UrlIndexationModal = lazy(() =>
  import('./components/UrlIndexationModal').then((m) => ({ default: m.UrlIndexationModal }))
);
import { buildCanonicalUrl, applyCanonicalTag, getCanonicalOrigin } from './utils/seoCanonical';
import { useDynamicBreadcrumbSchema } from './hooks/useDynamicBreadcrumbSchema';
import { useDynamicJobSchema } from './hooks/useDynamicJobSchema';
import { useDynamicFaqSchema } from './hooks/useDynamicFaqSchema';
import { getJobFeaturedImage } from './utils/thumbnailGenerator';
import {
  AUTO_DELETE_MAX_AGE_DAYS,
  compareVacanciesNewestFirst,
  filterActivePostsWithinDays,
  isPostOlderThanDays,
} from './utils/dateUtils';

import { INITIAL_VACANCIES } from './data/mockVacancies';
import { 
  VacancyItem, 
  CategoryType, 
  JobStatusType, 
  LanguageMode 
} from './types';

import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_VACANCIES = 'raj_vacancies_v31';
const STORAGE_KEY_ALERT_JOBS = 'raj_alert_job_ids_v1';

// Clean up legacy cached storage versions
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && ((key.startsWith('raj_vacancies_v') && key !== STORAGE_KEY_VACANCIES) || 
          key.startsWith('raj_saved_ids_v'))) {
        localStorage.removeItem(key);
      }
    }
  }
} catch (e) {}

export default function App() {
  const { isAdmin } = useAuth();
  // Default language set to Hindi
  const [lang] = useState<LanguageMode>('hi');

  // Track deleted post IDs so deleted posts remain deleted permanently
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('raj_deleted_vacancies');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('raj_deleted_vacancies', JSON.stringify(deletedIds));
    } catch (e) {}
  }, [deletedIds]);

  // Vacancies state with localStorage sync
  const [vacancies, setVacancies] = useState<VacancyItem[]>(() => {
    let loaded = INITIAL_VACANCIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VACANCIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stored vacancies', e);
    }

    // Filter out deleted posts
    let initialDeleted: string[] = [];
    try {
      const storedDel = localStorage.getItem('raj_deleted_vacancies');
      if (storedDel) initialDeleted = JSON.parse(storedDel);
    } catch (e) {}

    let filteredLoaded = filterActivePostsWithinDays(
      loaded.filter(v => !initialDeleted.includes(v.id) && v.id !== 'ugc-net-2026-june'),
      AUTO_DELETE_MAX_AGE_DAYS
    );
    
    INITIAL_VACANCIES.forEach(initItem => {
      if (!initialDeleted.includes(initItem.id) && !isPostOlderThanDays(initItem, AUTO_DELETE_MAX_AGE_DAYS)) {
        const exists = filteredLoaded.some(v => v.id === initItem.id);
        if (!exists) {
          filteredLoaded = [initItem, ...filteredLoaded];
        }
      }
    });

    // Merge handwritten notes and updated human guidance for base items
    return filterActivePostsWithinDays(
      filteredLoaded.map(item => {
        const initMatch = INITIAL_VACANCIES.find(init => init.id === item.id);
        if (initMatch) {
          return {
            ...initMatch,
            ...item,
            officialLinks: initMatch.officialLinks || item.officialLinks,
            handwrittenNotes: item.handwrittenNotes || initMatch.handwrittenNotes,
            briefSummaryHi: (item.briefSummaryHi && item.briefSummaryHi.length > 30) ? item.briefSummaryHi : initMatch.briefSummaryHi,
            descriptionHi: initMatch.descriptionHi || item.descriptionHi,
          };
        }
        return item;
      }),
      AUTO_DELETE_MAX_AGE_DAYS
    );
  });

  // Automatically purge any post that becomes older than 70 days while app is running
  useEffect(() => {
    const purgeExpiredPosts = () => {
      const nowMs = Date.now();
      setVacancies(prev => {
        const expiredIds = prev
          .filter(v => isPostOlderThanDays(v, AUTO_DELETE_MAX_AGE_DAYS, nowMs))
          .map(v => v.id);
        if (expiredIds.length === 0) return prev;

        setAlertJobIds(prevAlerts => prevAlerts.filter(id => !expiredIds.includes(id)));
        return prev.filter(v => !expiredIds.includes(v.id));
      });
    };

    purgeExpiredPosts();
    const intervalId = window.setInterval(purgeExpiredPosts, 30 * 60 * 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        purgeExpiredPosts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VACANCIES, JSON.stringify(vacancies));
    try {
      window.dispatchEvent(new Event('raj_vacancies_updated'));
    } catch (e) {}
  }, [vacancies]);

  // Tracked Alert Job IDs
  const [alertJobIds, setAlertJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERT_JOBS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALERT_JOBS, JSON.stringify(alertJobIds));
  }, [alertJobIds]);

  // Toggle 'Alert Me' for specific post (Requests browser Notification)
  const handleToggleAlertMe = (id: string) => {
    const targetJob = vacancies.find(v => v.id === id);
    const isCurrentlySet = alertJobIds.includes(id);

    if (isCurrentlySet) {
      setAlertJobIds(prev => prev.filter(i => i !== id));
      showToast(lang === 'hi' ? 'जॉब अलर्ट हटा दिया गया' : 'Job alert removed');
    } else {
      setAlertJobIds(prev => [...prev, id]);

      // Request browser notification permission if available
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted' && targetJob) {
              new Notification('🔔 जॉब अलर्ट सक्रिय!', {
                body: `${targetJob.titleHi || targetJob.title} - जैसे ही फॉर्म शुरू होंगे, आपको ब्राउज़र नोटिफिकेशन मिल जाएगा।`,
              });
            }
          });
        } else if (Notification.permission === 'granted' && targetJob) {
          new Notification('🔔 जॉब अलर्ट सक्रिय!', {
            body: `${targetJob.titleHi || targetJob.title} - जैसे ही फॉर्म शुरू होंगे, आपको ब्राउज़र नोटिफिकेशन मिल जाएगा।`,
          });
        }
      }

      showToast(
        lang === 'hi' 
          ? '🔔 अलर्ट सक्रिय! फॉर्म शुरू होते ही आपको नोटिफिकेशन मिल जाएगा।' 
          : '🔔 Alert active! You will be notified when applications open.'
      );
    }
  };

  // Monitor job status updates from 'upcoming' to 'active' for alertJobIds
  const prevStatusesRef = React.useRef<Record<string, JobStatusType>>({});

  useEffect(() => {
    vacancies.forEach(job => {
      const prevStatus = prevStatusesRef.current[job.id];
      const newStatus = job.status;

      // If status changed to 'active' (especially from 'upcoming') and user requested alert for this job
      if (prevStatus && prevStatus !== 'active' && newStatus === 'active' && alertJobIds.includes(job.id)) {
        const jobTitle = lang === 'hi' ? (job.titleHi || job.title) : job.title;
        const msg = `🔥 ऑनलाइन आवेदन शुरू! ${jobTitle}`;

        showToast(msg);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🔥 ऑनलाइन आवेदन शुरू हो गए हैं!', {
            body: `${jobTitle}\nकुल पद: ${job.totalPosts || 'विभिन्न'}. अंतिम तिथि: ${job.importantDates?.applyLastDate || 'TBA'}`,
          });
        }
      }

      // Record current status in ref
      prevStatusesRef.current[job.id] = job.status;
    });
  }, [vacancies, alertJobIds, lang]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');

  // Modals & Selection
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUrlIndexationOpen, setIsUrlIndexationOpen] = useState(false);
  const [activePolicyView, setActivePolicyView] = useState<'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap' | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  const isUnresolvedInitialUrlRef = React.useRef<boolean>(false);

  // Deep linking sync for SEO (reads ?vacancy=... or pathname /slug/ and ?category=... from URL/sitemap)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cleanPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const policyParam = params.get('policy');
      const isSitemapPath = cleanPath.toLowerCase() === 'sitemap';
      const vacancyParam = params.get('vacancy') || (!isSitemapPath && cleanPath && cleanPath !== '' && !cleanPath.includes('.') ? cleanPath : null);
      const categoryParam = params.get('category');
      const toolParam = params.get('tool') || params.get('indexation');

      if (toolParam === 'indexation' || toolParam === '1' || toolParam === 'true') {
        setIsUrlIndexationOpen(true);
      }

      if (isSitemapPath || policyParam === 'sitemap') {
        setActivePolicyView('sitemap');
      } else if (policyParam === 'privacy' || policyParam === 'terms' || policyParam === 'contact' || policyParam === 'about' || policyParam === 'disclaimer') {
        setActivePolicyView(policyParam);
      }

      if (vacancyParam) {
        let found = vacancies.find((v) => v.id === vacancyParam || v.id.toLowerCase() === vacancyParam.toLowerCase());
        if (!found) {
          try {
            const cached = localStorage.getItem(`raj_offline_job_${vacancyParam}`);
            if (cached) {
              found = JSON.parse(cached);
            }
          } catch (e) {}
        }
        if (found) {
          isUnresolvedInitialUrlRef.current = false;
          setSelectedVacancy(found);
          setActivePolicyView(null);
        } else {
          isUnresolvedInitialUrlRef.current = true;
        }
      }

      if (categoryParam && categoryParam !== 'ALL') {
        isUnresolvedInitialUrlRef.current = false;
        const normalizedCat = categoryParam === 'ugc_net' ? 'latest_job' : categoryParam;
        setSelectedCategory(normalizedCat as CategoryType);
        setActivePolicyView(null);
      }
    } catch (e) {
      console.error('Error parsing URL params for SEO', e);
    }
  }, []);

  // Keep <script id="dynamic-breadcrumb-schema-ld"> synced with navigation hierarchy (Home > Category > Job)
  useDynamicBreadcrumbSchema({
    lang,
    selectedCategory,
    selectedVacancy,
    activePolicyView,
  });

  // Keep <script id="dynamic-job-schema-ld"> synced with memoized ISO 8601 datePosted/validThrough
  useDynamicJobSchema({
    vacancy: selectedVacancy,
    lang,
    origin: getCanonicalOrigin(),
  });

  // Keep <script id="dynamic-faq-schema-ld"> synced for Google Rich Results FAQPage
  useDynamicFaqSchema({
    vacancy: selectedVacancy,
    lang,
  });

  // Update URL, Canonical, OpenGraph, and JobPosting JSON-LD schema when selectedVacancy or selectedCategory changes
  useEffect(() => {
    try {
      const origin = getCanonicalOrigin();
      const url = new URL(window.location.href);
      const metaDescEl = document.querySelector('meta[name="description"]');
      const currentVacancyId = url.searchParams.get('vacancy');
      const isHi = lang === 'hi';

      if (selectedVacancy) {
        isUnresolvedInitialUrlRef.current = false;
        if (currentVacancyId !== selectedVacancy.id || url.pathname !== '/' || url.searchParams.has('policy')) {
          url.pathname = '/';
          url.searchParams.set('vacancy', selectedVacancy.id);
          url.searchParams.delete('category');
          url.searchParams.delete('policy');
          window.history.replaceState({ vacancyId: selectedVacancy.id }, '', url.toString());
        }
        const titleText = `${isHi ? (selectedVacancy.titleHi || selectedVacancy.title) : selectedVacancy.title} - Rajasthan Vacancy 2026`;
        const descText = selectedVacancy.briefSummaryHi || selectedVacancy.briefSummary || selectedVacancy.descriptionHi || selectedVacancy.title;
        const canonicalHref = buildCanonicalUrl({ vacancyId: selectedVacancy.id });

        const robotsEl = document.querySelector('meta[name="robots"]');
        if (robotsEl) {
          robotsEl.removeAttribute('data-ssr-status');
          robotsEl.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }
        document.title = titleText;
        if (metaDescEl) metaDescEl.setAttribute('content', descText);
        applyCanonicalTag(canonicalHref);

        // OpenGraph & Twitter tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', titleText);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', descText);

        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', titleText);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', descText);

        // High-CTR Canvas Thumbnail for Social Previews (WhatsApp, Telegram, Twitter)
        const featuredThumb = getJobFeaturedImage(selectedVacancy);
        let ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', featuredThumb);
        let twImg = document.querySelector('meta[name="twitter:image"]');
        if (twImg) twImg.setAttribute('content', featuredThumb);

      } else if (selectedCategory !== 'ALL') {
        if (currentVacancyId) {
          url.searchParams.delete('vacancy');
          window.history.replaceState({ vacancyId: null }, '', url.toString());
        }
        if (url.searchParams.get('category') !== selectedCategory || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.set('category', selectedCategory);
          window.history.replaceState({ category: selectedCategory }, '', url.toString());
        }

        const catTitles: Record<string, { hi: string; en: string }> = {
          latest_job: { hi: 'लेटेस्ट जॉब्स 2026 - राजस्थान व केंद्र सरकारी नौकरियां', en: 'Latest Jobs 2026 - Rajasthan Govt Jobs & Recruitment' },
          admit_card: { hi: 'एडमिट कार्ड 2026 - प्रवेश पत्र डाउनलोड करें', en: 'Admit Card 2026 - Hall Ticket & Exam City Slip' },
          result: { hi: 'रिजल्ट 2026 - सरकारी भर्ती परिणाम एवं कट ऑफ मार्क्स', en: 'Result 2026 - Sarkari Result & Cutoff Marks' },
          answer_key: { hi: 'उत्तर कुंजी (Answer Key) 2026 - आधिकारिक आंसर की', en: 'Answer Key 2026 - Official Question Paper & Answer Key' },
          scheme: { hi: 'सरकारी योजनाएं 2026 - राजस्थान एवं केंद्र सरकारी योजनाएं', en: 'Sarkari Yojana 2026 - Government Schemes & Subsidy' },
          news: { hi: 'लेटेस्ट न्यूज़ 2026 - सरकारी भर्ती व परीक्षा ताज़ा समाचार', en: 'Latest News 2026 - Sarkari Job News & Announcements' },
          exam_date: { hi: 'परीक्षा तिथियां (Exam Dates) 2026 - एग्जाम कैलेंडर', en: 'Exam Dates 2026 - Sarkari Exam Schedule & Dates' },
          syllabus: { hi: 'पाठ्यक्रम (Syllabus) 2026 - विस्तृत सिलेबस एवं परीक्षा पैटर्न', en: 'Syllabus 2026 - Exam Pattern & Syllabus PDF' }
        };
        const catInfo = catTitles[selectedCategory] || { hi: `${getSectionTitle(selectedCategory)} 2026`, en: `${getSectionTitle(selectedCategory)} 2026` };
        const catTitle = `${isHi ? catInfo.hi : catInfo.en} - Rajasthan Vacancy`;
        const catDesc = `सभी ${isHi ? catInfo.hi : catInfo.en} की नवीनतम सूची, ऑनलाइन आवेदन, महत्वपूर्ण तिथियां व आधिकारिक अधिसूचना पीडीएफ यहां देखें।`;

        document.title = catTitle;
        if (metaDescEl) metaDescEl.setAttribute('content', catDesc);

        // Self-referential canonical for Category pages so GSC indexes each category URL
        const canonicalHref = buildCanonicalUrl({ category: selectedCategory });
        applyCanonicalTag(canonicalHref);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', catTitle);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', catDesc);

        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', catTitle);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', catDesc);

      } else if (activePolicyView) {
        if (url.searchParams.get('policy') !== activePolicyView || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.delete('vacancy');
          url.searchParams.delete('category');
          url.searchParams.set('policy', activePolicyView);
          window.history.replaceState({ policy: activePolicyView }, '', url.toString());
        }
        const policyMeta: Record<string, { title: string; desc: string; robots?: string }> = {
          sitemap: {
            title: 'HTML Sitemap Directory - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy 2026 की सभी सरकारी भर्तियों, एडमिट कार्ड, रिजल्ट व योजनाओं की श्रेणीवार निर्देशिका।',
            robots: 'noindex, follow',
          },
          privacy: {
            title: 'Privacy Policy - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy (www.rajasthanvacancy.online) गोपनीयता नीति: उपयोगकर्ता डेटा सुरक्षा, कुकीज़ एवं विज्ञापन नीति की पूरी जानकारी।',
          },
          terms: {
            title: 'Terms & Conditions - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy पोर्टल के उपयोग की नियम एवं शर्तें। सूचना स्रोतों, आधिकारिक वेबसाइट सत्यापन और सामग्री उपयोग के नियम।',
          },
          contact: {
            title: 'Contact Us - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy संपादकीय टीम से संपर्क करें: सरकारी भर्ती अपडेट, सुधार सुझाव या सहायता के लिए ईमेल व संपर्क विवरण।',
          },
          about: {
            title: 'About Us - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy (www.rajasthanvacancy.online) के बारे में जानें - राजस्थान व केंद्र सरकार की भर्तियों, रिजल्ट व योजनाओं का विश्वसनीय पोर्टल।',
          },
          disclaimer: {
            title: 'Disclaimer - Rajasthan Vacancy 2026',
            desc: 'Rajasthan Vacancy अस्वीकरण (Disclaimer): सभी भर्ती सूचनाएं आधिकारिक पोर्टलों पर आधारित हैं। आवेदन से पूर्व आधिकारिक विज्ञप्ति अवश्य जांचें।',
          },
        };
        const pMeta = policyMeta[activePolicyView] || {
          title: 'Rajasthan Vacancy 2026',
          desc: 'Rajasthan Vacancy 2026 portal information page.',
        };
        const policyCanonical = `${origin}/?policy=${activePolicyView}`;
        document.title = pMeta.title;
        if (metaDescEl) metaDescEl.setAttribute('content', pMeta.desc);
        applyCanonicalTag(policyCanonical);

        const robotsEl = document.querySelector('meta[name="robots"]');
        if (robotsEl) {
          robotsEl.setAttribute('content', pMeta.robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', pMeta.title);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', pMeta.desc);
      } else {
        const robotsEl = document.querySelector('meta[name="robots"]');
        const isSsrNotFound = robotsEl?.getAttribute('data-ssr-status') === '404';
        if (isSsrNotFound || isUnresolvedInitialUrlRef.current) {
          // Deleted/unknown initial slug: keep noindex, follow and remove competing canonical so Google never flags a duplicate canonical
          if (robotsEl) {
            robotsEl.setAttribute('data-ssr-status', '404');
            robotsEl.setAttribute('content', 'noindex, follow');
          }
          document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
          document.title = 'पोस्ट उपलब्ध नहीं है (404) - Rajasthan Vacancy 2026';
          return;
        }
        if (currentVacancyId || url.searchParams.has('category') || url.searchParams.has('policy') || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.delete('vacancy');
          url.searchParams.delete('category');
          url.searchParams.delete('policy');
          window.history.replaceState({ vacancyId: null, category: null }, '', url.toString());
        }
        if (robotsEl) {
          robotsEl.removeAttribute('data-ssr-status');
          robotsEl.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }
        document.title = 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal';
        const defaultDesc = 'Latest Rajasthan & Central Govt job alerts 2026: RSMSSB, RPSC, Rajasthan Police, REET, Patwari, Pashu Parichar, Admit Card, Answer Key & Sarkari Results.';
        if (metaDescEl) metaDescEl.setAttribute('content', defaultDesc);

        // Self-referential canonical for Home portal
        const canonicalHref = buildCanonicalUrl({});
        applyCanonicalTag(canonicalHref);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', defaultDesc);

        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', 'Rajasthan Vacancy 2026');
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', defaultDesc);
      }
    } catch (e) {
      console.error('Error updating URL params and SEO titles', e);
    }
  }, [selectedVacancy, selectedCategory, activePolicyView, lang]);

  // Handle browser Back/Forward button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cleanPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const policyParam = params.get('policy');
      const categoryParam = params.get('category');
      const vacancyId = params.get('vacancy') || (cleanPath && cleanPath !== '' && !cleanPath.includes('.') ? cleanPath : null);
      if (vacancyId) {
        const found = vacancies.find(v => v.id === vacancyId || v.id.toLowerCase() === vacancyId.toLowerCase());
        setSelectedVacancy(found || null);
        setActivePolicyView(null);
      } else if (categoryParam && categoryParam !== 'ALL') {
        setSelectedVacancy(null);
        setActivePolicyView(null);
        setSelectedCategory(categoryParam as CategoryType);
      } else if (policyParam === 'privacy' || policyParam === 'terms' || policyParam === 'contact' || policyParam === 'about' || policyParam === 'disclaimer' || policyParam === 'sitemap') {
        setSelectedVacancy(null);
        setSelectedCategory('ALL');
        setActivePolicyView(policyParam);
      } else {
        setSelectedVacancy(null);
        setSelectedCategory('ALL');
        setActivePolicyView(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [vacancies]);

  // Cache currently viewed job post in localStorage for offline reading
  useEffect(() => {
    if (selectedVacancy) {
      try {
        localStorage.setItem(`raj_offline_job_${selectedVacancy.id}`, JSON.stringify(selectedVacancy));
      } catch (e) {}
    }
  }, [selectedVacancy]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectVacancy = (item: VacancyItem) => {
    // Increment clicks count dynamically
    setVacancies(prev =>
      prev.map(v => v.id === item.id ? { ...v, clicksCount: (v.clicksCount || 0) + 1 } : v)
    );
    setActivePolicyView(null);
    setSelectedVacancy(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateVacancy = (updatedJob: VacancyItem) => {
    setVacancies(prev => prev.map(v => v.id === updatedJob.id ? updatedJob : v));
    setSelectedVacancy(updatedJob);
    // Background Auto-Index ping for updated post
    fetch('/api/seo/auto-index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [`${getCanonicalOrigin()}/?vacancy=${encodeURIComponent(updatedJob.id)}`] })
    }).catch(() => {});
    showToast(lang === 'hi' ? 'पोस्ट विवरण सफलतापूर्वक अपडेट कर दिया गया!' : 'Post details updated successfully!');
  };

  const handleDeleteVacancy = (id: string) => {
    setDeletedIds(prev => {
      if (!prev.includes(id)) return [...prev, id];
      return prev;
    });
    setVacancies(prev => prev.filter(v => v.id !== id));
    setSelectedVacancy(null);
    showToast(lang === 'hi' ? '🗑️ पोस्ट सफलतापूर्वक डिलीट कर दी गई!' : '🗑️ Post deleted successfully!');
  };

  // Filtered and Sorted vacancies
  const filteredVacancies = useMemo(() => {
    return vacancies.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(query);
        const inTitleHi = item.titleHi.toLowerCase().includes(query);
        const inDept = item.department.toLowerCase().includes(query);
        const inAdvt = item.advtNo.toLowerCase().includes(query);
        const inPost = item.postName.toLowerCase().includes(query);
        const inTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inTitleHi && !inDept && !inAdvt && !inPost && !inTags) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'ALL') {
        if (item.category === selectedCategory) {
          // direct match
        } else if (selectedCategory === 'admit_card' && (item.category === 'admit_card' || item.status === 'admit_card_out' || item.title.toLowerCase().includes('admit card') || item.titleHi?.includes('प्रवेश पत्र'))) {
          // match
        } else if (selectedCategory === 'result' && (item.category === 'result' || item.status === 'result_declared' || item.title.toLowerCase().includes('result') || item.titleHi?.includes('रिजल्ट') || item.titleHi?.includes('परिणाम'))) {
          // match
        } else if (selectedCategory === 'scheme' && (item.category === 'scheme' || item.organization === 'Sarkari Yojana' || item.titleHi?.includes('योजना'))) {
          // match
        } else if (selectedCategory === 'exam_date' && (item.category === 'exam_date' || item.title.toLowerCase().includes('exam date') || item.titleHi?.includes('परीक्षा तिथि'))) {
          // match
        } else if (selectedCategory === 'news' && (item.category === 'news' || item.title.toLowerCase().includes('news') || item.tags?.includes('news') || item.title.toLowerCase().includes('chunav') || item.titleHi?.includes('न्यूज़') || item.titleHi?.includes('चुनाव'))) {
          // match
        } else if (selectedCategory === 'answer_key' && (item.category === 'answer_key' || item.status === 'answer_key_out' || item.title.toLowerCase().includes('answer key') || item.titleHi?.includes('उत्तर कुंजी'))) {
          // match
        } else if (selectedCategory === 'syllabus' && (item.category === 'syllabus' || item.title.toLowerCase().includes('syllabus') || item.titleHi?.includes('पाठ्यक्रम') || item.titleHi?.includes('सिलेबस'))) {
          // match
        } else if (selectedCategory === 'latest_job' && (item.category === 'latest_job' || item.category === 'ugc_net')) {
          // match
        } else {
          return false;
        }
      }

      return true;
    }).sort(compareVacanciesNewestFirst);
  }, [vacancies, searchQuery, selectedCategory]);

  const isHi = lang === 'hi';

  const getSectionTitle = (cat: string) => {
    switch (cat) {
      case 'latest_job': return isHi ? 'सरकारी नौकरियां (Latest Jobs)' : 'Latest Jobs';
      case 'admit_card': return isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Cards';
      case 'result': return isHi ? 'परीक्षा परिणाम (Results)' : 'Results';
      case 'exam_date': return isHi ? 'परीक्षा तिथियां (Exam Dates)' : 'Exam Dates';
      case 'news': return isHi ? 'लेटेस्ट न्यूज़ (Latest News)' : 'Latest News';
      case 'scheme': return isHi ? 'सरकारी योजनाएं (Sarkari Yojana)' : 'Government Yojana';
      case 'answer_key': return isHi ? 'उत्तर कुंजी (Answer Key)' : 'Answer Key';
      case 'syllabus': return isHi ? 'सिलेबस (Syllabus)' : 'Syllabus';
      default: return isHi ? 'भर्ती एवं सूचनाएं' : 'Job Notifications';
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        lang={lang}
        onGoHome={() => {
          setSelectedCategory('ALL');
          setSearchQuery('');
          setSelectedVacancy(null);
          setActivePolicyView(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        latestVacancies={vacancies}
        onSelectVacancy={handleSelectVacancy}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat as any);
          setSelectedVacancy(null);
          setActivePolicyView(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
      />

      {/* Main Body Container - Clean Portal Structure */}
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 pb-8 flex-1 bg-white">
        <div className="w-full space-y-6">
            {activePolicyView === 'privacy' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <PrivacyPolicy
                  lang={lang}
                  onBack={() => setActivePolicyView(null)}
                  onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                />
              </Suspense>
            ) : activePolicyView === 'terms' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <TermsAndConditions lang={lang} onBack={() => setActivePolicyView(null)} />
              </Suspense>
            ) : activePolicyView === 'contact' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <ContactUs lang={lang} onBack={() => setActivePolicyView(null)} />
              </Suspense>
            ) : activePolicyView === 'about' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <AboutUs lang={lang} onBack={() => setActivePolicyView(null)} />
              </Suspense>
            ) : activePolicyView === 'disclaimer' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <Disclaimer lang={lang} onBack={() => setActivePolicyView(null)} />
              </Suspense>
            ) : activePolicyView === 'sitemap' ? (
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
                <SitemapPage
                  lang={lang}
                  vacancies={vacancies}
                  onBack={() => setActivePolicyView(null)}
                  onSelectVacancy={handleSelectVacancy}
                  onSelectCategory={(cat) => {
                    setActivePolicyView(null);
                    setSelectedVacancy(null);
                    setSelectedCategory(cat);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectPolicy={(policy) => {
                    setActivePolicyView(policy);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isAdmin={isAdmin}
                />
              </Suspense>
            ) : selectedVacancy ? (
              /* Full Page View with Dynamic Head Meta Tags */
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">पोस्ट विवरण लोड हो रहा है...</div>}>
                <FullPagePostView
                  vacancy={selectedVacancy}
                  onBack={() => {
                    setSelectedVacancy(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  lang={lang}
                  allVacancies={vacancies}
                  onSelectOtherVacancy={handleSelectVacancy}
                  isAdmin={isAdmin}
                  onDeleteVacancy={handleDeleteVacancy}
                  onUpdateVacancy={handleUpdateVacancy}
                  onSelectCategory={(cat) => {
                    setSelectedVacancy(null);
                    setSelectedCategory(cat as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSearchKeyword={(keyword) => {
                    setSelectedVacancy(null);
                    setSearchQuery(keyword.replace(/^#/, ''));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </Suspense>
            ) : selectedCategory !== 'ALL' ? (
              /* Category Archive View matching authentic rajasthanvacancy.com category layout */
              <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">श्रेणी सूची लोड हो रही है...</div>}>
                <CategoryArchiveView
                  categoryKey={selectedCategory}
                  categoryTitle={getSectionTitle(selectedCategory)}
                  categoryTitleHi={getSectionTitle(selectedCategory)}
                  vacancies={filteredVacancies}
                  allVacancies={vacancies}
                  lang={lang}
                  onSelectVacancy={handleSelectVacancy}
                  onClearCategory={() => {
                    setSelectedCategory('ALL');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectCategory={(catKey) => {
                    setSelectedCategory(catKey as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isAdmin={isAdmin}
                  onDeleteVacancy={handleDeleteVacancy}
                />
              </Suspense>
            ) : (
              /* Home View: 3x2 Grid Fast Access Updates */
              <div className="space-y-4">
                <div className="pt-1 pb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Rajasthan Vacancy 2026
                  </h1>
                </div>
                <FastUpdatesGrid
                  vacancies={filteredVacancies}
                  lang={lang}
                  onSelectVacancy={handleSelectVacancy}
                  onFilterCategory={(cat) => setSelectedCategory(cat as any)}
                  isAdmin={isAdmin}
                  onDeleteVacancy={handleDeleteVacancy}
                  alertJobIds={alertJobIds}
                  onToggleAlertMe={handleToggleAlertMe}
                  onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
                />
              </div>
            )}
        </div>
      </main>

      {/* Full Comprehensive Footer Component */}
      <Footer
        lang={lang}
        onSelectPolicy={(policy) => {
          setActivePolicyView(policy);
          setSelectedVacancy(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
        onSelectVacancy={handleSelectVacancy}
        isAdmin={isAdmin}
      />

      {/* Utility Modals (Lazy-mounted only when opened) */}
      {isAdminLoginOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            lang={lang}
          />
        </Suspense>
      )}

      {isSubscribeModalOpen && (
        <Suspense fallback={null}>
          <SubscribeAlertsModal
            isOpen={isSubscribeModalOpen}
            onClose={() => setIsSubscribeModalOpen(false)}
            lang={lang}
          />
        </Suspense>
      )}

      {isUrlIndexationOpen && (
        <Suspense fallback={null}>
          <UrlIndexationModal
            isOpen={isUrlIndexationOpen}
            onClose={() => setIsUrlIndexationOpen(false)}
            lang={lang}
            vacancies={vacancies}
          />
        </Suspense>
      )}

      <FloatingSocialButtons 
        lang={lang} 
        whatsappUrl="https://whatsapp.com/channel/0029VbEOVh74dTnTUUmjcS0j"
        telegramUrl="https://t.me/rajsthan_vacancy"
      />
      <OfflineIndicator lang={lang} />
    </div>
  );
}
