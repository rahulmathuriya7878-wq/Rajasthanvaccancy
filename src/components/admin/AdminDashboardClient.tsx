'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Clock,
  AlertTriangle,
  Database,
  RefreshCw,
  Pencil,
  Trash2,
  ExternalLink,
  Send,
  FilePlus2,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePortal } from '@/context/PortalContext';
import {
  auditVacancySeo,
  getDaysUntilLastDate,
  isExpiringWithinDays,
} from '@/utils/adminPostUtils';
import { compareVacanciesNewestFirst } from '@/utils/dateUtils';
import type { CategoryType, JobStatusType, VacancyItem } from '@/types';

const CATEGORY_TABS: { key: 'ALL' | CategoryType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'latest_job', label: 'Latest Jobs' },
  { key: 'admit_card', label: 'Admit Card' },
  { key: 'result', label: 'Result' },
  { key: 'exam_date', label: 'Exam Date' },
  { key: 'news', label: 'News' },
  { key: 'scheme', label: 'Yojana' },
];

const STATUS_SELECT_OPTIONS: { value: JobStatusType; label: string }[] = [
  { value: 'active', label: 'Published' },
  { value: 'upcoming', label: 'Draft / Upcoming' },
  { value: 'admit_card_out', label: 'Admit Card Out' },
  { value: 'result_declared', label: 'Result Declared' },
  { value: 'answer_key_out', label: 'Answer Key Out' },
  { value: 'closed', label: 'Expired' },
];

function getCategoryLabel(cat: CategoryType): string {
  switch (cat) {
    case 'latest_job':
      return 'Latest Jobs';
    case 'admit_card':
      return 'Admit Card';
    case 'result':
      return 'Result';
    case 'exam_date':
      return 'Exam Date';
    case 'news':
      return 'News';
    case 'scheme':
      return 'Yojana';
    case 'answer_key':
      return 'Answer Key';
    case 'syllabus':
      return 'Syllabus';
    default:
      return cat;
  }
}

