'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  Cloud,
  CloudOff,
  Edit3,
  ExternalLink,
  Inbox,
  Loader2,
  LogOut,
  Plus,
  Send,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { usePortal } from '../context/PortalContext';
import type { BoardType, CategoryType, QualificationType } from '../types';
import {
  ALERT_CATEGORY_OPTIONS,
  ALERT_ORGANIZATION_OPTIONS,
  ALERT_QUALIFICATION_OPTIONS,
  ALERT_STARTER_TEMPLATES,
  findMatchingVacanciesForAlert,
  formatRelativeNotificationTime,
  getCategoryDisplayLabel,
  type DigestFrequency,
  type SavedSearchAlert,
} from '../utils/jobAlertEngine';

interface AlertFormState {
  name: string;
  keywordInput: string;
  keywords: string[];
  categories: CategoryType[];
  organizations: BoardType[];
  qualifications: QualificationType[];
  locationQuery: string;
  minPosts: number;
  notifyInApp: boolean;
  notifyBrowserPush: boolean;
}

const EMPTY_FORM: AlertFormState = {
  name: '',
  keywordInput: '',
  keywords: [],
  categories: ['latest_job'],
  organizations: [],
  qualifications: [],
  locationQuery: '',
  minPosts: 0,
  notifyInApp: true,
  notifyBrowserPush: false,
};

