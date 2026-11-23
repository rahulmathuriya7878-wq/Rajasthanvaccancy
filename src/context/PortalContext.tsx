'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { CloudSyncResult } from '../services/vacancyCloudSync';
import { buildCanonicalUrl, applyCanonicalTag, getCanonicalOrigin } from '../utils/seoCanonical';
import { useDynamicBreadcrumbSchema } from '../hooks/useDynamicBreadcrumbSchema';
import { useDynamicJobSchema } from '../hooks/useDynamicJobSchema';
import { useDynamicFaqSchema } from '../hooks/useDynamicFaqSchema';
import { getSocialOgImageUrl } from '../utils/shareUtils';
import {
  AUTO_DELETE_MAX_AGE_DAYS,
  compareVacanciesNewestFirst,
  filterActivePostsWithinDays,
  isPostOlderThanDays,
} from '../utils/dateUtils';
import { INITIAL_VACANCIES } from '../data/mockVacancies';
import type { VacancyItem, CategoryType, JobStatusType, LanguageMode } from '../types';

export type PolicyViewType = 'privacy' | 'terms' | 'contact' | 'about' | 'disclaimer' | 'sitemap';

const STORAGE_KEY_VACANCIES = 'raj_vacancies_v32';
const STORAGE_KEY_ALERT_JOBS = 'raj_alert_job_ids_v1';

export function getPortalSectionTitle(cat: string, lang: LanguageMode = 'hi'): string {
  const isHi = lang === 'hi';
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
}

interface PortalContextType {
  lang: LanguageMode;
  vacancies: VacancyItem[];
  filteredVacancies: VacancyItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: CategoryType | 'ALL';
  setSelectedCategory: (cat: CategoryType | 'ALL') => void;
  selectedVacancy: VacancyItem | null;
  setSelectedVacancy: (v: VacancyItem | null) => void;
  activePolicyView: PolicyViewType | null;
  setActivePolicyView: (p: PolicyViewType | null) => void;
  alertJobIds: string[];
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  isUrlIndexationOpen: boolean;
  setIsUrlIndexationOpen: (open: boolean) => void;
  isAddVacancyOpen: boolean;
  setIsAddVacancyOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isInitialNotFound: boolean;
  handleGoHome: () => void;
  handleSelectVacancy: (item: VacancyItem) => void;
  handleSelectCategory: (cat: string) => void;
  handleSelectPolicy: (policy: PolicyViewType) => void;
  handleUpdateVacancy: (updatedJob: VacancyItem) => Promise<CloudSyncResult>;
  handleDeleteVacancy: (id: string) => Promise<void>;
  handleToggleAlertMe: (id: string) => void;
  hydrateInitialParams: (params: {
    vacancy?: string | null;
    category?: string | null;
    policy?: string | null;
    search?: string | null;
    openIndexation?: boolean;
  }) => void;
}

