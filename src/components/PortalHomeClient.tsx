'use client';

import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPortalSectionTitle, usePortal, type PolicyViewType } from '../context/PortalContext';
import { useOptionalNotifications } from '../context/NotificationContext';
import { INITIAL_VACANCIES } from '../data/mockVacancies';
import { FastUpdatesGrid } from './FastUpdatesGrid';

const FullPagePostView = lazy(() =>
  import('./FullPagePostView').then((m) => ({ default: m.FullPagePostView }))
);
const CategoryArchiveView = lazy(() =>
  import('./CategoryArchiveView').then((m) => ({ default: m.CategoryArchiveView }))
);
const PrivacyPolicy = lazy(() =>
  import('./PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsAndConditions = lazy(() =>
  import('./TermsAndConditions').then((m) => ({ default: m.TermsAndConditions }))
);
const ContactUs = lazy(() =>
  import('./ContactUs').then((m) => ({ default: m.ContactUs }))
);
const AboutUs = lazy(() =>
  import('./AboutUs').then((m) => ({ default: m.AboutUs }))
);
const Disclaimer = lazy(() =>
  import('./Disclaimer').then((m) => ({ default: m.Disclaimer }))
);
const SitemapPage = lazy(() =>
  import('./SitemapPage').then((m) => ({ default: m.SitemapPage }))
);

interface PortalHomeClientProps {
  initialVacancyId?: string | null;
  initialCategory?: string | null;
  initialPolicy?: string | null;
  initialSearch?: string | null;
  initialOpenIndexation?: boolean;
}

const VALID_POLICIES: readonly PolicyViewType[] = [
  'privacy',
  'terms',
  'contact',
  'about',
  'disclaimer',
  'sitemap',
];

export const PortalHomeClient: React.FC<PortalHomeClientProps> = ({
  initialVacancyId = null,
  initialCategory = null,
  initialPolicy = null,
  initialSearch = null,
  initialOpenIndexation = false,
}) => {
  const { isAdmin } = useAuth();
  const notif = useOptionalNotifications();
  const {
    lang,
    vacancies,
    filteredVacancies,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedVacancy,
    activePolicyView,
    alertJobIds,
    setIsAdminLoginOpen,
    setIsUrlIndexationOpen,
    handleGoHome,
    handleSelectVacancy,
    handleSelectCategory,
    handleSelectPolicy,
    handleUpdateVacancy,
    handleDeleteVacancy,
    handleToggleAlertMe,
    hydrateInitialParams,
  } = usePortal();

  const hydratedKeyRef = useRef<string | null>(null);
  const routeKey = `${initialVacancyId || ''}|${initialCategory || ''}|${initialPolicy || ''}|${initialSearch || ''}|${initialOpenIndexation ? '1' : '0'}`;

  useEffect(() => {
    if (hydratedKeyRef.current === routeKey) return;
    hydratedKeyRef.current = routeKey;
    hydrateInitialParams({
      vacancy: initialVacancyId,
      category: initialCategory,
      policy: initialPolicy,
      search: initialSearch,
      openIndexation: initialOpenIndexation,
    });
  }, [
    routeKey,
    initialVacancyId,
    initialCategory,
    initialPolicy,
    initialSearch,
    initialOpenIndexation,
    hydrateInitialParams,
  ]);

  // Resolve initial SSR view synchronously before the post-mount effect hydrates context
  const hasHydrated = hydratedKeyRef.current === routeKey;

  const initialResolvedPolicy = useMemo<PolicyViewType | null>(() => {
    const p = initialPolicy?.toLowerCase();
    if (p && (VALID_POLICIES as readonly string[]).includes(p)) {
      return p as PolicyViewType;
    }
    return null;
  }, [initialPolicy]);

  const initialResolvedVacancy = useMemo(() => {
    if (!initialVacancyId) return null;
    const lower = initialVacancyId.toLowerCase();
    return (
      vacancies.find((v) => v.id === initialVacancyId || v.id.toLowerCase() === lower) ||
      INITIAL_VACANCIES.find((v) => v.id === initialVacancyId || v.id.toLowerCase() === lower) ||
      null
    );
  }, [initialVacancyId, vacancies]);

  const initialResolvedCategory = useMemo(() => {
    if (!initialCategory || initialCategory.toUpperCase() === 'ALL') return 'ALL';
    return initialCategory === 'ugc_net' || initialCategory === 'job' ? 'latest_job' : initialCategory;
  }, [initialCategory]);

  const effectivePolicy = hasHydrated ? activePolicyView : (activePolicyView ?? initialResolvedPolicy);
  const effectiveVacancy = hasHydrated ? selectedVacancy : (selectedVacancy ?? initialResolvedVacancy);
  const effectiveCategory = hasHydrated
    ? selectedCategory
    : (selectedCategory !== 'ALL' ? selectedCategory : initialResolvedCategory);

  return (
    <div className="w-full space-y-6">
      {effectivePolicy === 'privacy' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <PrivacyPolicy
            lang={lang}
            onBack={handleGoHome}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        </Suspense>
      ) : effectivePolicy === 'terms' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <TermsAndConditions lang={lang} onBack={handleGoHome} />
        </Suspense>
      ) : effectivePolicy === 'contact' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <ContactUs lang={lang} onBack={handleGoHome} />
        </Suspense>
      ) : effectivePolicy === 'about' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <AboutUs lang={lang} onBack={handleGoHome} />
        </Suspense>
      ) : effectivePolicy === 'disclaimer' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <Disclaimer lang={lang} onBack={handleGoHome} />
        </Suspense>
      ) : effectivePolicy === 'sitemap' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">लोड हो रहा है...</div>}>
          <SitemapPage
            lang={lang}
            vacancies={vacancies}
            onBack={handleGoHome}
            onSelectVacancy={handleSelectVacancy}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
            onSelectPolicy={(policy) => handleSelectPolicy(policy)}
            isAdmin={isAdmin}
          />
        </Suspense>
      ) : effectiveVacancy ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">पोस्ट विवरण लोड हो रहा है...</div>}>
          <FullPagePostView
            vacancy={effectiveVacancy}
            onBack={handleGoHome}
            lang={lang}
            allVacancies={vacancies}
            onSelectOtherVacancy={handleSelectVacancy}
            isAdmin={isAdmin}
            onDeleteVacancy={handleDeleteVacancy}
            onUpdateVacancy={handleUpdateVacancy}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
            onSearchKeyword={(keyword) => {
              handleGoHome();
              setSearchQuery(keyword.replace(/^#/, ''));
            }}
          />
        </Suspense>
      ) : effectiveCategory !== 'ALL' ? (
        <Suspense fallback={<div className="py-12 text-center text-slate-600 text-sm">श्रेणी सूची लोड हो रही है...</div>}>
          <CategoryArchiveView
            categoryKey={effectiveCategory}
            categoryTitle={getPortalSectionTitle(effectiveCategory, lang)}
            categoryTitleHi={getPortalSectionTitle(effectiveCategory, lang)}
            vacancies={filteredVacancies}
            allVacancies={vacancies}
            lang={lang}
            onSelectVacancy={handleSelectVacancy}
            onClearCategory={handleGoHome}
            onSelectCategory={(catKey) => handleSelectCategory(catKey)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isAdmin={isAdmin}
            onDeleteVacancy={handleDeleteVacancy}
          />
        </Suspense>
      ) : (
        <div className="space-y-4">
          <div className="pt-1 pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rajasthan Vacancy 2026
            </h1>
            {notif && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    notif.openSaveSearchBuilder({
                      keywords: searchQuery.trim() ? [searchQuery.trim()] : [],
                      categories: ['latest_job'],
                    })
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:border-[#15803d] hover:text-[#15803d] text-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BellRing className="w-3.5 h-3.5 text-[#15803d] shrink-0" aria-hidden="true" />
                  <span>
                    {searchQuery.trim()
                      ? lang === 'hi'
                        ? `"${searchQuery.trim()}" के लिए अलर्ट सेव करें`
                        : `Save Alert for "${searchQuery.trim()}"`
                      : notif.savedAlerts.filter((a) => a.enabled).length > 0
                        ? lang === 'hi'
                          ? `मेरे जॉब अलर्ट (${notif.savedAlerts.filter((a) => a.enabled).length} सक्रिय)`
                          : `My Job Alerts (${notif.savedAlerts.filter((a) => a.enabled).length} active)`
                        : lang === 'hi'
                          ? 'कस्टम जॉब अलर्ट बनाएं'
                          : 'Create Custom Job Alert'}
                  </span>
                </button>
              </div>
            )}
          </div>
          <FastUpdatesGrid
            vacancies={filteredVacancies}
            lang={lang}
            onSelectVacancy={handleSelectVacancy}
            onFilterCategory={(cat) => handleSelectCategory(cat)}
            isAdmin={isAdmin}
            onDeleteVacancy={handleDeleteVacancy}
            alertJobIds={alertJobIds}
            onToggleAlertMe={handleToggleAlertMe}
            onOpenUrlIndexation={() => setIsUrlIndexationOpen(true)}
          />
        </div>
      )}
    </div>
  );
};

export default PortalHomeClient;
