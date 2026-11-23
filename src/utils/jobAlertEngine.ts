import type { BoardType, CategoryType, QualificationType, VacancyItem } from '../types';

export type DigestFrequency = 'instant' | 'daily' | 'weekly';

export interface SavedSearchAlert {
  id: string;
  name: string;
  keywords: string[];
  categories: CategoryType[];
  organizations: BoardType[];
  qualifications: QualificationType[];
  locationQuery: string;
  minPosts: number;
  enabled: boolean;
  notifyInApp: boolean;
  notifyBrowserPush: boolean;
  createdAt: string;
}

export interface NotificationDeliveryPreferences {
  inAppEnabled: boolean;
  inAppBannerPopup: boolean;
  browserPushEnabled: boolean;
  digestFrequency: DigestFrequency;
  notifyOnStatusChange: boolean;
  quietMode: boolean;
}

export type NotificationKind = 'new_job' | 'status_update' | 'saved_search_match';

export interface InAppNotificationItem {
  id: string;
  vacancyId: string;
  title: string;
  titleHi: string;
  organization: string;
  category: CategoryType;
  totalPosts: string | number;
  applyLastDate?: string;
  matchedAlertId: string;
  matchedAlertName: string;
  matchReasons: string[];
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
}

export interface AlertStarterTemplate {
  id: string;
  name: string;
  nameHi: string;
  summary: string;
  summaryHi: string;
  criteria: Omit<SavedSearchAlert, 'id' | 'createdAt' | 'enabled' | 'notifyInApp' | 'notifyBrowserPush'>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationDeliveryPreferences = {
  inAppEnabled: true,
  inAppBannerPopup: true,
  browserPushEnabled: false,
  digestFrequency: 'instant',
  notifyOnStatusChange: true,
  quietMode: false,
};

export const ALERT_CATEGORY_OPTIONS: Array<{ value: CategoryType; label: string; labelHi: string }> = [
  { value: 'latest_job', label: 'Latest Jobs', labelHi: 'सरकारी भर्तियां' },
  { value: 'admit_card', label: 'Admit Card', labelHi: 'प्रवेश पत्र' },
  { value: 'result', label: 'Results', labelHi: 'परीक्षा परिणाम' },
  { value: 'exam_date', label: 'Exam Dates', labelHi: 'परीक्षा तिथि' },
  { value: 'answer_key', label: 'Answer Key', labelHi: 'उत्तर कुंजी' },
  { value: 'syllabus', label: 'Syllabus', labelHi: 'सिलेबस' },
  { value: 'scheme', label: 'Sarkari Yojana', labelHi: 'सरकारी योजना' },
  { value: 'news', label: 'Latest News', labelHi: 'लेटेस्ट न्यूज़' },
];

export const ALERT_ORGANIZATION_OPTIONS: BoardType[] = [
  'RSMSSB',
  'RPSC',
  'Rajasthan Police',
  'Rajasthan High Court',
  'Education Department',
  'Health RUHS / NHM',
  'Discom / RVUNL',
  'Central Govt',
  'Railway Board',
  'Sarkari Yojana',
];

export const ALERT_QUALIFICATION_OPTIONS: Array<{ value: QualificationType; label: string }> = [
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'PostGraduate', label: 'Post Graduate' },
  { value: 'B.Ed/BSTC', label: 'B.Ed / BSTC' },
  { value: 'ITI/Diploma', label: 'ITI / Diploma' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Medical', label: 'Medical / Nursing' },
];

export const ALERT_STARTER_TEMPLATES: AlertStarterTemplate[] = [
  {
    id: 'tpl-rsmssb-rpsc',
    name: 'RSMSSB & RPSC Latest Jobs',
    nameHi: 'RSMSSB व RPSC नई भर्तियां',
    summary: 'Patwari, LDC, RAS, Assistant Professor & Rajasthan state recruitment',
    summaryHi: 'पटवारी, एलडीसी, आरएएस एवं राजस्थान राज्य की प्रमुख भर्तियां',
    criteria: {
      name: 'RSMSSB & RPSC Latest Jobs',
      keywords: [],
      categories: ['latest_job'],
      organizations: ['RSMSSB', 'RPSC'],
      qualifications: [],
      locationQuery: 'Rajasthan',
      minPosts: 0,
    },
  },
  {
    id: 'tpl-10th-12th',
    name: '10th & 12th Pass Bharti',
    nameHi: '10वीं व 12वीं पास भर्तियां',
    summary: 'Constable, Pashu Parichar, Clerk & Railway Group-D level posts',
    summaryHi: 'कांस्टेबल, पशु परिचर, क्लर्क व रेलवे स्तर की भर्तियां',
    criteria: {
      name: '10th & 12th Pass Bharti',
      keywords: [],
      categories: ['latest_job'],
      organizations: [],
      qualifications: ['10th', '12th'],
      locationQuery: '',
      minPosts: 0,
    },
  },
  {
    id: 'tpl-reet-teaching',
    name: 'REET & Teacher Recruitment',
    nameHi: 'REET व शिक्षक भर्ती अलर्ट',
    summary: 'REET, 1st/2nd/3rd Grade Teacher, B.Ed & BSTC vacancy updates',
    summaryHi: 'REET, 1st/2nd/3rd ग्रेड शिक्षक व शिक्षा विभाग की भर्तियां',
    criteria: {
      name: 'REET & Teacher Recruitment',
      keywords: ['REET', 'Teacher', 'शिक्षक', 'BSTC', 'RPSC'],
      categories: ['latest_job', 'exam_date', 'admit_card'],
      organizations: ['Education Department', 'RPSC', 'RSMSSB'],
      qualifications: ['B.Ed/BSTC', 'Graduate'],
      locationQuery: '',
      minPosts: 0,
    },
  },
  {
    id: 'tpl-admit-result',
    name: 'Admit Card & Exam Results',
    nameHi: 'एडमिट कार्ड व रिजल्ट अपडेट्स',
    summary: 'Instant notifications when exam dates, admit cards, or results drop',
    summaryHi: 'परीक्षा तिथि, प्रवेश पत्र और परिणाम जारी होते ही तुरंत अलर्ट',
    criteria: {
      name: 'Admit Card & Exam Results',
      keywords: [],
      categories: ['admit_card', 'result', 'answer_key', 'exam_date'],
      organizations: [],
      qualifications: [],
      locationQuery: '',
      minPosts: 0,
    },
  },
  {
    id: 'tpl-sarkari-yojana',
    name: 'Rajasthan Sarkari Yojana',
    nameHi: 'राजस्थान सरकारी योजनाएं',
    summary: 'Scholarships, subsidies, welfare schemes & citizen benefits',
    summaryHi: 'छात्रवृत्ति, सब्सिडी एवं राज्य सरकार की जनकल्याणकारी योजनाएं',
    criteria: {
      name: 'Rajasthan Sarkari Yojana',
      keywords: ['Yojana', 'योजना', 'Scholarship'],
      categories: ['scheme'],
      organizations: ['Sarkari Yojana'],
      qualifications: [],
      locationQuery: '',
      minPosts: 0,
    },
  },
];

export const STORAGE_KEY_USER_ALERTS = 'raj_user_saved_alerts_v1';
export const STORAGE_KEY_USER_PREFS = 'raj_user_notif_prefs_v1';
export const STORAGE_KEY_USER_NOTIFS = 'raj_user_notifications_v1';
export const STORAGE_KEY_SEEN_VACANCY_IDS = 'raj_user_seen_vacancy_ids_v1';

function parsePostsCount(totalPosts: number | string | undefined): number {
  if (typeof totalPosts === 'number' && Number.isFinite(totalPosts)) {
    return totalPosts;
  }
  if (typeof totalPosts === 'string') {
    const cleaned = totalPosts.replace(/,/g, '');
    const match = cleaned.match(/\d+/);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

export function getCategoryDisplayLabel(category: CategoryType, isHi: boolean): string {
  const found = ALERT_CATEGORY_OPTIONS.find((opt) => opt.value === category);
  if (!found) return category;
  return isHi ? found.labelHi : found.label;
}

export function matchVacancyAgainstAlert(
  vacancy: VacancyItem,
  alert: SavedSearchAlert
): { matched: boolean; reasons: string[] } {
  if (!alert.enabled) {
    return { matched: false, reasons: [] };
  }

  const reasons: string[] = [];

  // 1. Category check
  if (alert.categories.length > 0) {
    const matchesCategory = alert.categories.some((cat) => {
      if (vacancy.category === cat) return true;
      if (cat === 'admit_card' && vacancy.status === 'admit_card_out') return true;
      if (cat === 'result' && vacancy.status === 'result_declared') return true;
      if (cat === 'answer_key' && vacancy.status === 'answer_key_out') return true;
      if (cat === 'latest_job' && vacancy.category === 'ugc_net') return true;
      return false;
    });
    if (!matchesCategory) {
      return { matched: false, reasons: [] };
    }
    reasons.push(getCategoryDisplayLabel(vacancy.category, false));
  }

  // 2. Organization / Board check
  if (alert.organizations.length > 0) {
    const matchesOrg = alert.organizations.includes(vacancy.organization);
    if (!matchesOrg) {
      return { matched: false, reasons: [] };
    }
    reasons.push(vacancy.organization);
  }

  // 3. Qualification check (if specified, at least one qualification matches)
  if (alert.qualifications.length > 0) {
    const vacQuals = Array.isArray(vacancy.qualification) ? vacancy.qualification : [];
    const matchedQuals = alert.qualifications.filter((q) => vacQuals.includes(q));
    if (matchedQuals.length === 0) {
      return { matched: false, reasons: [] };
    }
    reasons.push(matchedQuals[0]);
  }

  // 4. Location filter (substring match against jobLocation, department, title)
  const locQuery = alert.locationQuery.trim().toLowerCase();
  if (locQuery) {
    const locCorpus = `${vacancy.jobLocation || ''} ${vacancy.department || ''} ${vacancy.title || ''} ${vacancy.titleHi || ''}`.toLowerCase();
    if (!locCorpus.includes(locQuery)) {
      return { matched: false, reasons: [] };
    }
    reasons.push(alert.locationQuery.trim());
  }

  // 5. Minimum posts threshold
  if (alert.minPosts > 0) {
    const postsNum = parsePostsCount(vacancy.totalPosts);
    if (postsNum < alert.minPosts) {
      return { matched: false, reasons: [] };
    }
    reasons.push(`${postsNum.toLocaleString('en-IN')}+ posts`);
  }

  // 6. Keywords check (any keyword matching title, Hindi title, department, postName, advtNo, tags, summary)
  const cleanKeywords = alert.keywords
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  if (cleanKeywords.length > 0) {
    const searchableText = [
      vacancy.title,
      vacancy.titleHi,
      vacancy.department,
      vacancy.departmentHi || '',
      vacancy.organization,
      vacancy.postName,
      vacancy.postNameHi,
      vacancy.advtNo,
      vacancy.briefSummary || '',
      vacancy.briefSummaryHi || '',
      ...(Array.isArray(vacancy.tags) ? vacancy.tags : []),
    ]
      .join(' ')
      .toLowerCase();

    const matchedKeyword = cleanKeywords.find((kw) => searchableText.includes(kw));
    if (!matchedKeyword) {
      return { matched: false, reasons: [] };
    }
    reasons.push(`Keyword: ${matchedKeyword}`);
  }

  // Require at least one configured filter or explicit "All Jobs" alert
  if (reasons.length === 0) {
    reasons.push('All New Postings');
  }

  return { matched: true, reasons: reasons.slice(0, 3) };
}

export function findMatchingVacanciesForAlert(
  vacancies: VacancyItem[],
  alert: SavedSearchAlert
): VacancyItem[] {
  return vacancies.filter((v) => matchVacancyAgainstAlert(v, alert).matched);
}

export function createNotificationFromMatch(
  vacancy: VacancyItem,
  alert: SavedSearchAlert,
  reasons: string[],
  kind: NotificationKind
): InAppNotificationItem {
  const idSuffix = kind === 'status_update' ? `status_${vacancy.status}` : kind;
  return {
    id: `notif_${vacancy.id}_${alert.id}_${idSuffix}`.slice(0, 150),
    vacancyId: vacancy.id,
    title: vacancy.title,
    titleHi: vacancy.titleHi || vacancy.title,
    organization: vacancy.organization,
    category: vacancy.category,
    totalPosts: vacancy.totalPosts,
    applyLastDate: vacancy.importantDates?.applyLastDate,
    matchedAlertId: alert.id,
    matchedAlertName: alert.name,
    matchReasons: reasons,
    kind,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function sanitizeSavedAlerts(alerts: SavedSearchAlert[]): SavedSearchAlert[] {
  return alerts.slice(0, 25).map((alert) => ({
    id: String(alert.id || `alert_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64),
    name: String(alert.name || 'Custom Job Alert').trim().slice(0, 80),
    keywords: Array.isArray(alert.keywords)
      ? alert.keywords
          .map((k) => String(k).trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 12)
      : [],
    categories: Array.isArray(alert.categories) ? alert.categories.slice(0, 10) : [],
    organizations: Array.isArray(alert.organizations) ? alert.organizations.slice(0, 12) : [],
    qualifications: Array.isArray(alert.qualifications) ? alert.qualifications.slice(0, 8) : [],
    locationQuery: String(alert.locationQuery || '').trim().slice(0, 60),
    minPosts: Number.isFinite(Number(alert.minPosts)) ? Math.max(0, Math.min(1000000, Number(alert.minPosts))) : 0,
    enabled: Boolean(alert.enabled),
    notifyInApp: alert.notifyInApp !== false,
    notifyBrowserPush: Boolean(alert.notifyBrowserPush),
    createdAt: typeof alert.createdAt === 'string' && alert.createdAt ? alert.createdAt : new Date().toISOString(),
  }));
}

export function sanitizeNotificationPreferences(
  prefs: Partial<NotificationDeliveryPreferences> | undefined | null
): NotificationDeliveryPreferences {
  const freq = prefs?.digestFrequency;
  return {
    inAppEnabled: prefs?.inAppEnabled !== false,
    inAppBannerPopup: prefs?.inAppBannerPopup !== false,
    browserPushEnabled: Boolean(prefs?.browserPushEnabled),
    digestFrequency: freq === 'daily' || freq === 'weekly' ? freq : 'instant',
    notifyOnStatusChange: prefs?.notifyOnStatusChange !== false,
    quietMode: Boolean(prefs?.quietMode),
  };
}

export function formatRelativeNotificationTime(isoString: string, isHi: boolean): string {
  const ts = Date.parse(isoString);
  if (!Number.isFinite(ts)) return isHi ? 'अभी' : 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return isHi ? 'अभी-अभी' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return isHi ? `${diffMin} मिनट पहले` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return isHi ? `${diffHr} घंटे पहले` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return isHi ? `${diffDay} दिन पहले` : `${diffDay}d ago`;
}