export const AdminDashboardClient: React.FC = () => {
  const searchParams = useSearchParams();
  const initialFilterParam = searchParams.get('filter');
  const { getAdminAuthHeaders } = useAuth();
  const { vacancies, handleUpdateVacancy, handleDeleteVacancy, showToast } = usePortal();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | CategoryType>('ALL');
  const [smartFilter, setSmartFilter] = useState<'none' | 'expiring' | 'seo'>(
    initialFilterParam === 'expiring'
      ? 'expiring'
      : initialFilterParam === 'seo'
        ? 'seo'
        : 'none'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmSingleDeleteId, setConfirmSingleDeleteId] = useState<string | null>(null);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [indexingRowId, setIndexingRowId] = useState<string | null>(null);
  const [revalidating, setRevalidating] = useState(false);
  const [lastIndexFeedback, setLastIndexFeedback] = useState<{
    slug: string;
    message: string;
    gscInspectUrl?: string;
  } | null>(null);

  const sortedVacancies = useMemo(
    () => [...vacancies].sort(compareVacanciesNewestFirst),
    [vacancies]
  );

  // Dashboard Widget Computations
  const expiringPosts = useMemo(
    () => sortedVacancies.filter((v) => isExpiringWithinDays(v, 3)),
    [sortedVacancies]
  );

  const seoIncompletePosts = useMemo(
    () =>
      sortedVacancies.filter((v) => {
        const audit = auditVacancySeo(v);
        return audit.missingMetaDescription || audit.missingLinks || audit.isDraftOrUpcoming;
      }),
    [sortedVacancies]
  );

  const activeCount = useMemo(
    () => sortedVacancies.filter((v) => v.status === 'active').length,
    [sortedVacancies]
  );

  // Filtered Table Rows
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedVacancies.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (smartFilter === 'expiring' && !isExpiringWithinDays(item, 3)) {
        return false;
      }
      if (smartFilter === 'seo') {
        const audit = auditVacancySeo(item);
        if (!audit.missingMetaDescription && !audit.missingLinks && !audit.isDraftOrUpcoming) {
          return false;
        }
      }
      if (q) {
        const hay = `${item.title} ${item.titleHi} ${item.id} ${item.department} ${item.advtNo}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sortedVacancies, categoryFilter, smartFilter, query]);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleRows.map((r) => r.id));
    }
    setConfirmBulkDelete(false);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setConfirmBulkDelete(false);
  };

  const triggerRevalidate = async (slug?: string) => {
    try {
      const headers = await getAdminAuthHeaders();
      await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug }),
      });
    } catch {}
  };

  const handleManualRevalidate = async () => {
    setRevalidating(true);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      if (res.ok) {
        showToast('Site cache revalidated across homepage, sitemap, and RSS.');
      } else {
        showToast('Sign in with verified Google Admin to run server revalidation.');
      }
    } catch {
      showToast('Revalidation request failed.');
    } finally {
      setRevalidating(false);
    }
  };

  const handleQuickStatusChange = async (item: VacancyItem, nextStatus: JobStatusType) => {
    setBusyRowId(item.id);
    try {
      const updated: VacancyItem = {
        ...item,
        status: nextStatus,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      await handleUpdateVacancy(updated);
      await triggerRevalidate(item.id);
    } finally {
      setBusyRowId(null);
    }
  };

  const handleIndexSinglePost = async (item: VacancyItem) => {
    setIndexingRowId(item.id);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/index-url', {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug: item.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setLastIndexFeedback({
          slug: item.id,
          message: `Indexing submitted for /?vacancy=${item.id}`,
          gscInspectUrl: data.gscInspectUrl,
        });
        showToast('Indexing notification dispatched.');
      } else {
        showToast(data.error || 'Google Admin sign-in required for protected indexing API.');
      }
    } catch {
      showToast('Indexing request failed.');
    } finally {
      setIndexingRowId(null);
    }
  };

  const handleBulkDeleteExecute = async () => {
    const idsToDelete = [...selectedIds];
    setConfirmBulkDelete(false);
    setSelectedIds([]);
    for (const id of idsToDelete) {
      await handleDeleteVacancy(id);
    }
    await triggerRevalidate();
  };

  const handleSingleDeleteExecute = async (id: string) => {
    setConfirmSingleDeleteId(null);
    await handleDeleteVacancy(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    await triggerRevalidate();
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Recruitment Publishing Dashboard
          </h1>
          <p className="text-sm text-neutral-600 mt-0.5">
            Manage live Firebase vacancies, deadlines, SEO readiness, and instant search indexing.
          </p>
        </div>
        <button
          type="button"
          disabled={revalidating}
          onClick={handleManualRevalidate}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-60 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{revalidating ? 'Revalidating...' : 'Revalidate Cache'}</span>
        </button>
      </div>

      {/* 3 Dashboard Quick Widgets (Single-Elevation Hairline Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Expiring Soon Alert (Next 3 Days) */}
        <button
          type="button"
          onClick={() => setSmartFilter((prev) => (prev === 'expiring' ? 'none' : 'expiring'))}
          className={`text-left bg-white rounded-xl border p-5 transition-colors cursor-pointer ${
            smartFilter === 'expiring'
              ? 'border-amber-600 ring-1 ring-amber-600/20'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Expiring Soon (Next 3 Days)</span>
            <Clock className="w-4 h-4 text-amber-700" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {expiringPosts.length}
            </span>
            <span className="text-xs font-medium text-amber-700">
              {smartFilter === 'expiring' ? 'Filter Active' : 'Filter Queue'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 truncate">
            {expiringPosts.length > 0
              ? expiringPosts[0].titleHi || expiringPosts[0].title
              : 'No active vacancies closing within 3 days'}
          </p>
        </button>

        {/* Widget 2: Drafts & Incomplete SEO */}
        <button
          type="button"
          onClick={() => setSmartFilter((prev) => (prev === 'seo' ? 'none' : 'seo'))}
          className={`text-left bg-white rounded-xl border p-5 transition-colors cursor-pointer ${
            smartFilter === 'seo'
              ? 'border-red-600 ring-1 ring-red-600/20'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Drafts &amp; Incomplete SEO</span>
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {seoIncompletePosts.length}
            </span>
            <span className="text-xs font-medium text-red-700">
              {smartFilter === 'seo' ? 'Filter Active' : 'Review Missing Meta/Links'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 truncate">
            Posts missing meta description, official links, or marked draft
          </p>
        </button>

        {/* Widget 3: Live Inventory */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Published Portal Inventory</span>
            <Database className="w-4 h-4 text-[#15803d]" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {sortedVacancies.length}
            </span>
            <span className="text-xs font-mono tabular-nums text-[#15803d] font-semibold">
              {activeCount} Active
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">
            Synced live with Firestore · Real-time across devices
          </p>
        </div>
      </div>

      {/* Instant Indexing Feedback Strip */}
      {lastIndexFeedback && (
        <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-medium">
            <Check className="w-4 h-4 text-[#15803d] shrink-0" />
            <span>{lastIndexFeedback.message}</span>
          </div>
          <div className="flex items-center gap-3">
            {lastIndexFeedback.gscInspectUrl && (
              <a
                href={lastIndexFeedback.gscInspectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#15803d] hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Open in Search Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setLastIndexFeedback(null)}
              aria-label="Dismiss indexing notification"
              className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main DataTable Container */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {/* Toolbar: Search, Category Filter Tabs, Bulk Actions */}
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, slug, department, advt no..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {smartFilter !== 'none' && (
                <button
                  type="button"
                  onClick={() => setSmartFilter('none')}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {smartFilter === 'expiring' ? 'Showing: Expiring ≤ 3d' : 'Showing: Incomplete SEO'}
                  </span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tabular-nums text-neutral-600">
                    {selectedIds.length} selected
                  </span>
                  {confirmBulkDelete ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleBulkDeleteExecute()}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Confirm Delete ({selectedIds.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmBulkDelete(false)}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmBulkDelete(true)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bulk Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Segmented Category Filter Bar */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg overflow-x-auto">
            {CATEGORY_TABS.map((tab) => {
              const active = categoryFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive High-Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600">
                <th className="py-3 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all visible posts"
                    className="w-4 h-4 accent-[#15803d] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Vacancy / Post</th>
                <th className="py-3 px-3 whitespace-nowrap">Last Date</th>
                <th className="py-3 px-3 whitespace-nowrap">Quick Status</th>
                <th className="py-3 px-3 whitespace-nowrap">SEO Check</th>
                <th className="py-3 pl-3 pr-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <p className="text-sm font-medium text-neutral-700">
                      No matching posts found.
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try clearing search filters or publish a new recruitment post.
                    </p>
                    <Link
                      href="/admin/posts/new"
                      className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold no-underline"
                    >
                      <FilePlus2 className="w-3.5 h-3.5" />
                      <span>Create First Post</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                visibleRows.map((item) => {
                  const daysLeft = getDaysUntilLastDate(item);
                  const expiringSoon = isExpiringWithinDays(item, 3);
                  const seoAudit = auditVacancySeo(item);
                  const isBusy = busyRowId === item.id;
                  const isIndexing = indexingRowId === item.id;
                  const lastDateLabel =
                    item.importantDates?.applyLastDate ||
                    item.yojanaOverview?.applyLastDate ||
                    '—';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 pl-4 pr-2 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectRow(item.id)}
                          aria-label={`Select ${item.title}`}
                          className="w-4 h-4 accent-[#15803d] cursor-pointer"
                        />
                      </td>

                      {/* Post Title + Clean Unboxed Metadata */}
                      <td className="py-3 px-3 max-w-md">
                        <div className="font-semibold text-neutral-900 leading-snug line-clamp-1">
                          {item.titleHi || item.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                          <span>{getCategoryLabel(item.category)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[180px]">{item.department || item.organization}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] truncate max-w-[180px]">{item.id}</span>
                        </div>
                      </td>

                      {/* Last Date with Tabular Numerals */}
                      <td className="py-3 px-3 whitespace-nowrap align-middle">
                        <div className="font-mono tabular-nums text-xs text-neutral-800">
                          {lastDateLabel}
                        </div>
                        {expiringSoon && daysLeft !== null && (
                          <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                            {daysLeft === 0 ? 'Closes today' : `${daysLeft}d left`}
                          </div>
                        )}
                      </td>

                      {/* Inline Quick Status Toggle */}
                      <td className="py-3 px-3 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`Status for ${item.title}`}
                            disabled={isBusy}
                            value={item.status}
                            onChange={(e) =>
                              void handleQuickStatusChange(item, e.target.value as JobStatusType)
                            }
                            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#15803d] ${
                              item.status === 'active'
                                ? 'border-emerald-300 text-[#15803d]'
                                : item.status === 'closed'
                                  ? 'border-red-200 text-red-700'
                                  : 'border-neutral-300 text-neutral-800'
                            }`}
                          >
                            {STATUS_SELECT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />}
                        </div>
                      </td>

                      {/* Unboxed SEO Readiness */}
                      <td className="py-3 px-3 whitespace-nowrap align-middle text-xs">
                        {seoAudit.reasons.length === 0 ? (
                          <span className="font-medium text-[#15803d]">Ready</span>
                        ) : (
                          <span className="font-medium text-amber-700" title={seoAudit.reasons.join(', ')}>
                            {seoAudit.reasons[0]}
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 pl-3 pr-4 whitespace-nowrap align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/posts/new?edit=${encodeURIComponent(item.id)}`}
                            title="Edit in Post Builder"
                            aria-label={`Edit ${item.title}`}
                            className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            disabled={isIndexing}
                            onClick={() => void handleIndexSinglePost(item)}
                            title="Request Instant Indexing"
                            aria-label={`Index ${item.title}`}
                            className="p-2 rounded-md text-neutral-600 hover:text-[#15803d] hover:bg-emerald-50 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {isIndexing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/?vacancy=${encodeURIComponent(item.id)}`}
                            target="_blank"
                            title="Open live page"
                            aria-label={`Open ${item.title}`}
                            className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {confirmSingleDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1 ml-1">
                              <button
                                type="button"
                                onClick={() => void handleSingleDeleteExecute(item.id)}
                                className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmSingleDeleteId(null)}
                                className="px-2 py-1 rounded border border-neutral-300 text-xs text-neutral-700 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmSingleDeleteId(item.id)}
                              title="Delete post"
                              aria-label={`Delete ${item.title}`}
                              className="p-2 rounded-md text-neutral-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500 font-mono tabular-nums">
          <span>
            Showing {visibleRows.length} of {sortedVacancies.length} posts
          </span>
          <span>Live Firestore sync</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardClient;
