import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  FastUpdatesGrid 
} from './components/FastUpdatesGrid';
import { 
  FullPagePostView 
} from './components/FullPagePostView';
import { 
  CategoryArchiveView 
} from './components/CategoryArchiveView';
import { 
  Footer 
} from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { ContactUs } from './components/ContactUs';
import { AboutUs } from './components/AboutUs';
import { Disclaimer } from './components/Disclaimer';
import { SitemapPage } from './components/SitemapPage';
import { FloatingSocialButtons } from './components/FloatingSocialButtons';
import { 
  EligibilityFinderModal 
} from './components/EligibilityFinderModal';
import { 
  SavedJobsModal 
} from './components/SavedJobsModal';
import { 
  AdminLoginModal 
} from './components/AdminLoginModal';
import { 
  SubscribeAlertsModal 
} from './components/SubscribeAlertsModal';
import { 
  OfflineIndicator 
} from './components/OfflineIndicator';
import { UrlIndexationModal } from './components/UrlIndexationModal';
import { useAuth } from './context/AuthContext';
import { generateHindiShareText } from './utils/shareUtils';
import { buildCanonicalUrl, applyCanonicalTag, getCanonicalOrigin } from './utils/seoCanonical';
import { getJobFeaturedImage } from './utils/thumbnailGenerator';

import { INITIAL_VACANCIES } from './data/mockVacancies';
import { 
  VacancyItem, 
  BoardType, 
  CategoryType, 
  QualificationType, 
  JobStatusType, 
  LanguageMode 
} from './types';

import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_VACANCIES = 'raj_vacancies_v28';
const STORAGE_KEY_SAVED = 'raj_saved_ids_v3';
const STORAGE_KEY_LANG = 'raj_lang_pref_v2';
const STORAGE_KEY_ALERT_JOBS = 'raj_alert_job_ids_v1';

// Clean up legacy cached storage versions
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('raj_vacancies_v') && key !== STORAGE_KEY_VACANCIES) || 
          (key && key.startsWith('raj_saved_ids_v') && key !== STORAGE_KEY_SAVED)) {
        localStorage.removeItem(key);
      }
    }
  }
} catch (e) {}