export const NotificationCenterDrawer: React.FC = () => {
  const { user, signInRegularUserWithGoogle, logout } = useAuth();
  const { lang, vacancies } = usePortal();
  const {
    savedAlerts,
    preferences,
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    activeDrawerTab,
    setActiveDrawerTab,
    prefillDraft,
    clearPrefillDraft,
    browserPermission,
    cloudSyncStatus,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlertEnabled,
    markAllAsRead,
    dismissNotification,
    clearReadNotifications,
    updatePreferences,
    requestBrowserPushPermission,
    triggerTestNotification,
    openNotificationVacancy,
    syncNowToCloud,
  } = useNotifications();

  const isHi = lang === 'hi';

  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [form, setForm] = useState<AlertFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // Close drawer on Escape key
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Apply external prefill draft (e.g., when user clicks "Save Search as Alert" from home/category)
  useEffect(() => {
    if (!prefillDraft) return;
    setEditingAlertId(null);
    setForm({
      ...EMPTY_FORM,
      name: prefillDraft.name || '',
      keywords: prefillDraft.keywords || [],
      categories:
        prefillDraft.categories && prefillDraft.categories.length > 0
          ? prefillDraft.categories
          : ['latest_job'],
      locationQuery: prefillDraft.locationQuery || '',
      notifyBrowserPush: browserPermission === 'granted' && preferences.browserPushEnabled,
    });
    setFormError('');
    setShowBuilder(true);
    clearPrefillDraft();
  }, [prefillDraft, clearPrefillDraft, browserPermission, preferences.browserPushEnabled]);

  const filteredNotifications = useMemo(() => {
    if (inboxFilter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, inboxFilter]);

  // Live preview of how many active vacancies match the builder form right now
  const previewMatchCount = useMemo(() => {
    if (!showBuilder) return 0;
    const pendingKeywords = [
      ...form.keywords,
      ...form.keywordInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    ];
    const draftRule: SavedSearchAlert = {
      id: 'preview',
      name: form.name || 'Preview',
      keywords: pendingKeywords,
      categories: form.categories,
      organizations: form.organizations,
      qualifications: form.qualifications,
      locationQuery: form.locationQuery,
      minPosts: form.minPosts,
      enabled: true,
      notifyInApp: true,
      notifyBrowserPush: false,
      createdAt: '',
    };
    return findMatchingVacanciesForAlert(vacancies, draftRule).length;
  }, [showBuilder, form, vacancies]);

  const addKeywordsFromInput = (raw: string) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setForm((prev) => ({
      ...prev,
      keywordInput: '',
      keywords: Array.from(new Set([...prev.keywords, ...parts])).slice(0, 12),
    }));
  };

  const toggleCategory = (cat: CategoryType) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleOrganization = (org: BoardType) => {
    setForm((prev) => ({
      ...prev,
      organizations: prev.organizations.includes(org)
        ? prev.organizations.filter((o) => o !== org)
        : [...prev.organizations, org],
    }));
  };

  const toggleQualification = (qual: QualificationType) => {
    setForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter((q) => q !== qual)
        : [...prev.qualifications, qual],
    }));
  };

  const handleOpenNewBuilder = () => {
    setEditingAlertId(null);
    setForm({
      ...EMPTY_FORM,
      notifyBrowserPush: browserPermission === 'granted' && preferences.browserPushEnabled,
    });
    setFormError('');
    setShowBuilder(true);
  };

  const handleEditAlert = (alert: SavedSearchAlert) => {
    setEditingAlertId(alert.id);
    setForm({
      name: alert.name,
      keywordInput: '',
      keywords: [...alert.keywords],
      categories: [...alert.categories],
      organizations: [...alert.organizations],
      qualifications: [...alert.qualifications],
      locationQuery: alert.locationQuery,
      minPosts: alert.minPosts,
      notifyInApp: alert.notifyInApp,
      notifyBrowserPush: alert.notifyBrowserPush,
    });
    setFormError('');
    setShowBuilder(true);
  };

  const handleSubmitBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    const mergedKeywords = Array.from(
      new Set([
        ...form.keywords,
        ...form.keywordInput
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      ])
    ).slice(0, 12);

    const autoName =
      form.name.trim() ||
      (mergedKeywords[0]
        ? `${mergedKeywords[0]} Job Alert`
        : form.organizations[0]
          ? `${form.organizations[0]} Alerts`
          : form.qualifications[0]
            ? `${form.qualifications[0]} Govt Jobs`
            : form.categories.length > 0
              ? `${getCategoryDisplayLabel(form.categories[0], isHi)} Alert`
              : isHi
                ? 'कस्टम भर्ती अलर्ट'
                : 'Custom Job Alert');

    if (
      mergedKeywords.length === 0 &&
      form.categories.length === 0 &&
      form.organizations.length === 0 &&
      form.qualifications.length === 0 &&
      !form.locationQuery.trim() &&
      form.minPosts === 0
    ) {
      setFormError(
        isHi
          ? 'कम से कम एक फ़िल्टर (कीवर्ड, श्रेणी, विभाग या योग्यता) चुनें।'
          : 'Select at least one criterion (keyword, category, board, or qualification).'
      );
      return;
    }

    if (editingAlertId) {
      updateAlert(editingAlertId, {
        name: autoName,
        keywords: mergedKeywords,
        categories: form.categories,
        organizations: form.organizations,
        qualifications: form.qualifications,
        locationQuery: form.locationQuery.trim(),
        minPosts: form.minPosts,
        notifyInApp: form.notifyInApp,
        notifyBrowserPush: form.notifyBrowserPush,
      });
    } else {
      createAlert({
        name: autoName,
        keywords: mergedKeywords,
        categories: form.categories,
        organizations: form.organizations,
        qualifications: form.qualifications,
        locationQuery: form.locationQuery.trim(),
        minPosts: form.minPosts,
        enabled: true,
        notifyInApp: form.notifyInApp,
        notifyBrowserPush: form.notifyBrowserPush,
      });
    }

    setShowBuilder(false);
    setEditingAlertId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleActivateTemplate = (templateId: string) => {
    const tpl = ALERT_STARTER_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    createAlert({
      ...tpl.criteria,
      name: isHi ? tpl.nameHi : tpl.name,
      enabled: true,
      notifyInApp: true,
      notifyBrowserPush: browserPermission === 'granted' && preferences.browserPushEnabled,
    });
  };

  const handleGoogleAlertSyncSignIn = async () => {
    setAuthError('');
    setAuthBusy(true);
    try {
      const res = await signInRegularUserWithGoogle();
      if (!res.ok) {
        setAuthError(res.error || 'Unable to sign in.');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={isHi ? 'जॉब अलर्ट और नोटिफिकेशन सेंटर' : 'Job Alerts & Notification Center'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/45"
          />

          {/* Slide-Over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col text-slate-900 shadow-xl"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {isHi ? 'जॉब अलर्ट व नोटिफिकेशन' : 'Job Alerts & Notifications'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {unreadCount > 0
                    ? isHi
                      ? `${unreadCount} नई सूचनाएं · ${savedAlerts.filter((a) => a.enabled).length} सक्रिय अलर्ट`
                      : `${unreadCount} unread · ${savedAlerts.filter((a) => a.enabled).length} active alerts`
                    : isHi
                      ? `सभी सूचनाएं पढ़ ली गई हैं · ${savedAlerts.filter((a) => a.enabled).length} सक्रिय अलर्ट`
                      : `All caught up · ${savedAlerts.filter((a) => a.enabled).length} active alerts`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label={isHi ? 'बंद करें' : 'Close notifications'}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 shrink-0">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-lg" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDrawerTab === 'inbox'}
                  onClick={() => setActiveDrawerTab('inbox')}
                  className={`py-2 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeDrawerTab === 'inbox'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{isHi ? 'इनबॉक्स' : 'Inbox'}</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold text-[#15803d] tabular-nums">
                      ({unreadCount})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDrawerTab === 'alerts'}
                  onClick={() => setActiveDrawerTab('alerts')}
                  className={`py-2 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeDrawerTab === 'alerts'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{isHi ? 'सेव्ड अलर्ट' : 'Saved Alerts'}</span>
                  {savedAlerts.length > 0 && (
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      ({savedAlerts.length})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDrawerTab === 'preferences'}
                  onClick={() => setActiveDrawerTab('preferences')}
                  className={`py-2 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeDrawerTab === 'preferences'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{isHi ? 'सेटिंग्स' : 'Preferences'}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* TAB 1: IN-APP NOTIFICATION INBOX */}
              {activeDrawerTab === 'inbox' && (
                <div className="space-y-4">
                  {/* Inbox Toolbar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setInboxFilter('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          inboxFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isHi ? 'सभी' : 'All'} ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInboxFilter('unread')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          inboxFilter === 'unread'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isHi ? 'अपठित' : 'Unread'} ({unreadCount})
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-[#15803d] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{isHi ? 'सभी पढ़ें' : 'Mark all read'}</span>
                        </button>
                      )}
                      {notifications.some((n) => n.read) && (
                        <button
                          type="button"
                          onClick={clearReadNotifications}
                          className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline cursor-pointer whitespace-nowrap"
                        >
                          {isHi ? 'साफ़ करें' : 'Clear read'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!preferences.inAppEnabled && (
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-center justify-between gap-2">
                      <span>
                        {isHi
                          ? 'इन-ऐप नोटिफिकेशन अभी बंद हैं।'
                          : 'In-app notifications are currently paused.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePreferences({ inAppEnabled: true })}
                        className="font-semibold text-amber-950 underline whitespace-nowrap cursor-pointer"
                      >
                        {isHi ? 'चालू करें' : 'Turn on'}
                      </button>
                    </div>
                  )}

                  {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {filteredNotifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 transition-colors ${
                            item.read ? 'bg-white hover:bg-slate-50/80' : 'bg-emerald-50/45 hover:bg-emerald-50/70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openNotificationVacancy(item)}
                              className="text-left flex-1 min-w-0 cursor-pointer group"
                            >
                              <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500">
                                {!item.read && (
                                  <>
                                    <span className="font-bold text-[#15803d]">
                                      {isHi ? 'नया' : 'New'}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                  </>
                                )}
                                <span className="font-semibold text-slate-700">
                                  {item.matchedAlertName}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {formatRelativeNotificationTime(item.createdAt, isHi)}
                                </span>
                              </div>

                              <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-[#15803d] leading-snug">
                                {isHi ? item.titleHi || item.title : item.title}
                              </p>

                              <div className="mt-1.5 flex items-center flex-wrap gap-1.5 text-xs text-slate-600">
                                <span>{item.organization}</span>
                                <span aria-hidden="true">·</span>
                                <span>{getCategoryDisplayLabel(item.category, isHi)}</span>
                                {item.totalPosts ? (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="tabular-nums">
                                      {item.totalPosts} {isHi ? 'पद' : 'Posts'}
                                    </span>
                                  </>
                                ) : null}
                              </div>

                              {item.matchReasons.length > 0 && (
                                <p className="mt-1 text-[11px] text-slate-500">
                                  {isHi ? 'मैच कारण: ' : 'Matched: '}
                                  {item.matchReasons.join(' · ')}
                                </p>
                              )}
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openNotificationVacancy(item)}
                                aria-label={isHi ? 'पोस्ट खोलें' : 'Open job posting'}
                                className="p-1.5 rounded-md text-slate-500 hover:text-[#15803d] hover:bg-white transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => dismissNotification(item.id)}
                                aria-label={isHi ? 'नोटिफिकेशन हटाएं' : 'Dismiss notification'}
                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 px-5 text-center border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                      <div className="w-10 h-10 mx-auto rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <Bell className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          {inboxFilter === 'unread'
                            ? isHi
                              ? 'कोई अपठित अलर्ट नहीं है'
                              : 'No unread alerts'
                            : isHi
                              ? 'अभी कोई जॉब अलर्ट नहीं आया है'
                              : 'No job notifications yet'}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                          {savedAlerts.length === 0
                            ? isHi
                              ? 'अपनी पसंद की श्रेणी, विभाग, योग्यता या कीवर्ड का सेव्ड सर्च अलर्ट बनाएं — नई भर्ती आते ही आपको तुरंत अलर्ट मिलेगा।'
                              : 'Create a custom saved search alert by category, board, qualification, or keywords to get notified as soon as matching jobs arrive.'
                            : isHi
                              ? 'जैसे ही आपके सेव्ड सर्च मानदंड से मेल खाती नई भर्ती प्रकाशित होगी, वह यहाँ दिखाई देगी।'
                              : 'New job postings matching your active saved searches will appear here automatically.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDrawerTab('alerts');
                          if (savedAlerts.length === 0) handleOpenNewBuilder();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {savedAlerts.length === 0
                            ? isHi
                              ? 'पहला जॉब अलर्ट बनाएं'
                              : 'Create First Job Alert'
                            : isHi
                              ? 'सेव्ड अलर्ट प्रबंधित करें'
                              : 'Manage Saved Alerts'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SAVED SEARCH CRITERIA & ALERT BUILDER */}
              {activeDrawerTab === 'alerts' && (
                <div className="space-y-5">
                  {/* Top Bar for Saved Alerts */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isHi ? 'मेरे सेव्ड सर्च अलर्ट' : 'Saved Search Criteria'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isHi
                          ? 'श्रेणी, विभाग, योग्यता व कीवर्ड के अनुसार कस्टम अलर्ट'
                          : 'Customize alerts by category, board, qualification & keywords'}
                      </p>
                    </div>
                    {!showBuilder && (
                      <button
                        type="button"
                        onClick={handleOpenNewBuilder}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isHi ? 'नया अलर्ट' : 'New Alert'}</span>
                      </button>
                    )}
                  </div>

                  {/* Custom Alert Builder Form */}
                  {showBuilder && (
                    <form
                      onSubmit={handleSubmitBuilder}
                      className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {editingAlertId
                            ? isHi
                              ? 'अलर्ट संपादित करें'
                              : 'Edit Job Alert'
                            : isHi
                              ? 'कस्टम जॉब अलर्ट बनाएं'
                              : 'Create Custom Job Alert'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setShowBuilder(false);
                            setEditingAlertId(null);
                            setFormError('');
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          {isHi ? 'रद्द करें' : 'Cancel'}
                        </button>
                      </div>

                      {/* Alert Name */}
                      <div>
                        <label
                          htmlFor="alert-rule-name"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          {isHi ? 'अलर्ट का नाम' : 'Alert Name'}
                        </label>
                        <input
                          id="alert-rule-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder={
                            isHi
                              ? 'जैसे: Patwari / RPSC Graduate Bharti'
                              : 'e.g., RPSC Graduate / Patwari Jobs'
                          }
                          maxLength={80}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                        />
                      </div>

                      {/* Keywords */}
                      <div>
                        <label
                          htmlFor="alert-keywords-input"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          {isHi ? 'कीवर्ड्स (Enter या कॉमा से जोड़ें)' : 'Keywords (press Enter or comma)'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="alert-keywords-input"
                            type="text"
                            value={form.keywordInput}
                            onChange={(e) => setForm((p) => ({ ...p, keywordInput: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addKeywordsFromInput(form.keywordInput);
                              }
                            }}
                            placeholder={
                              isHi ? 'जैसे: Patwari, Police, REET, LDC' : 'e.g., Patwari, Constable, REET'
                            }
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#15803d]"
                          />
                          <button
                            type="button"
                            onClick={() => addKeywordsFromInput(form.keywordInput)}
                            className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer whitespace-nowrap"
                          >
                            {isHi ? 'जोड़ें' : 'Add'}
                          </button>
                        </div>
                        {form.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {form.keywords.map((kw) => (
                              <button
                                key={kw}
                                type="button"
                                onClick={() =>
                                  setForm((p) => ({
                                    ...p,
                                    keywords: p.keywords.filter((item) => item !== kw),
                                  }))
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-300 text-xs font-medium text-slate-800 hover:border-red-300 hover:text-red-700 cursor-pointer"
                                title={isHi ? 'हटाएं' : 'Remove keyword'}
                              >
                                <span>{kw}</span>
                                <X className="w-3 h-3" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Categories Multi-Select */}
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          {isHi ? 'श्रेणियां (Categories)' : 'Categories'}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ALERT_CATEGORY_OPTIONS.map((cat) => {
                            const selected = form.categories.includes(cat.value);
                            return (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => toggleCategory(cat.value)}
                                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium text-left transition-colors cursor-pointer truncate ${
                                  selected
                                    ? 'bg-emerald-50 border-[#15803d] text-[#15803d] font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {isHi ? cat.labelHi : cat.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Organizations / Boards */}
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          {isHi ? 'विभाग / बोर्ड (वैकल्पिक)' : 'Board / Department (optional)'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ALERT_ORGANIZATION_OPTIONS.map((org) => {
                            const selected = form.organizations.includes(org);
                            return (
                              <button
                                key={org}
                                type="button"
                                onClick={() => toggleOrganization(org)}
                                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                  selected
                                    ? 'bg-emerald-50 border-[#15803d] text-[#15803d] font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {org}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Education Qualifications */}
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          {isHi ? 'शैक्षणिक योग्यता (वैकल्पिक)' : 'Qualification (optional)'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ALERT_QUALIFICATION_OPTIONS.map((q) => {
                            const selected = form.qualifications.includes(q.value);
                            return (
                              <button
                                key={q.value}
                                type="button"
                                onClick={() => toggleQualification(q.value)}
                                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                  selected
                                    ? 'bg-emerald-50 border-[#15803d] text-[#15803d] font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {q.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Location & Minimum Posts */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="alert-location-input"
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            {isHi ? 'स्थान / राज्य' : 'Location / State'}
                          </label>
                          <input
                            id="alert-location-input"
                            type="text"
                            value={form.locationQuery}
                            onChange={(e) => setForm((p) => ({ ...p, locationQuery: e.target.value }))}
                            placeholder={isHi ? 'जैसे: Rajasthan, Jaipur' : 'e.g., Rajasthan'}
                            maxLength={60}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#15803d]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="alert-min-posts"
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            {isHi ? 'न्यूनतम पद' : 'Minimum Posts'}
                          </label>
                          <select
                            id="alert-min-posts"
                            value={form.minPosts}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, minPosts: Number(e.target.value) || 0 }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#15803d]"
                          >
                            <option value={0}>{isHi ? 'कोई भी संख्या' : 'Any count'}</option>
                            <option value={50}>50+ {isHi ? 'पद' : 'Posts'}</option>
                            <option value={200}>200+ {isHi ? 'पद' : 'Posts'}</option>
                            <option value={500}>500+ {isHi ? 'पद' : 'Posts'}</option>
                            <option value={1000}>1,000+ {isHi ? 'पद' : 'Posts'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Per-Alert Delivery Channels */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.notifyInApp}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, notifyInApp: e.target.checked }))
                            }
                            className="accent-[#15803d] w-4 h-4"
                          />
                          <span>{isHi ? 'इन-ऐप अलर्ट' : 'In-App Alert'}</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.notifyBrowserPush}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, notifyBrowserPush: e.target.checked }))
                            }
                            className="accent-[#15803d] w-4 h-4"
                          />
                          <span>{isHi ? 'ब्राउज़र पुश' : 'Browser Push'}</span>
                        </label>
                      </div>

                      {formError && (
                        <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {formError}
                        </p>
                      )}

                      {/* Live Preview Count + Save Action */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-600 tabular-nums">
                          {isHi
                            ? `अभी ${previewMatchCount} सक्रिय पोस्ट मेल खाती हैं`
                            : `Matches ${previewMatchCount} active postings now`}
                        </span>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {editingAlertId
                            ? isHi
                              ? 'अलर्ट अपडेट करें'
                              : 'Update Alert'
                            : isHi
                              ? 'अलर्ट सेव करें'
                              : 'Save Job Alert'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Active Saved Alerts List */}
                  {savedAlerts.length > 0 && (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {savedAlerts.map((alert) => {
                        const matchCount = findMatchingVacanciesForAlert(vacancies, alert).length;
                        const summaryParts: string[] = [];
                        if (alert.categories.length > 0) {
                          summaryParts.push(
                            alert.categories.map((c) => getCategoryDisplayLabel(c, isHi)).join(', ')
                          );
                        }
                        if (alert.organizations.length > 0) {
                          summaryParts.push(alert.organizations.join(', '));
                        }
                        if (alert.qualifications.length > 0) {
                          summaryParts.push(alert.qualifications.join(', '));
                        }
                        if (alert.keywords.length > 0) {
                          summaryParts.push(alert.keywords.join(', '));
                        }
                        if (alert.locationQuery) {
                          summaryParts.push(alert.locationQuery);
                        }
                        if (alert.minPosts > 0) {
                          summaryParts.push(`${alert.minPosts}+ ${isHi ? 'पद' : 'posts'}`);
                        }

                        return (
                          <div key={alert.id} className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-bold truncate ${
                                    alert.enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                                  }`}
                                >
                                  {alert.name}
                                </p>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {summaryParts.join(' · ') || (isHi ? 'सभी नई भर्तियां' : 'All new job postings')}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                                <span className={alert.enabled ? 'text-[#15803d] font-semibold' : 'text-slate-500'}>
                                  {alert.enabled
                                    ? isHi
                                      ? 'सक्रिय'
                                      : 'Active'
                                    : isHi
                                      ? 'म्यूट'
                                      : 'Muted'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {matchCount} {isHi ? 'वर्तमान मैच' : 'live matches'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleAlertEnabled(alert.id)}
                                aria-label={
                                  alert.enabled
                                    ? isHi
                                      ? 'अलर्ट म्यूट करें'
                                      : 'Mute alert'
                                    : isHi
                                      ? 'अलर्ट चालू करें'
                                      : 'Enable alert'
                                }
                                title={alert.enabled ? (isHi ? 'म्यूट करें' : 'Mute') : isHi ? 'सक्रिय करें' : 'Enable'}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  alert.enabled
                                    ? 'border-emerald-200 bg-emerald-50 text-[#15803d] hover:bg-emerald-100'
                                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {alert.enabled ? (
                                  <Bell className="w-3.5 h-3.5" />
                                ) : (
                                  <BellOff className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditAlert(alert)}
                                aria-label={isHi ? 'संपादित करें' : 'Edit alert'}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAlert(alert.id)}
                                aria-label={isHi ? 'हटाएं' : 'Delete alert'}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick 1-Click Starter Templates */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {isHi ? 'त्वरित 1-क्लिक अलर्ट टेम्पलेट्स' : 'Quick 1-Click Alert Presets'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isHi
                          ? 'लोकप्रिय राजस्थान भर्ती श्रेणियों के लिए तुरंत अलर्ट सक्रिय करें'
                          : 'Subscribe to popular Rajasthan exam tracks in one tap'}
                      </p>
                    </div>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {ALERT_STARTER_TEMPLATES.map((tpl) => {
                        const alreadyAdded = savedAlerts.some(
                          (a) => a.name === tpl.name || a.name === tpl.nameHi
                        );
                        return (
                          <div
                            key={tpl.id}
                            className="p-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {isHi ? tpl.nameHi : tpl.name}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {isHi ? tpl.summaryHi : tpl.summary}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => handleActivateTemplate(tpl.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                                alreadyAdded
                                  ? 'bg-slate-100 text-slate-400 cursor-default'
                                  : 'border border-slate-300 bg-white hover:border-[#15803d] hover:text-[#15803d] text-slate-800 cursor-pointer'
                              }`}
                            >
                              {alreadyAdded
                                ? isHi
                                  ? 'सक्रिय'
                                  : 'Added'
                                : isHi
                                  ? '+ जोड़ें'
                                  : '+ Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DELIVERY PREFERENCES & CLOUD SYNC */}
              {activeDrawerTab === 'preferences' && (
                <div className="space-y-5">
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
                    {/* In-App Notifications */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {isHi ? 'इन-ऐप नोटिफिकेशन इनबॉक्स' : 'In-App Notification Inbox'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isHi
                            ? 'मैच होने वाली सभी नई भर्तियां इनबॉक्स में सेव करें'
                            : 'Deliver matching new job postings inside the portal inbox'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.inAppEnabled}
                        onChange={(e) => updatePreferences({ inAppEnabled: e.target.checked })}
                        aria-label="In-App Notification Inbox"
                        className="w-4 h-4 accent-[#15803d] cursor-pointer shrink-0"
                      />
                    </div>

                    {/* Live Pop-up Banner */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {isHi ? 'लाइव पॉप-अप अलर्ट बैनर' : 'Live In-App Alert Banner'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isHi
                            ? 'पोर्टल चलाते समय नई भर्ती आते ही स्क्रीन पर तुरंत बैनर दिखाएं'
                            : 'Show a non-intrusive bottom card when a matching job publishes'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.inAppBannerPopup}
                        onChange={(e) => updatePreferences({ inAppBannerPopup: e.target.checked })}
                        aria-label="Live In-App Alert Banner"
                        className="w-4 h-4 accent-[#15803d] cursor-pointer shrink-0"
                      />
                    </div>

                    {/* Status Change Updates */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {isHi ? 'एडमिट कार्ड व रिजल्ट स्थिति अलर्ट' : 'Admit Card & Result Status Alerts'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isHi
                            ? 'मैच होने वाली भर्ती का एडमिट कार्ड या रिजल्ट जारी होने पर अलर्ट दें'
                            : 'Alert when matching vacancies release admit cards, answer keys, or results'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyOnStatusChange}
                        onChange={(e) =>
                          updatePreferences({ notifyOnStatusChange: e.target.checked })
                        }
                        aria-label="Status Change Alerts"
                        className="w-4 h-4 accent-[#15803d] cursor-pointer shrink-0"
                      />
                    </div>

                    {/* Quiet Mode */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {isHi ? 'साइलेंट / क्वाइट मोड' : 'Quiet Mode'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isHi
                            ? 'पॉप-अप और पुश बंद रखें, अलर्ट केवल इनबॉक्स में एकत्र हों'
                            : 'Silence pop-ups and push alerts while still logging to Inbox'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.quietMode}
                        onChange={(e) => updatePreferences({ quietMode: e.target.checked })}
                        aria-label="Quiet Mode"
                        className="w-4 h-4 accent-[#15803d] cursor-pointer shrink-0"
                      />
                    </div>

                    {/* Browser Push Notifications */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {isHi ? 'ब्राउज़र पुश नोटिफिकेशन' : 'Browser Push Notifications'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {browserPermission === 'granted'
                              ? isHi
                                ? 'ब्राउज़र अनुमति स्वीकृत है'
                                : 'Browser permission granted'
                              : browserPermission === 'denied'
                                ? isHi
                                  ? 'ब्राउज़र सेटिंग में नोटिफिकेशन ब्लॉक हैं'
                                  : 'Blocked in browser site settings'
                                : browserPermission === 'unsupported'
                                  ? isHi
                                    ? 'यह ब्राउज़र पुश नोटिफिकेशन सपोर्ट नहीं करता'
                                    : 'Not supported by this browser'
                                  : isHi
                                    ? 'टैब बैकग्राउंड में होने पर भी डेस्कटॉप/मोबाइल अलर्ट पाएं'
                                    : 'Receive native alerts even when browsing another tab'}
                          </p>
                        </div>
                        {browserPermission === 'granted' ? (
                          <input
                            type="checkbox"
                            checked={preferences.browserPushEnabled}
                            onChange={(e) =>
                              updatePreferences({ browserPushEnabled: e.target.checked })
                            }
                            aria-label="Browser Push Notifications"
                            className="w-4 h-4 accent-[#15803d] cursor-pointer shrink-0"
                          />
                        ) : browserPermission === 'default' ? (
                          <button
                            type="button"
                            onClick={() => void requestBrowserPushPermission()}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-[#15803d] hover:text-[#15803d] text-xs font-semibold whitespace-nowrap cursor-pointer shrink-0"
                          >
                            {isHi ? 'अनुमति दें' : 'Enable'}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Delivery Cadence */}
                    <div className="p-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {isHi ? 'अलर्ट फ्रीक्वेंसी' : 'Alert Cadence'}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'instant', label: 'Instant', labelHi: 'तुरंत (Instant)' },
                            { id: 'daily', label: 'Daily', labelHi: 'दैनिक (Daily)' },
                            { id: 'weekly', label: 'Weekly', labelHi: 'साप्ताहिक' },
                          ] as Array<{ id: DigestFrequency; label: string; labelHi: string }>
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updatePreferences({ digestFrequency: opt.id })}
                            className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              preferences.digestFrequency === opt.id
                                ? 'bg-emerald-50 border-[#15803d] text-[#15803d]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {isHi ? opt.labelHi : opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Test Live In-App Alert */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {isHi ? 'अलर्ट प्रीव्यू टेस्ट करें' : 'Test Alert Delivery'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {isHi
                          ? 'अभी लाइव इन-ऐप नोटिफिकेशन कार्ड का प्रीव्यू देखें'
                          : 'Send a sample matching job notification right now'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={triggerTestNotification}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isHi ? 'टेस्ट भेजें' : 'Send Test'}</span>
                    </button>
                  </div>

                  {/* Optional Cloud Sync Across Devices (Regular Users) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          {user && user.emailVerified ? (
                            <Cloud className="w-4 h-4 text-[#15803d]" aria-hidden="true" />
                          ) : (
                            <CloudOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
                          )}
                          <span>
                            {isHi ? 'क्लाउड अलर्ट सिंक (वैकल्पिक)' : 'Cross-Device Cloud Sync (Optional)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {user && user.emailVerified
                            ? isHi
                              ? `${user.email} के साथ सिंक है (${cloudSyncStatus === 'syncing' ? 'सिंक हो रहा है...' : cloudSyncStatus === 'synced' ? 'सिंक पूरा' : 'तैयार'})`
                              : `Synced to ${user.email} (${cloudSyncStatus})`
                            : isHi
                              ? 'आपके अलर्ट इस ब्राउज़र में सेव हैं। मोबाइल और डेस्कटॉप दोनों पर सिंक रखने के लिए Google से साइन इन करें।'
                              : 'Your alerts are saved in this browser. Sign in with Google to keep saved searches synced across devices.'}
                        </p>
                      </div>
                    </div>

                    {authError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {authError}
                      </p>
                    )}

                    {user && user.emailVerified ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={cloudSyncStatus === 'syncing'}
                          onClick={() => void syncNowToCloud()}
                          className="flex-1 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {cloudSyncStatus === 'syncing' && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          )}
                          <span>{isHi ? 'अभी सिंक करें' : 'Sync Now'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{isHi ? 'साइन आउट' : 'Sign Out'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={authBusy}
                        onClick={() => void handleGoogleAlertSyncSignIn()}
                        className="w-full py-2.5 px-4 rounded-lg border border-slate-300 hover:border-[#15803d] hover:text-[#15803d] bg-white text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {authBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>
                          {authBusy
                            ? isHi
                              ? 'कनेक्ट हो रहा है...'
                              : 'Connecting...'
                            : isHi
                              ? 'Google से अलर्ट सिंक करें'
                              : 'Sync Alerts with Google'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenterDrawer;