const PortalContext = createContext<PortalContextType | null>(null);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomeRoute = !pathname || pathname === '/';
  const [lang] = useState<LanguageMode>('hi');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [vacancies, setVacancies] = useState<VacancyItem[]>(() =>
    filterActivePostsWithinDays(INITIAL_VACANCIES, AUTO_DELETE_MAX_AGE_DAYS)
  );
  const [alertJobIds, setAlertJobIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [activePolicyView, setActivePolicyView] = useState<PolicyViewType | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUrlIndexationOpen, setIsUrlIndexationOpen] = useState(false);
  const [isAddVacancyOpen, setIsAddVacancyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialNotFound, setIsInitialNotFound] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const isUnresolvedInitialUrlRef = useRef<boolean>(false);
  const deletedIdsRef = useRef<string[]>(deletedIds);
  const vacanciesRef = useRef<VacancyItem[]>(vacancies);
  const selectedVacancyRef = useRef<VacancyItem | null>(selectedVacancy);
  const lastScrolledVacancyIdRef = useRef<string | null>(null);
  const prevStatusesRef = useRef<Record<string, JobStatusType>>({});

  useEffect(() => {
    deletedIdsRef.current = deletedIds;
  }, [deletedIds]);

  useEffect(() => {
    vacanciesRef.current = vacancies;
  }, [vacancies]);

  useEffect(() => {
    selectedVacancyRef.current = selectedVacancy;
  }, [selectedVacancy]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const mergeVacanciesWithCloud = useCallback(
    (
      baseList: VacancyItem[],
      overridesMap: Record<string, VacancyItem>,
      combinedDeletedIds: string[]
    ): VacancyItem[] => {
      const deletedSet = new Set([
        ...combinedDeletedIds,
        'ugc-net-2026-june',
        'bsf-si-ldce-recruitment-2026',
      ]);

      const mergedMap = new Map<string, VacancyItem>();

      baseList.forEach((item) => {
        if (!deletedSet.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });

      INITIAL_VACANCIES.forEach((initItem) => {
        if (!deletedSet.has(initItem.id) && !mergedMap.has(initItem.id)) {
          mergedMap.set(initItem.id, initItem);
        }
      });

      Object.entries(overridesMap).forEach(([id, cloudItem]) => {
        if (deletedSet.has(id)) {
          mergedMap.delete(id);
          return;
        }
        const existing = mergedMap.get(id);
        mergedMap.set(
          id,
          existing
            ? { ...existing, ...cloudItem, id }
            : { ...cloudItem, id }
        );
      });

      return filterActivePostsWithinDays(Array.from(mergedMap.values()), AUTO_DELETE_MAX_AGE_DAYS);
    },
    []
  );

  // Hydrate localStorage caches after mount (prevents Next.js SSR hydration mismatch)
  useEffect(() => {
    setHasMounted(true);

    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          ((key.startsWith('raj_vacancies_v') && key !== STORAGE_KEY_VACANCIES) ||
            key.startsWith('raj_saved_ids_v'))
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch {}

    let initialDeleted: string[] = [];
    try {
      const storedDel = localStorage.getItem('raj_deleted_vacancies');
      if (storedDel) {
        const parsedDel = JSON.parse(storedDel);
        if (Array.isArray(parsedDel)) {
          initialDeleted = parsedDel;
          setDeletedIds(parsedDel);
          deletedIdsRef.current = parsedDel;
        }
      }
    } catch {}

    try {
      const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERT_JOBS);
      if (storedAlerts) {
        const parsedAlerts = JSON.parse(storedAlerts);
        if (Array.isArray(parsedAlerts)) setAlertJobIds(parsedAlerts);
      }
    } catch {}

    try {
      let loaded = INITIAL_VACANCIES;
      const stored = localStorage.getItem(STORAGE_KEY_VACANCIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      }

      let filteredLoaded = filterActivePostsWithinDays(
        loaded.filter(
          (v) =>
            !initialDeleted.includes(v.id) &&
            v.id !== 'ugc-net-2026-june' &&
            v.id !== 'bsf-si-ldce-recruitment-2026'
        ),
        AUTO_DELETE_MAX_AGE_DAYS
      );

      INITIAL_VACANCIES.forEach((initItem) => {
        if (!initialDeleted.includes(initItem.id) && !isPostOlderThanDays(initItem, AUTO_DELETE_MAX_AGE_DAYS)) {
          if (!filteredLoaded.some((v) => v.id === initItem.id)) {
            filteredLoaded = [initItem, ...filteredLoaded];
          }
        }
      });

      const merged = filterActivePostsWithinDays(
        filteredLoaded.map((item) => {
          const initMatch = INITIAL_VACANCIES.find((init) => init.id === item.id);
          if (initMatch) {
            return {
              ...initMatch,
              ...item,
              officialLinks: initMatch.officialLinks || item.officialLinks,
              handwrittenNotes: item.handwrittenNotes || initMatch.handwrittenNotes,
              briefSummaryHi:
                item.briefSummaryHi && item.briefSummaryHi.length > 30
                  ? item.briefSummaryHi
                  : initMatch.briefSummaryHi,
              descriptionHi: initMatch.descriptionHi || item.descriptionHi,
            };
          }
          return item;
        }),
        AUTO_DELETE_MAX_AGE_DAYS
      );
      setVacancies(merged);
    } catch (e) {
      console.error('Failed to hydrate stored vacancies', e);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem('raj_deleted_vacancies', JSON.stringify(deletedIds));
    } catch {}
  }, [deletedIds, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_VACANCIES, JSON.stringify(vacancies));
        window.dispatchEvent(new Event('raj_vacancies_updated'));
      } catch {}
    }, 750);
    return () => window.clearTimeout(timer);
  }, [vacancies, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_ALERT_JOBS, JSON.stringify(alertJobIds));
    } catch {}
  }, [alertJobIds, hasMounted]);

  // Automatically purge any post older than 70 days
  useEffect(() => {
    const purgeExpiredPosts = () => {
      const nowMs = Date.now();
      setVacancies((prev) => {
        const expiredIds = prev
          .filter((v) => isPostOlderThanDays(v, AUTO_DELETE_MAX_AGE_DAYS, nowMs))
          .map((v) => v.id);
        if (expiredIds.length === 0) return prev;
        setAlertJobIds((prevAlerts) => prevAlerts.filter((id) => !expiredIds.includes(id)));
        return prev.filter((v) => !expiredIds.includes(v.id));
      });
    };

    purgeExpiredPosts();
    const intervalId = window.setInterval(purgeExpiredPosts, 30 * 60 * 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') purgeExpiredPosts();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Monitor job status updates from 'upcoming' to 'active' for alertJobIds
  useEffect(() => {
    vacancies.forEach((job) => {
      const prevStatus = prevStatusesRef.current[job.id];
      const newStatus = job.status;
      if (prevStatus && prevStatus !== 'active' && newStatus === 'active' && alertJobIds.includes(job.id)) {
        const jobTitle = lang === 'hi' ? job.titleHi || job.title : job.title;
        showToast(`🔥 ऑनलाइन आवेदन शुरू! ${jobTitle}`);
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🔥 ऑनलाइन आवेदन शुरू हो गए हैं!', {
            body: `${jobTitle}\nकुल पद: ${job.totalPosts || 'विभिन्न'}. अंतिम तिथि: ${job.importantDates?.applyLastDate || 'TBA'}`,
          });
        }
      }
      prevStatusesRef.current[job.id] = job.status;
    });
  }, [vacancies, alertJobIds, lang, showToast]);

  // Real-time Firestore listener for vacancy_overrides across all devices (client-only dynamic import for Cloudflare Workers SSR safety)
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const { subscribeVacancyOverrides } = await import('../services/vacancyCloudSync');
        if (!isMounted) return;

        unsubscribe = subscribeVacancyOverrides(
          ({ overrides, deletedIds: remoteDeleted }) => {
            if (!isMounted) return;
            if (remoteDeleted.length > 0) {
              setDeletedIds((prev) => {
                const combined = Array.from(new Set([...prev, ...remoteDeleted]));
                deletedIdsRef.current = combined;
                return combined.length === prev.length ? prev : combined;
              });
            }

            const combinedDeleted = Array.from(new Set([...deletedIdsRef.current, ...remoteDeleted]));
            const mergedSnapshot = mergeVacanciesWithCloud(vacanciesRef.current, overrides, combinedDeleted);
            vacanciesRef.current = mergedSnapshot;
            setVacancies(mergedSnapshot);

            const currentSelected = selectedVacancyRef.current;
            if (currentSelected) {
              if (combinedDeleted.includes(currentSelected.id)) {
                setSelectedVacancy(null);
              } else if (overrides[currentSelected.id]) {
                const updatedCurrent = overrides[currentSelected.id];
                setSelectedVacancy(updatedCurrent);
                try {
                  localStorage.setItem(`raj_offline_job_${updatedCurrent.id}`, JSON.stringify(updatedCurrent));
                } catch {}
              }
            } else if (isUnresolvedInitialUrlRef.current) {
              try {
                const params = new URLSearchParams(window.location.search);
                const cleanPath = window.location.pathname.replace(/^\/|\/+$/g, '');
                const vacancyParam =
                  params.get('vacancy') || (cleanPath && cleanPath !== '' && !cleanPath.includes('.') ? cleanPath : null);
                if (vacancyParam) {
                  const lowerParam = vacancyParam.toLowerCase();
                  const cloudMatch =
                    overrides[vacancyParam] ||
                    Object.values(overrides).find((v) => v.id?.toLowerCase() === lowerParam) ||
                    mergedSnapshot.find((v) => v.id.toLowerCase() === lowerParam);
                  if (cloudMatch && !combinedDeleted.includes(cloudMatch.id)) {
                    isUnresolvedInitialUrlRef.current = false;
                    setIsInitialNotFound(false);
                    setSelectedVacancy(cloudMatch);
                    setActivePolicyView(null);
                  }
                }
              } catch {}
            }
          },
          (err) => {
            console.warn('Firestore real-time vacancy override listener warning:', err);
          }
        );
      } catch (err) {
        console.warn('Failed to initialize Firestore listener:', err);
      }
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [mergeVacanciesWithCloud]);

  const hydrateInitialParams = useCallback(
    (params: {
      vacancy?: string | null;
      category?: string | null;
      policy?: string | null;
      search?: string | null;
      openIndexation?: boolean;
    }) => {
      if (params.openIndexation) {
        setIsUrlIndexationOpen(true);
      }

      if (params.search) {
        setSearchQuery(params.search);
      }

      const p = params.policy?.toLowerCase();
      if (p === 'privacy' || p === 'terms' || p === 'contact' || p === 'about' || p === 'disclaimer' || p === 'sitemap') {
        setActivePolicyView(p);
        setSelectedVacancy(null);
        setSelectedCategory('ALL');
        setIsInitialNotFound(false);
        return;
      }

      if (params.vacancy) {
        const vId = params.vacancy;
        const lower = vId.toLowerCase();
        let found =
          vacanciesRef.current.find((v) => v.id === vId || v.id.toLowerCase() === lower) ||
          INITIAL_VACANCIES.find((v) => v.id === vId || v.id.toLowerCase() === lower);
        if (!found && typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(`raj_offline_job_${vId}`);
            if (cached) found = JSON.parse(cached);
          } catch {}
        }
        if (found) {
          isUnresolvedInitialUrlRef.current = false;
          setIsInitialNotFound(false);
          setSelectedVacancy(found);
          setActivePolicyView(null);
        } else {
          isUnresolvedInitialUrlRef.current = true;
          setIsInitialNotFound(true);
        }
        return;
      }

      if (params.category && params.category !== 'ALL') {
        isUnresolvedInitialUrlRef.current = false;
        setIsInitialNotFound(false);
        const normalizedCat = params.category === 'ugc_net' || params.category === 'job' ? 'latest_job' : params.category;
        setSelectedCategory(normalizedCat as CategoryType);
        setActivePolicyView(null);
        setSelectedVacancy(null);
        return;
      }

      setSelectedVacancy(null);
      setSelectedCategory('ALL');
      setActivePolicyView(null);
      setIsInitialNotFound(false);
    },
    []
  );

  // Sync dynamic JSON-LD schemas
  useDynamicBreadcrumbSchema({
    lang,
    selectedCategory,
    selectedVacancy,
    activePolicyView,
  });

  useDynamicJobSchema({
    vacancy: selectedVacancy,
    lang,
    origin: getCanonicalOrigin(),
  });

  useDynamicFaqSchema({
    vacancy: selectedVacancy,
    lang,
  });

  // Update URL & <head> tags on client navigation (only on the main '/' portal route)
  useEffect(() => {
    if (!hasMounted || !isHomeRoute) return;
    try {
      const origin = getCanonicalOrigin();
      const url = new URL(window.location.href);
      const metaDescEl = document.querySelector('meta[name="description"]');
      const currentVacancyId = url.searchParams.get('vacancy');
      const isHi = lang === 'hi';

      if (selectedVacancy) {
        isUnresolvedInitialUrlRef.current = false;
        setIsInitialNotFound(false);
        if (currentVacancyId !== selectedVacancy.id || url.pathname !== '/' || url.searchParams.has('policy')) {
          url.pathname = '/';
          url.searchParams.set('vacancy', selectedVacancy.id);
          url.searchParams.delete('category');
          url.searchParams.delete('policy');
          window.history.replaceState({ vacancyId: selectedVacancy.id }, '', url.toString());
        }
        const titleText = `${isHi ? selectedVacancy.titleHi || selectedVacancy.title : selectedVacancy.title} - Rajasthan Vacancy 2026`;
        const descText =
          selectedVacancy.briefSummaryHi ||
          selectedVacancy.briefSummary ||
          selectedVacancy.descriptionHi ||
          selectedVacancy.title;
        const canonicalHref = buildCanonicalUrl({ vacancyId: selectedVacancy.id });
        const robotsEl = document.querySelector('meta[name="robots"]');
        if (robotsEl) {
          robotsEl.removeAttribute('data-ssr-status');
          robotsEl.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }
        document.title = titleText;
        if (metaDescEl) metaDescEl.setAttribute('content', descText);
        applyCanonicalTag(canonicalHref);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', titleText);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', descText);
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', titleText);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', descText);

        const socialOgImage = getSocialOgImageUrl(selectedVacancy);
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', socialOgImage);
        const twImg = document.querySelector('meta[name="twitter:image"]');
        if (twImg) twImg.setAttribute('content', socialOgImage);
      } else if (selectedCategory !== 'ALL') {
        if (currentVacancyId) {
          url.searchParams.delete('vacancy');
        }
        if (url.searchParams.get('category') !== selectedCategory || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.set('category', selectedCategory);
          url.searchParams.delete('policy');
          window.history.replaceState({ category: selectedCategory }, '', url.toString());
        }

        const catTitle = `${getPortalSectionTitle(selectedCategory, lang)} 2026 - Rajasthan Vacancy`;
        const catDesc = `सभी ${getPortalSectionTitle(selectedCategory, lang)} की नवीनतम सूची, ऑनलाइन आवेदन, महत्वपूर्ण तिथियां व आधिकारिक अधिसूचना पीडीएफ यहां देखें।`;
        document.title = catTitle;
        if (metaDescEl) metaDescEl.setAttribute('content', catDesc);
        applyCanonicalTag(buildCanonicalUrl({ category: selectedCategory }));
      } else if (activePolicyView) {
        if (url.searchParams.get('policy') !== activePolicyView || url.pathname !== '/') {
          url.pathname = '/';
          url.searchParams.delete('vacancy');
          url.searchParams.delete('category');
          url.searchParams.set('policy', activePolicyView);
          window.history.replaceState({ policy: activePolicyView }, '', url.toString());
        }
        applyCanonicalTag(`${origin}/?policy=${activePolicyView}`);
      } else {
        if (isUnresolvedInitialUrlRef.current) {
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
        document.title = 'Rajasthan Vacancy 2026 - Latest Govt Jobs, RPSC, RSMSSB & Sarkari Result Portal';
        applyCanonicalTag(buildCanonicalUrl({}));
      }
    } catch (e) {
      console.error('Error updating URL params and SEO titles', e);
    }
  }, [selectedVacancy, selectedCategory, activePolicyView, lang, hasMounted, isHomeRoute]);

  // Browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cleanPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const policyParam = params.get('policy');
      const categoryParam = params.get('category');
      const vacancyId = params.get('vacancy') || (cleanPath && cleanPath !== '' && !cleanPath.includes('.') ? cleanPath : null);
      if (vacancyId) {
        const lower = vacancyId.toLowerCase();
        const found =
          vacanciesRef.current.find((v) => v.id === vacancyId || v.id.toLowerCase() === lower) ||
          INITIAL_VACANCIES.find((v) => v.id === vacancyId || v.id.toLowerCase() === lower);
        setSelectedVacancy(found || null);
        setSelectedCategory('ALL');
        setActivePolicyView(null);
      } else if (categoryParam && categoryParam !== 'ALL') {
        setSelectedVacancy(null);
        setActivePolicyView(null);
        const normalizedCat = categoryParam === 'ugc_net' || categoryParam === 'job' ? 'latest_job' : categoryParam;
        setSelectedCategory(normalizedCat as CategoryType);
      } else if (
        policyParam === 'privacy' ||
        policyParam === 'terms' ||
        policyParam === 'contact' ||
        policyParam === 'about' ||
        policyParam === 'disclaimer' ||
        policyParam === 'sitemap'
      ) {
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
  }, []);

  // Scroll to top once when navigating to a different post (never on background Firestore updates)
  const selectedVacancyId = selectedVacancy?.id ?? null;
  useEffect(() => {
    if (selectedVacancyId && lastScrolledVacancyIdRef.current !== selectedVacancyId) {
      lastScrolledVacancyIdRef.current = selectedVacancyId;
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (!selectedVacancyId) {
      lastScrolledVacancyIdRef.current = null;
    }
  }, [selectedVacancyId]);

  // Cache viewed vacancy for offline reading
  useEffect(() => {
    if (selectedVacancy && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`raj_offline_job_${selectedVacancy.id}`, JSON.stringify(selectedVacancy));
      } catch {}
    }
  }, [selectedVacancy]);

  const handleGoHome = useCallback(() => {
    isUnresolvedInitialUrlRef.current = false;
    setIsInitialNotFound(false);
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedVacancy(null);
    setActivePolicyView(null);
    if (!isHomeRoute) {
      router.push('/');
      return;
    }
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/' || window.location.search !== '') {
        window.history.pushState({ vacancyId: null, category: null, policy: null }, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isHomeRoute, router]);

  const handleSelectVacancy = useCallback((item: VacancyItem) => {
    isUnresolvedInitialUrlRef.current = false;
    setIsInitialNotFound(false);
    setVacancies((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, clicksCount: (v.clicksCount || 0) + 1 } : v))
    );
    setActivePolicyView(null);
    setSelectedCategory('ALL');
    setSelectedVacancy(item);
    const nextSearch = `?vacancy=${encodeURIComponent(item.id)}`;
    if (!isHomeRoute) {
      router.push(`/${nextSearch}`);
      return;
    }
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/' || window.location.search !== nextSearch) {
        window.history.pushState({ vacancyId: item.id }, '', `/${nextSearch}`);
      }
    }
  }, [isHomeRoute, router]);

  const handleSelectCategory = useCallback((cat: string) => {
    isUnresolvedInitialUrlRef.current = false;
    setIsInitialNotFound(false);
    const normalizedCat = cat === 'ugc_net' || cat === 'job' ? 'latest_job' : cat;
    setSelectedCategory(normalizedCat as CategoryType | 'ALL');
    setSelectedVacancy(null);
    setActivePolicyView(null);
    const nextUrl = normalizedCat === 'ALL' ? '/' : `/?category=${encodeURIComponent(normalizedCat)}`;
    if (!isHomeRoute) {
      router.push(nextUrl);
      return;
    }
    if (typeof window !== 'undefined') {
      if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
        window.history.pushState({ category: normalizedCat }, '', nextUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isHomeRoute, router]);

  const handleSelectPolicy = useCallback((policy: PolicyViewType) => {
    isUnresolvedInitialUrlRef.current = false;
    setIsInitialNotFound(false);
    setActivePolicyView(policy);
    setSelectedVacancy(null);
    setSelectedCategory('ALL');
    const nextUrl = `/?policy=${encodeURIComponent(policy)}`;
    if (!isHomeRoute) {
      router.push(nextUrl);
      return;
    }
    if (typeof window !== 'undefined') {
      if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
        window.history.pushState({ policy }, '', nextUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isHomeRoute, router]);

  const handleToggleAlertMe = useCallback(
    (id: string) => {
      const targetJob = vacancies.find((v) => v.id === id);
      const isCurrentlySet = alertJobIds.includes(id);

      if (isCurrentlySet) {
        setAlertJobIds((prev) => prev.filter((i) => i !== id));
        showToast(lang === 'hi' ? 'जॉब अलर्ट हटा दिया गया' : 'Job alert removed');
      } else {
        setAlertJobIds((prev) => [...prev, id]);
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
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
    },
    [vacancies, alertJobIds, lang, showToast]
  );

  const handleUpdateVacancy = useCallback(
    async (updatedJob: VacancyItem): Promise<CloudSyncResult> => {
      setDeletedIds((prev) => {
        if (!prev.includes(updatedJob.id)) return prev;
        const next = prev.filter((id) => id !== updatedJob.id);
        deletedIdsRef.current = next;
        return next;
      });
      setVacancies((prev) => {
        const exists = prev.some((v) => v.id === updatedJob.id);
        return exists ? prev.map((v) => (v.id === updatedJob.id ? updatedJob : v)) : [updatedJob, ...prev];
      });
      setSelectedVacancy(updatedJob);
      try {
        localStorage.setItem(`raj_offline_job_${updatedJob.id}`, JSON.stringify(updatedJob));
      } catch {}

      const { saveVacancyOverrideToCloud } = await import('../services/vacancyCloudSync');
      const cloudResult = await saveVacancyOverrideToCloud(updatedJob);
      if (cloudResult.synced) {
        showToast(lang === 'hi' ? '☁️ पोस्ट अपडेट सभी फोन पर लाइव सेव हो गया!' : 'Post synced live across all phones!');
      } else if (cloudResult.reason === 'auth_required') {
        showToast(
          lang === 'hi'
            ? '⚠️ केवल इसी फोन में सेव हुआ — सभी फोन पर दिखाने के लिए Google एडमिन लॉगिन करें।'
            : 'Saved locally only — sign in with Google Admin to sync across phones.'
        );
      } else {
        showToast(cloudResult.message || (lang === 'hi' ? 'पोस्ट विवरण स्थानीय रूप से अपडेट हुआ!' : 'Post details updated locally!'));
      }

      fetch('/api/seo/auto-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [`${getCanonicalOrigin()}/?vacancy=${encodeURIComponent(updatedJob.id)}`] }),
      }).catch(() => {});

      return cloudResult;
    },
    [lang, showToast]
  );

  const handleDeleteVacancy = useCallback(
    async (id: string) => {
      const targetJob = vacancies.find((v) => v.id === id);
      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setVacancies((prev) => prev.filter((v) => v.id !== id));
      setSelectedVacancy(null);

      const { markVacancyDeletedInCloud } = await import('../services/vacancyCloudSync');
      const cloudResult = await markVacancyDeletedInCloud(id, targetJob);
      if (cloudResult.synced) {
        showToast(lang === 'hi' ? '🗑️ पोस्ट सभी फोन से सफलतापूर्वक डिलीट कर दी गई!' : '🗑️ Post deleted across all devices!');
      } else {
        showToast(lang === 'hi' ? '🗑️ पोस्ट इस डिवाइस से डिलीट कर दी गई!' : '🗑️ Post deleted locally!');
      }
    },
    [vacancies, lang, showToast]
  );

  const filteredVacancies = useMemo(() => {
    return vacancies
      .filter((item) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const inTitle = item.title.toLowerCase().includes(query);
          const inTitleHi = item.titleHi.toLowerCase().includes(query);
          const inDept = item.department.toLowerCase().includes(query);
          const inAdvt = item.advtNo.toLowerCase().includes(query);
          const inPost = item.postName.toLowerCase().includes(query);
          const inTags = item.tags.some((t) => t.toLowerCase().includes(query));
          if (!inTitle && !inTitleHi && !inDept && !inAdvt && !inPost && !inTags) {
            return false;
          }
        }

        if (selectedCategory !== 'ALL') {
          if (item.category === selectedCategory) {
            // match
          } else if (
            selectedCategory === 'admit_card' &&
            (item.category === 'admit_card' ||
              item.status === 'admit_card_out' ||
              item.title.toLowerCase().includes('admit card') ||
              item.titleHi?.includes('प्रवेश पत्र'))
          ) {
            // match
          } else if (
            selectedCategory === 'result' &&
            (item.category === 'result' ||
              item.status === 'result_declared' ||
              item.title.toLowerCase().includes('result') ||
              item.titleHi?.includes('रिजल्ट') ||
              item.titleHi?.includes('परिणाम'))
          ) {
            // match
          } else if (
            selectedCategory === 'scheme' &&
            (item.category === 'scheme' || item.organization === 'Sarkari Yojana' || item.titleHi?.includes('योजना'))
          ) {
            // match
          } else if (
            selectedCategory === 'exam_date' &&
            (item.category === 'exam_date' ||
              item.title.toLowerCase().includes('exam date') ||
              item.titleHi?.includes('परीक्षा तिथि'))
          ) {
            // match
          } else if (
            selectedCategory === 'news' &&
            (item.category === 'news' ||
              item.title.toLowerCase().includes('news') ||
              item.tags?.includes('news') ||
              item.title.toLowerCase().includes('chunav') ||
              item.titleHi?.includes('न्यूज़') ||
              item.titleHi?.includes('चुनाव'))
          ) {
            // match
          } else if (
            selectedCategory === 'answer_key' &&
            (item.category === 'answer_key' ||
              item.status === 'answer_key_out' ||
              item.title.toLowerCase().includes('answer key') ||
              item.titleHi?.includes('उत्तर कुंजी'))
          ) {
            // match
          } else if (
            selectedCategory === 'syllabus' &&
            (item.category === 'syllabus' ||
              item.title.toLowerCase().includes('syllabus') ||
              item.titleHi?.includes('पाठ्यक्रम') ||
              item.titleHi?.includes('सिलेबस'))
          ) {
            // match
          } else if (
            selectedCategory === 'latest_job' &&
            (item.category === 'latest_job' || item.category === 'ugc_net')
          ) {
            // match
          } else {
            return false;
          }
        }
        return true;
      })
      .sort(compareVacanciesNewestFirst);
  }, [vacancies, searchQuery, selectedCategory]);

  return (
    <PortalContext.Provider
      value={{
        lang,
        vacancies,
        filteredVacancies,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedVacancy,
        setSelectedVacancy,
        activePolicyView,
        setActivePolicyView,
        alertJobIds,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        isUrlIndexationOpen,
        setIsUrlIndexationOpen,
        isAddVacancyOpen,
        setIsAddVacancyOpen,
        toastMessage,
        showToast,
        isInitialNotFound,
        handleGoHome,
        handleSelectVacancy,
        handleSelectCategory,
        handleSelectPolicy,
        handleUpdateVacancy,
        handleDeleteVacancy,
        handleToggleAlertMe,
        hydrateInitialParams,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return ctx;
}

export function useOptionalPortal() {
  return useContext(PortalContext);
}
