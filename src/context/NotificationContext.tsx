'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { usePortal } from './PortalContext';
import type { CategoryType, JobStatusType, VacancyItem } from '../types';
import { compareVacanciesNewestFirst } from '../utils/dateUtils';
import {
  createNotificationFromMatch,
  DEFAULT_NOTIFICATION_PREFERENCES,
  findMatchingVacanciesForAlert,
  matchVacancyAgainstAlert,
  sanitizeNotificationPreferences,
  sanitizeSavedAlerts,
  STORAGE_KEY_SEEN_VACANCY_IDS,
  STORAGE_KEY_USER_ALERTS,
  STORAGE_KEY_USER_NOTIFS,
  STORAGE_KEY_USER_PREFS,
  type InAppNotificationItem,
  type NotificationDeliveryPreferences,
  type SavedSearchAlert,
} from '../utils/jobAlertEngine';

export type NotificationDrawerTab = 'inbox' | 'alerts' | 'preferences';

export interface AlertDraftPrefill {
  name?: string;
  keywords?: string[];
  categories?: CategoryType[];
  locationQuery?: string;
}

interface NotificationContextType {
  savedAlerts: SavedSearchAlert[];
  preferences: NotificationDeliveryPreferences;
  notifications: InAppNotificationItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activeDrawerTab: NotificationDrawerTab;
  setActiveDrawerTab: (tab: NotificationDrawerTab) => void;
  prefillDraft: AlertDraftPrefill | null;
  clearPrefillDraft: () => void;
  liveToastAlert: InAppNotificationItem | null;
  dismissLiveToastAlert: () => void;
  browserPermission: NotificationPermission | 'unsupported';
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  openNotificationDrawer: (tab?: NotificationDrawerTab) => void;
  openSaveSearchBuilder: (prefill?: AlertDraftPrefill) => void;
  createAlert: (
    draft: Omit<SavedSearchAlert, 'id' | 'createdAt'>
  ) => { alert: SavedSearchAlert; matchedCount: number };
  updateAlert: (id: string, updates: Partial<Omit<SavedSearchAlert, 'id' | 'createdAt'>>) => void;
  deleteAlert: (id: string) => void;
  toggleAlertEnabled: (id: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  clearReadNotifications: () => void;
  updatePreferences: (patch: Partial<NotificationDeliveryPreferences>) => void;
  requestBrowserPushPermission: () => Promise<NotificationPermission | 'unsupported'>;
  triggerTestNotification: () => void;
  openNotificationVacancy: (item: InAppNotificationItem) => void;
  syncNowToCloud: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { vacancies, lang, handleSelectVacancy, showToast } = usePortal();

  const [savedAlerts, setSavedAlerts] = useState<SavedSearchAlert[]>([]);
  const [preferences, setPreferences] = useState<NotificationDeliveryPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<NotificationDrawerTab>('inbox');
  const [prefillDraft, setPrefillDraft] = useState<AlertDraftPrefill | null>(null);
  const [liveToastAlert, setLiveToastAlert] = useState<InAppNotificationItem | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [hasHydrated, setHasHydrated] = useState(false);

  const seenVacancyIdsRef = useRef<Set<string>>(new Set());
  const prevStatusMapRef = useRef<Record<string, JobStatusType>>({});
  const hasSeededVacancyBaselineRef = useRef(false);
  const alertsRef = useRef<SavedSearchAlert[]>(savedAlerts);
  const prefsRef = useRef<NotificationDeliveryPreferences>(preferences);
  const notificationsRef = useRef<InAppNotificationItem[]>(notifications);
  const cloudHydratedUidRef = useRef<string | null>(null);
  const cloudSyncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    alertsRef.current = savedAlerts;
  }, [savedAlerts]);

  useEffect(() => {
    prefsRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // 1. Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setBrowserPermission(Notification.permission);
      } else {
        setBrowserPermission('unsupported');
      }
    }

    try {
      const rawAlerts = localStorage.getItem(STORAGE_KEY_USER_ALERTS);
      if (rawAlerts) {
        const parsed = JSON.parse(rawAlerts);
        if (Array.isArray(parsed)) {
          const clean = sanitizeSavedAlerts(parsed);
          setSavedAlerts(clean);
          alertsRef.current = clean;
        }
      }
    } catch {}

    try {
      const rawPrefs = localStorage.getItem(STORAGE_KEY_USER_PREFS);
      if (rawPrefs) {
        const parsed = JSON.parse(rawPrefs);
        const clean = sanitizeNotificationPreferences(parsed);
        setPreferences(clean);
        prefsRef.current = clean;
      }
    } catch {}

    try {
      const rawNotifs = localStorage.getItem(STORAGE_KEY_USER_NOTIFS);
      if (rawNotifs) {
        const parsed = JSON.parse(rawNotifs);
        if (Array.isArray(parsed)) {
          const clean = parsed.slice(0, 80) as InAppNotificationItem[];
          setNotifications(clean);
          notificationsRef.current = clean;
        }
      }
    } catch {}

    try {
      const rawSeen = localStorage.getItem(STORAGE_KEY_SEEN_VACANCY_IDS);
      if (rawSeen) {
        const parsed = JSON.parse(rawSeen);
        if (Array.isArray(parsed)) {
          seenVacancyIdsRef.current = new Set(parsed.filter((id): id is string => typeof id === 'string'));
        }
      }
    } catch {}

    setHasHydrated(true);
  }, []);

  // 2. Persist local changes cleanly
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_USER_ALERTS, JSON.stringify(savedAlerts));
    } catch {}
  }, [savedAlerts, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_USER_PREFS, JSON.stringify(preferences));
    } catch {}
  }, [preferences, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_USER_NOTIFS, JSON.stringify(notifications.slice(0, 80)));
    } catch {}
  }, [notifications, hasHydrated]);

  // 3. Optional Firestore cloud hydration for signed-in Google users (browser-only dynamic import)
  useEffect(() => {
    if (!hasHydrated || !user || !user.emailVerified) {
      cloudHydratedUidRef.current = null;
      setCloudSyncStatus('idle');
      return;
    }

    if (cloudHydratedUidRef.current === user.uid) return;
    cloudHydratedUidRef.current = user.uid;
    let cancelled = false;

    (async () => {
      setCloudSyncStatus('syncing');
      try {
        const { loadUserAlertPreferencesFromCloud } = await import('../services/userAlertCloudSync');
        const remote = await loadUserAlertPreferencesFromCloud(user);
        if (cancelled) return;

        if (remote) {
          // Merge remote savedAlerts with local savedAlerts by id (remote wins on conflict)
          setSavedAlerts((local) => {
            const byId = new Map<string, SavedSearchAlert>();
            local.forEach((a) => byId.set(a.id, a));
            remote.savedAlerts.forEach((a) => byId.set(a.id, a));
            return Array.from(byId.values()).slice(0, 25);
          });
          setPreferences(remote.preferences);
          if (remote.readNotificationIds.length > 0) {
            const readSet = new Set(remote.readNotificationIds);
            setNotifications((prev) =>
              prev.map((item) => (readSet.has(item.id) ? { ...item, read: true } : item))
            );
          }
          setCloudSyncStatus('synced');
        } else {
          setCloudSyncStatus('idle');
        }
      } catch {
        if (!cancelled) setCloudSyncStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, hasHydrated]);

  const syncNowToCloud = useCallback(async (): Promise<boolean> => {
    if (!user || !user.emailVerified) return false;
    setCloudSyncStatus('syncing');
    try {
      const { saveUserAlertPreferencesToCloud } = await import('../services/userAlertCloudSync');
      const readIds = notificationsRef.current
        .filter((n) => n.read)
        .map((n) => n.id)
        .slice(0, 200);
      const ok = await saveUserAlertPreferencesToCloud(user, {
        savedAlerts: alertsRef.current,
        preferences: prefsRef.current,
        readNotificationIds: readIds,
      });
      setCloudSyncStatus(ok ? 'synced' : 'error');
      return ok;
    } catch {
      setCloudSyncStatus('error');
      return false;
    }
  }, [user]);

  // Debounced background cloud sync whenever signed-in user updates alerts/preferences/read state
  useEffect(() => {
    if (!hasHydrated || !user || !user.emailVerified) return;
    if (cloudSyncTimerRef.current) {
      window.clearTimeout(cloudSyncTimerRef.current);
    }
    cloudSyncTimerRef.current = window.setTimeout(() => {
      void syncNowToCloud();
    }, 1500);
    return () => {
      if (cloudSyncTimerRef.current) {
        window.clearTimeout(cloudSyncTimerRef.current);
      }
    };
  }, [savedAlerts, preferences, notifications, user, hasHydrated, syncNowToCloud]);

  const dispatchBrowserNotification = useCallback(
    (item: InAppNotificationItem) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const isHi = lang === 'hi';
      const heading =
        item.kind === 'status_update'
          ? isHi
            ? `अपडेट: ${item.matchedAlertName}`
            : `Update: ${item.matchedAlertName}`
          : isHi
            ? `नई भर्ती अलर्ट: ${item.matchedAlertName}`
            : `New Job Alert: ${item.matchedAlertName}`;
      const bodyTitle = isHi ? item.titleHi || item.title : item.title;
      const postsInfo = item.totalPosts ? ` · ${item.totalPosts} ${isHi ? 'पद' : 'Posts'}` : '';

      try {
        const nativeNotif = new Notification(heading, {
          body: `${bodyTitle}${postsInfo}`,
          tag: item.id,
        });
        nativeNotif.onclick = () => {
          window.focus();
          const matchedVacancy = vacancies.find((v) => v.id === item.vacancyId);
          if (matchedVacancy) {
            handleSelectVacancy(matchedVacancy);
          }
          nativeNotif.close();
        };
      } catch {}
    },
    [lang, vacancies, handleSelectVacancy]
  );

  // 4. Real-time Vacancy Monitor: reacts when new postings arrive via Firestore onSnapshot or status changes
  useEffect(() => {
    if (!hasHydrated || vacancies.length === 0) return;

    // First snapshot establishes baseline of already-known vacancy IDs & statuses without firing popups
    if (!hasSeededVacancyBaselineRef.current) {
      hasSeededVacancyBaselineRef.current = true;
      const nextStatusMap: Record<string, JobStatusType> = {};
      vacancies.forEach((v) => {
        nextStatusMap[v.id] = v.status;
        seenVacancyIdsRef.current.add(v.id);
      });
      prevStatusMapRef.current = nextStatusMap;
      try {
        localStorage.setItem(
          STORAGE_KEY_SEEN_VACANCY_IDS,
          JSON.stringify(Array.from(seenVacancyIdsRef.current).slice(-300))
        );
      } catch {}
      return;
    }

    const activeAlerts = alertsRef.current.filter((a) => a.enabled);
    const prefs = prefsRef.current;
    const newlyGenerated: InAppNotificationItem[] = [];
    const existingIds = new Set(notificationsRef.current.map((n) => n.id));
    let seenChanged = false;

    vacancies.forEach((vacancy) => {
      const isNewPosting = !seenVacancyIdsRef.current.has(vacancy.id);
      const prevStatus = prevStatusMapRef.current[vacancy.id];
      const isImportantStatusChange =
        !isNewPosting &&
        Boolean(prevStatus) &&
        prevStatus !== vacancy.status &&
        (vacancy.status === 'active' ||
          vacancy.status === 'admit_card_out' ||
          vacancy.status === 'result_declared' ||
          vacancy.status === 'answer_key_out');

      if (isNewPosting) {
        seenVacancyIdsRef.current.add(vacancy.id);
        seenChanged = true;
      }
      prevStatusMapRef.current[vacancy.id] = vacancy.status;

      if (activeAlerts.length === 0) return;
      if (!isNewPosting && !(isImportantStatusChange && prefs.notifyOnStatusChange)) return;

      for (const alert of activeAlerts) {
        const result = matchVacancyAgainstAlert(vacancy, alert);
        if (!result.matched) continue;

        const kind = isNewPosting ? 'new_job' : 'status_update';
        const candidate = createNotificationFromMatch(vacancy, alert, result.reasons, kind);
        if (existingIds.has(candidate.id)) continue;

        existingIds.add(candidate.id);
        newlyGenerated.push(candidate);

        if (prefs.browserPushEnabled && alert.notifyBrowserPush && !prefs.quietMode) {
          dispatchBrowserNotification(candidate);
        }
        // Only one notification per newly arrived vacancy (first matching alert rule)
        break;
      }
    });

    if (seenChanged) {
      try {
        localStorage.setItem(
          STORAGE_KEY_SEEN_VACANCY_IDS,
          JSON.stringify(Array.from(seenVacancyIdsRef.current).slice(-300))
        );
      } catch {}
    }

    if (newlyGenerated.length > 0 && prefs.inAppEnabled) {
      setNotifications((prev) => [...newlyGenerated, ...prev].slice(0, 80));
      if (prefs.inAppBannerPopup && !prefs.quietMode) {
        setLiveToastAlert(newlyGenerated[0]);
      }
    }
  }, [vacancies, hasHydrated, dispatchBrowserNotification]);

  const openNotificationDrawer = useCallback((tab: NotificationDrawerTab = 'inbox') => {
    setActiveDrawerTab(tab);
    setIsDrawerOpen(true);
  }, []);

  const openSaveSearchBuilder = useCallback((prefill?: AlertDraftPrefill) => {
    setPrefillDraft(prefill || {});
    setActiveDrawerTab('alerts');
    setIsDrawerOpen(true);
  }, []);

  const clearPrefillDraft = useCallback(() => {
    setPrefillDraft(null);
  }, []);

  const dismissLiveToastAlert = useCallback(() => {
    setLiveToastAlert(null);
  }, []);

  const createAlert = useCallback(
    (draft: Omit<SavedSearchAlert, 'id' | 'createdAt'>) => {
      const newAlert: SavedSearchAlert = sanitizeSavedAlerts([
        {
          ...draft,
          id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        },
      ])[0];

      setSavedAlerts((prev) => [newAlert, ...prev].slice(0, 25));

      // Scan active vacancies immediately and populate up to 5 latest matching alerts into Inbox
      const sortedMatches = [...findMatchingVacanciesForAlert(vacancies, newAlert)].sort(
        compareVacanciesNewestFirst
      );

      if (sortedMatches.length > 0 && prefsRef.current.inAppEnabled && newAlert.notifyInApp) {
        const freshItems = sortedMatches.slice(0, 5).map((vacancy) => {
          const { reasons } = matchVacancyAgainstAlert(vacancy, newAlert);
          return createNotificationFromMatch(vacancy, newAlert, reasons, 'saved_search_match');
        });

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const uniqueFresh = freshItems.filter((item) => !existingIds.has(item.id));
          return [...uniqueFresh, ...prev].slice(0, 80);
        });
      }

      showToast(
        lang === 'hi'
          ? `जॉब अलर्ट सेव हुआ — ${sortedMatches.length} सक्रिय भर्तियां मिलीं`
          : `Job alert saved — ${sortedMatches.length} active matches found`
      );

      return { alert: newAlert, matchedCount: sortedMatches.length };
    },
    [vacancies, lang, showToast]
  );

  const updateAlert = useCallback(
    (id: string, updates: Partial<Omit<SavedSearchAlert, 'id' | 'createdAt'>>) => {
      setSavedAlerts((prev) =>
        sanitizeSavedAlerts(prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
      );
      showToast(lang === 'hi' ? 'जॉब अलर्ट अपडेट किया गया' : 'Job alert updated');
    },
    [lang, showToast]
  );

  const deleteAlert = useCallback(
    (id: string) => {
      setSavedAlerts((prev) => prev.filter((item) => item.id !== id));
      showToast(lang === 'hi' ? 'जॉब अलर्ट हटाया गया' : 'Job alert removed');
    },
    [lang, showToast]
  );

  const toggleAlertEnabled = useCallback((id: string) => {
    setSavedAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
  }, []);

  const clearReadNotifications = useCallback(() => {
    setNotifications((prev) => prev.filter((item) => !item.read));
  }, []);

  const updatePreferences = useCallback((patch: Partial<NotificationDeliveryPreferences>) => {
    setPreferences((prev) => sanitizeNotificationPreferences({ ...prev, ...patch }));
  }, []);

  const requestBrowserPushPermission = useCallback(async (): Promise<
    NotificationPermission | 'unsupported'
  > => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      if (result === 'granted') {
        setPreferences((prev) => ({ ...prev, browserPushEnabled: true }));
        showToast(
          lang === 'hi'
            ? 'ब्राउज़र नोटिफिकेशन सक्रिय हो गए हैं'
            : 'Browser notifications enabled'
        );
      } else {
        setPreferences((prev) => ({ ...prev, browserPushEnabled: false }));
      }
      return result;
    } catch {
      return Notification.permission;
    }
  }, [lang, showToast]);

  const triggerTestNotification = useCallback(() => {
    const sorted = [...vacancies].sort(compareVacanciesNewestFirst);
    const activeAlert = savedAlerts.find((a) => a.enabled);
    const matchedJob: VacancyItem | undefined = activeAlert
      ? findMatchingVacanciesForAlert(sorted, activeAlert)[0] || sorted[0]
      : sorted[0];

    if (!matchedJob) return;

    const testItem: InAppNotificationItem = {
      id: `notif_test_${Date.now()}`,
      vacancyId: matchedJob.id,
      title: matchedJob.title,
      titleHi: matchedJob.titleHi || matchedJob.title,
      organization: matchedJob.organization,
      category: matchedJob.category,
      totalPosts: matchedJob.totalPosts,
      applyLastDate: matchedJob.importantDates?.applyLastDate,
      matchedAlertId: activeAlert?.id || 'preview',
      matchedAlertName: activeAlert?.name || (lang === 'hi' ? 'टेस्ट जॉब अलर्ट' : 'Test Job Alert'),
      matchReasons: [
        matchedJob.organization,
        lang === 'hi' ? 'लाइव अलर्ट प्रीव्यू' : 'Live Alert Preview',
      ],
      kind: 'new_job',
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [testItem, ...prev].slice(0, 80));
    setLiveToastAlert(testItem);

    if (preferences.browserPushEnabled && browserPermission === 'granted') {
      dispatchBrowserNotification(testItem);
    }
  }, [vacancies, savedAlerts, lang, preferences.browserPushEnabled, browserPermission, dispatchBrowserNotification]);

  const openNotificationVacancy = useCallback(
    (item: InAppNotificationItem) => {
      markAsRead(item.id);
      setIsDrawerOpen(false);
      setLiveToastAlert(null);
      const found = vacancies.find((v) => v.id === item.vacancyId);
      if (found) {
        handleSelectVacancy(found);
      }
    },
    [vacancies, markAsRead, handleSelectVacancy]
  );

  const unreadCount = useMemo(
    () => notifications.reduce((acc, item) => acc + (item.read ? 0 : 1), 0),
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
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
        liveToastAlert,
        dismissLiveToastAlert,
        browserPermission,
        cloudSyncStatus,
        openNotificationDrawer,
        openSaveSearchBuilder,
        createAlert,
        updateAlert,
        deleteAlert,
        toggleAlertEnabled,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearReadNotifications,
        updatePreferences,
        requestBrowserPushPermission,
        triggerTestNotification,
        openNotificationVacancy,
        syncNowToCloud,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

export function useOptionalNotifications() {
  return useContext(NotificationContext);
}
