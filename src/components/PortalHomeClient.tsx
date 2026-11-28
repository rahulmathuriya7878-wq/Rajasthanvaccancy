'use client';

import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPortalSectionTitle, usePortal, type PolicyViewType } from '../context/PortalContext';
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
}) => {
  const { isAdmin } = useAuth();
  const {
    lang,
    vacancies,
    filteredVacancies,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedVacancy,
    activePolicyView,
    isLoading,
    setIsAdminLoginOpen,
    handleGoHome,
    handleSelectVacancy,
    handleSelectCategory,
    handleSelectPolicy,
    handleUpdateVacancy,
    handleDeleteVacancy,
    hydrateInitialParams,
  } = usePortal();

  const hydratedKeyRef = useRef<string | null>(null);
  const routeKey = `${initialVacancyId || ''}|${initialCategory || ''}|${initialPolicy || ''}|${initialSearch || ''}`;

  useEffect(() => {
    if (hydratedKeyRef.current === routeKey) return;
    hydratedKeyRef.current = routeKey;
    hydrateInitialParams({
      vacancy: initialVacancyId,
      category: initialCategory,
      policy: initialPolicy,
      search: initialSearch,
    });
  }, [
    routeKey,
    initialVacancyId,
    initialCategory,
    initialPolicy,
    initialSearch,
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
            isLoading={isLoading}
          />
        </Suspense>
      ) : (
        <div className="space-y-4">
          <div className="pt-1 pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rajasthan Vacancy 2026
            </h1>
          </div>
          <FastUpdatesGrid
            vacancies={filteredVacancies}
            lang={lang}
            onSelectVacancy={handleSelectVacancy}
            onFilterCategory={(cat) => handleSelectCategory(cat)}
            isAdmin={isAdmin}
            onDeleteVacancy={handleDeleteVacancy}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default PortalHomeClient;