export default function App() {
  const { isAdmin } = useAuth();
  // Default language set to Hindi
  const [lang, setLang] = useState<LanguageMode>('hi');

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

    let filteredLoaded = loaded.filter(v => !initialDeleted.includes(v.id) && v.id !== 'ugc-net-2026-june');
    
    INITIAL_VACANCIES.forEach(initItem => {
      if (!initialDeleted.includes(initItem.id)) {
        const exists = filteredLoaded.some(v => v.id === initItem.id);
        if (!exists) {
          filteredLoaded = [initItem, ...filteredLoaded];
        }
      }
    });

    // Merge handwritten notes and updated human guidance for base items
    return filteredLoaded.map(item => {
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
    });
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VACANCIES, JSON.stringify(vacancies));
    try {
      window.dispatchEvent(new Event('raj_vacancies_updated'));
      (window as any).updateDynamicFaqSchema?.();
    } catch (e) {}
  }, [vacancies]);

  // Saved / Bookmarked IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load saved IDs', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedIds));
  }, [savedIds]);

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

  // Toggle 'Alert Me' for specific post (Requests browser Notification & saves to favorites)
  const handleToggleAlertMe = (id: string) => {
    const targetJob = vacancies.find(v => v.id === id);
    const isCurrentlySet = alertJobIds.includes(id);

    if (isCurrentlySet) {
      setAlertJobIds(prev => prev.filter(i => i !== id));
      showToast(lang === 'hi' ? 'जॉब अलर्ट हटा दिया गया' : 'Job alert removed');
    } else {
      setAlertJobIds(prev => [...prev, id]);

      // Automatically save to favorites list
      if (!savedIds.includes(id)) {
        setSavedIds(prev => [...prev, id]);
      }

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
          ? '🔔 अलर्ट सक्रिय! पसंदीदा सूची में सहेजी गई तथा फॉर्म शुरू होते ही नोटिफिकेशन मिलेगा।' 
          : '🔔 Alert active! Saved to favorites & you will be notified when applications open.'
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
  const [selectedBoard, setSelectedBoard] = useState<BoardType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [selectedQualification, setSelectedQualification] = useState<QualificationType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<JobStatusType | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedJobType, setSelectedJobType] = useState<string>('ALL');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'posts'>('latest');

  // Modals & Selection
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<VacancyItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isUrlIndexationOpen, setIsUrlIndexationOpen] = useState(false);
  const [activePolicyView, setActivePolicyView] = useState<'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap' | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(() => {
    try {
      return !localStorage.getItem('raj_alert_subscribed_v1');
    } catch (e) {
      return false;
    }
  });

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
          setSelectedVacancy(found);
          setActivePolicyView(null);
        }
      }

      if (categoryParam && categoryParam !== 'ALL') {
        setSelectedCategory(categoryParam as CategoryType);
        setActivePolicyView(null);
      }
    } catch (e) {
      console.error('Error parsing URL params for SEO', e);
    }
  }, []);

  // Update URL, Canonical, OpenGraph, and JobPosting JSON-LD schema when selectedVacancy or selectedCategory changes
  useEffect(() => {
    try {
      const origin = getCanonicalOrigin();
      const url = new URL(window.location.href);
      const metaDescEl = document.querySelector('meta[name="description"]');
      const currentVacancyId = url.searchParams.get('vacancy');
      const isHi = lang === 'hi';

      if (selectedVacancy) {
        if (currentVacancyId !== selectedVacancy.id || url.pathname !== '/' || url.searchParams.has('policy')) {
          url.pathname = '/';
          url.searchParams.set('vacancy', selectedVacancy.id);
          url.searchParams.delete('category');
          url.searchParams.delete('policy');
          window.history.replaceState({ vacancyId: selectedVacancy.id }, '', url.toString());
        }
        const titleText = `${isHi ? (selectedVacancy.titleHi || selectedVacancy.title) : selectedVacancy.title} - Rajasthan Vacancy`;
        const descText = selectedVacancy.briefSummaryHi || selectedVacancy.briefSummary || selectedVacancy.descriptionHi || selectedVacancy.title;
        const canonicalHref = buildCanonicalUrl({ vacancyId: selectedVacancy.id });

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

        // Dynamic Schema.org JobPosting or Article JSON-LD for rich Googlebot indexing
        let jobScript = document.getElementById('dynamic-job-schema-ld') as HTMLScriptElement | null;
        if (!jobScript) {
          jobScript = document.createElement('script');
          jobScript.id = 'dynamic-job-schema-ld';
          jobScript.type = 'application/ld+json';
          document.head.appendChild(jobScript);
        }
        const jobSchema = {
          "@context": "https://schema.org",
          "@type": selectedVacancy.category === 'scheme' ? 'Article' : 'JobPosting',
          "title": selectedVacancy.titleHi || selectedVacancy.title,
          "description": descText,
          "datePosted": selectedVacancy.createdAt || '2026-10-27',
          "validThrough": selectedVacancy.importantDates?.applyLastDate || '2026-12-31',
          "employmentType": "FULL_TIME",
          "hiringOrganization": {
            "@type": "Organization",
            "name": selectedVacancy.departmentHi || selectedVacancy.department || selectedVacancy.organization,
            "sameAs": selectedVacancy.officialLinks?.officialWebsiteUrl || origin
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "Rajasthan",
              "addressCountry": "IN"
            }
          }
        };
        jobScript.textContent = JSON.stringify(jobSchema, null, 2);

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

        const jobScript = document.getElementById('dynamic-job-schema-ld');
        if (jobScript) jobScript.remove();

      } else if (activePolicyView) {
        if (url.searchParams.get('policy') !== activePolicyView || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.delete('vacancy');
          url.searchParams.delete('category');
          url.searchParams.set('policy', activePolicyView);
          window.history.replaceState({ policy: activePolicyView }, '', url.toString());
        }
        const policyTitles: Record<string, string> = {
          sitemap: 'Sitemap - Rajasthan Vacancy 2026',
          privacy: 'Privacy Policy - Rajasthan Vacancy 2026',
          terms: 'Terms & Conditions - Rajasthan Vacancy 2026',
          contact: 'Contact Us - Rajasthan Vacancy 2026',
          about: 'About Us - Rajasthan Vacancy 2026',
          disclaimer: 'Disclaimer - Rajasthan Vacancy 2026',
        };
        document.title = policyTitles[activePolicyView] || 'Rajasthan Vacancy 2026';
        applyCanonicalTag(`${origin}/?policy=${activePolicyView}`);
      } else {
        if (currentVacancyId || url.searchParams.has('category') || url.searchParams.has('policy') || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.delete('vacancy');
          url.searchParams.delete('category');
          url.searchParams.delete('policy');
          window.history.replaceState({ vacancyId: null, category: null }, '', url.toString());
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

        // Clean up individual job schema on home view
        const jobScript = document.getElementById('dynamic-job-schema-ld');
        if (jobScript) jobScript.remove();
      }
      (window as any).updateDynamicFaqSchema?.();
    } catch (e) {
      console.error('Error updating URL params and SEO titles', e);
    }
  }, [selectedVacancy, selectedCategory, activePolicyView, lang]);

  // Handle browser Back/Forward button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cleanPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const vacancyId = params.get('vacancy') || (cleanPath && cleanPath !== '' && !cleanPath.includes('.') ? cleanPath : null);
      if (vacancyId) {
        const found = vacancies.find(v => v.id === vacancyId || v.id.toLowerCase() === vacancyId.toLowerCase());
        if (found) {
          setSelectedVacancy(found);
        } else {
          setSelectedVacancy(null);
        }
      } else {
        setSelectedVacancy(null);
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

  const handleToggleSave = (id: string) => {
    const isAlreadySaved = savedIds.includes(id);
    if (isAlreadySaved) {
      setSavedIds(savedIds.filter(i => i !== id));
      showToast(lang === 'hi' ? 'भर्ती को सुरक्षित सूची से हटाया गया' : 'Removed from saved jobs');
    } else {
      setSavedIds([...savedIds, id]);
      showToast(lang === 'hi' ? 'भर्ती को सुरक्षित सूची में जोड़ा गया ★' : 'Notification saved successfully ★');
    }

    setVacancies(prev =>
      prev.map(v => {
        if (v.id === id) {
          const currentSaves = v.savesCount || 0;
          return {
            ...v,
            savesCount: isAlreadySaved ? Math.max(0, currentSaves - 1) : currentSaves + 1
          };
        }
        return v;
      })
    );
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

  const handleShareVacancy = (item: VacancyItem) => {
    const titleHi = item.titleHi || item.title;
    const text = generateHindiShareText(item);

    if (navigator.share) {
      navigator.share({
        title: titleHi,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast(lang === 'hi' ? 'महत्वपूर्ण जानकारी एवं लिंक कॉपी हो गया!' : 'Details copied to clipboard!');
    }
  };

  const handleAddVacancy = (newJob: VacancyItem) => {
    // Reset active search & category filter so new post is immediately visible on homepage
    setSearchQuery('');
    setSelectedCategory('ALL');

    const formattedJob: VacancyItem = {
      ...newJob,
      createdAt: newJob.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: newJob.updatedAt || 'अभी-अभी (Just Now)',
      status: newJob.status || 'active'
    };

    setVacancies(prev => [formattedJob, ...prev.filter(v => v.id !== formattedJob.id)]);
    setSelectedVacancy(formattedJob);

    // Background Auto-Index ping for new post
    fetch('/api/seo/auto-index', { method: 'POST' }).catch(() => {});
    if (formattedJob.category === 'scheme' || formattedJob.organization === 'Sarkari Yojana') {
      showToast(lang === 'hi' ? 'सरकारी योजना सफलतापूर्वक जोड़ी गई व तुरंत होमपेज पर लाइव!' : 'Scheme alert posted & live on homepage!');
    } else {
      showToast(lang === 'hi' ? 'सरकारी भर्ती सफलतापूर्वक जोड़ी गई व तुरंत होमपेज पर लाइव!' : 'Govt job alert posted & live on homepage!');
    }
  };

  const handleUpdateVacancy = (updatedJob: VacancyItem) => {
    setVacancies(prev => prev.map(v => v.id === updatedJob.id ? updatedJob : v));
    setSelectedVacancy(updatedJob);
    // Background Auto-Index ping for updated post
    fetch('/api/seo/auto-index', { method: 'POST' }).catch(() => {});
    showToast(lang === 'hi' ? 'पोस्ट विवरण सफलतापूर्वक अपडेट कर दिया गया!' : 'Post details updated successfully!');
    setEditingVacancy(null);
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBoard('ALL');
    setSelectedCategory('ALL');
    setSelectedQualification('ALL');
    setSelectedStatus('ALL');
    setSelectedLocation('ALL');
    setSelectedJobType('ALL');
    setSelectedSalaryRange('ALL');
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

      // 2. Board
      if (selectedBoard !== 'ALL' && item.organization !== selectedBoard) {
        return false;
      }

      // 3. Category
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
        } else if (selectedCategory === 'latest_job' && (item.category === 'latest_job' || item.category === 'ugc_net' || item.status === 'active')) {
          // match
        } else {
          return false;
        }
      }

      // 4. Qualification
      if (selectedQualification !== 'ALL') {
        if (!item.qualification.includes(selectedQualification)) {
          return false;
        }
      }

      // 5. Status
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      // 6. Location
      if (selectedLocation !== 'ALL') {
        const locStr = ((item.jobLocation || '') + ' ' + (item.department || '') + ' ' + (item.titleHi || '')).toLowerCase();
        if (!locStr.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 7. Job Type
      if (selectedJobType !== 'ALL') {
        const descStr = ((item.descriptionHi || '') + ' ' + (item.description || '') + ' ' + (item.briefSummaryHi || '')).toLowerCase();
        if (selectedJobType === 'contract' && !descStr.includes('संविदा') && !descStr.includes('contract')) return false;
        if (selectedJobType === 'regular' && (descStr.includes('संविदा') || descStr.includes('contract'))) return false;
        if (selectedJobType === 'scheme' && item.category !== 'scheme') return false;
      }

      // 8. Salary Range
      if (selectedSalaryRange !== 'ALL') {
        const salStr = ((item.salary || '') + ' ' + (item.salaryHi || '')).toLowerCase();
        if (selectedSalaryRange === '20k' && !salStr.includes('19,900') && !salStr.includes('20,000') && !salStr.includes('level-2') && !salStr.includes('level-4') && !salStr.includes('level-7')) return false;
        if (selectedSalaryRange === '40k' && !salStr.includes('44,900') && !salStr.includes('level-7') && !salStr.includes('30,000')) return false;
        if (selectedSalaryRange === 'contract' && !salStr.includes('मानदेय') && !salStr.includes('contract')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = a.importantDates.applyLastDate || '9999-99-99';
        const dateB = b.importantDates.applyLastDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'posts') {
        const postsA = typeof a.totalPosts === 'number' ? a.totalPosts : 0;
        const postsB = typeof b.totalPosts === 'number' ? b.totalPosts : 0;
        return postsB - postsA;
      }
      // default: latest
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [vacancies, searchQuery, selectedBoard, selectedCategory, selectedQualification, selectedStatus, selectedLocation, selectedJobType, selectedSalaryRange, sortBy]);

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
        setLang={setLang}
        savedCount={savedIds.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenAddJob={() => {
          if (!isAdmin) {
            setIsAdminLoginOpen(true);
          } else {
            setEditingVacancy(null);
            setIsAddJobOpen(true);
          }
        }}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onGoHome={() => {
          setSelectedCategory('ALL');
          setSearchQuery('');
          setSelectedVacancy(null);
          setActivePolicyView(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        latestVacancies={vacancies}
        onSelectVacancy={handleSelectVacancy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat as any);
          setSelectedVacancy(null);
          setActivePolicyView(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
        onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
      />

      {/* Main Body Container - Clean Portal Structure */}
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 pb-8 flex-1 bg-white">
        <div className="w-full space-y-6">
            {activePolicyView === 'privacy' ? (
              <PrivacyPolicy
                lang={lang}
                onBack={() => setActivePolicyView(null)}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                isAdmin={isAdmin}
              />
            ) : activePolicyView === 'terms' ? (
              <TermsAndConditions lang={lang} onBack={() => setActivePolicyView(null)} />
            ) : activePolicyView === 'contact' ? (
              <ContactUs lang={lang} onBack={() => setActivePolicyView(null)} />
            ) : activePolicyView === 'about' ? (
              <AboutUs lang={lang} onBack={() => setActivePolicyView(null)} />
            ) : activePolicyView === 'disclaimer' ? (
              <Disclaimer lang={lang} onBack={() => setActivePolicyView(null)} />
            ) : activePolicyView === 'sitemap' ? (
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
            ) : selectedVacancy ? (
              /* Full Page View with Dynamic Head Meta Tags */
              <FullPagePostView
                vacancy={selectedVacancy}
                onBack={() => {
                  setSelectedVacancy(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                lang={lang}
                isSaved={savedIds.includes(selectedVacancy.id)}
                onToggleSave={handleToggleSave}
                allVacancies={vacancies}
                onSelectOtherVacancy={handleSelectVacancy}
                isAdmin={isAdmin}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                onEditVacancy={(item) => {
                  setEditingVacancy(item);
                  setIsAddJobOpen(true);
                }}
                onDeleteVacancy={handleDeleteVacancy}
                onUpdateVacancy={handleUpdateVacancy}
                isAlertSet={alertJobIds.includes(selectedVacancy.id)}
                onToggleAlertMe={handleToggleAlertMe}
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
            ) : selectedCategory !== 'ALL' ? (
              /* Category Archive View matching authentic rajasthanvacancy.com category layout */
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
                onEditVacancy={(item) => {
                  setEditingVacancy(item);
                  setIsAddJobOpen(true);
                }}
                onDeleteVacancy={handleDeleteVacancy}
              />
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
                  onEditVacancy={(item) => {
                    setEditingVacancy(item);
                    setIsAddJobOpen(true);
                  }}
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
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
        onSelectVacancy={handleSelectVacancy}
        isAdmin={isAdmin}
      />

      {/* Other Utility Modals */}

      <EligibilityFinderModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        vacancies={vacancies}
        lang={lang}
        onSelectVacancy={(item) => setSelectedVacancy(item)}
      />

      <SavedJobsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedIds={savedIds}
        vacancies={vacancies}
        lang={lang}
        onRemoveSave={handleToggleSave}
        onSelectVacancy={(item) => setSelectedVacancy(item)}
        onClearAll={() => {
          setSavedIds([]);
          showToast(lang === 'hi' ? 'सभी सुरक्षित सूचनाएं हटा दी गईं' : 'All saved notifications cleared');
        }}
      />



      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        lang={lang}
      />

      <SubscribeAlertsModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        lang={lang}
      />

      <UrlIndexationModal
        isOpen={isUrlIndexationOpen}
        onClose={() => setIsUrlIndexationOpen(false)}
        lang={lang}
        vacancies={vacancies}
        onSelectVacancy={(item) => {
          setSelectedVacancy(item);
          setIsUrlIndexationOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <FloatingSocialButtons 
        lang={lang} 
        whatsappUrl="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
        telegramUrl="https://t.me/newrajsthanjobs"
      />
      <OfflineIndicator lang={lang} />
    </div>
  );
}
