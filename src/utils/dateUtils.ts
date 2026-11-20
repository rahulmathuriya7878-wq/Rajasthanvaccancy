/**
 * Date formatting and normalization utilities for Rajasthan Vacancy portal.
 * Ensures all dates (Notification date, Apply Start date, Apply Last date,
 * Admit card date, Exam date, Fee payment last date) are synchronized across all sections.
 */

export const formatDisplayDate = (dateVal?: string | null, fallback = 'शीघ्र'): string => {
  if (!dateVal || typeof dateVal !== 'string') return fallback;
  const trimmed = dateVal.trim();
  if (!trimmed || trimmed === 'TBA' || trimmed === '0000-00-00') return fallback;

  // 1. Direct match for YYYY-MM-DD (e.g. 2026-10-24 -> 24/10/2026)
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  // 2. Direct match for DD-MM-YYYY (e.g. 24-10-2026 -> 24/10/2026)
  const dmyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // 3. Direct match for YYYY-MM-DDTHH:mm(:ss)
  const ymdTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (ymdTimeMatch) {
    const [, year, month, day, hStr, mStr] = ymdTimeMatch;
    let hour = parseInt(hStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const hourFormatted = String(hour).padStart(2, '0');
    return `${day}/${month}/${year} | ${hourFormatted}:${mStr} ${ampm}`;
  }

  // 4. Try parsing with native Date if it's a valid standard date string without Hindi month names
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime()) && !trimmed.includes('अक्टूबर') && !trimmed.includes('नवंबर') && !trimmed.includes('जनवरी') && !trimmed.includes('फरवरी') && !trimmed.includes('मार्च')) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // fallback if parsing fails
  }

  return trimmed;
};

export interface IntegratedJobDates {
  notificationDate: string;
  applyStartDate: string;
  applyLastDate: string;
  feeLastDate: string;
  admitCardDate: string;
  examDate: string;
}

/**
 * Centralized extractor that seamlessly resolves the 4 primary dates + fee & exam dates
 * regardless of whether importantDates is stored as an object or as an array of items.
 */
export const resolveJobDates = (v?: any): IntegratedJobDates => {
  if (v?.category === 'scheme') {
    return {
      notificationDate: '',
      applyStartDate: '',
      applyLastDate: '',
      feeLastDate: '',
      admitCardDate: '',
      examDate: ''
    };
  }

  if (!v) {
    return {
      notificationDate: 'शीघ्र',
      applyStartDate: 'शीघ्र',
      applyLastDate: 'शीघ्र',
      feeLastDate: 'शीघ्र',
      admitCardDate: 'परीक्षा से 7 दिन पूर्व',
      examDate: 'यथासमय घोषित'
    };
  }

  const raw = v.importantDates;
  let notif = '';
  let applyStart = '';
  let applyLast = '';
  let feeLast = '';
  let admitCard = '';
  let exam = '';

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    notif = raw.notificationDate || raw.notificationReleased || raw.releasedDate || '';
    applyStart = raw.applyStartDate || raw.applicationBegin || raw.startDate || '';
    applyLast = raw.applyLastDate || raw.lastDate || '';
    feeLast = raw.feeLastDate || raw.payFeeLastDate || raw.applyLastDate || '';
    admitCard = raw.admitCardDate || raw.admitCardAvailable || '';
    exam = raw.examDate || raw.examSchedule || '';
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      const lbl = String(item?.label || '').toLowerCase();
      const val = String(item?.value || '');
      if (!notif && (item?.key === 'notificationDate' || lbl.includes('notif') || lbl.includes('अधिसूचना') || lbl.includes('विज्ञप्ति') || lbl.includes('released'))) {
        notif = val;
      } else if (!applyStart && (item?.key === 'applyStartDate' || lbl.includes('begin') || lbl.includes('start') || lbl.includes('शुरू') || lbl.includes('प्रारंभ') || lbl.includes('आवेदन'))) {
        applyStart = val;
      } else if (!applyLast && (item?.key === 'applyLastDate' || lbl.includes('last') || lbl.includes('अंतिम') || lbl.includes('समाप्त'))) {
        applyLast = val;
      } else if (!feeLast && (item?.key === 'feeLastDate' || lbl.includes('fee') || lbl.includes('शुल्क'))) {
        feeLast = val;
      } else if (!admitCard && (item?.key === 'admitCardDate' || lbl.includes('admit') || lbl.includes('एडमिट') || lbl.includes('प्रवेश पत्र'))) {
        admitCard = val;
      } else if (!exam && (item?.key === 'examDate' || lbl.includes('exam') || lbl.includes('परीक्षा'))) {
        exam = val;
      }
    }
  }

  // Fallbacks if not set in importantDates
  if (!notif) notif = v.updatedAt || v.createdAt || 'नवंबर 2026';
  if (!applyStart) applyStart = v.createdAt || 'शीघ्र';
  if (!applyLast) applyLast = 'शीघ्र';
  if (!feeLast) feeLast = applyLast;
  if (!admitCard) admitCard = 'परीक्षा से 7 दिन पूर्व';
  if (!exam) exam = 'यथासमय घोषित';

  return {
    notificationDate: notif,
    applyStartDate: applyStart,
    applyLastDate: applyLast,
    feeLastDate: feeLast,
    admitCardDate: admitCard,
    examDate: exam
  };
};

const HINDI_MONTH_MAP: Record<string, number> = {
  'जनवरी': 0,
  'फरवरी': 1,
  'मार्च': 2,
  'अप्रैल': 3,
  'मई': 4,
  'जून': 5,
  'जुलाई': 6,
  'अगस्त': 7,
  'सितंबर': 8,
  'अक्टूबर': 9,
  'नवंबर': 10,
  'नवम्बर': 10,
  'दिसंबर': 11,
  'दिसम्बर': 11,
};

/**
 * Parses ISO dates (YYYY-MM-DD), DD/MM/YYYY, Hindi dates ("13 नवंबर 2026"),
 * or "अभी-अभी / Just Now" strings into comparable epoch milliseconds.
 */
export const parseVacancyTimestamp = (val?: string | null): number => {
  if (!val || typeof val !== 'string') return 0;
  const trimmed = val.trim();
  if (!trimmed) return 0;

  if (trimmed.includes('अभी') || trimmed.toLowerCase().includes('just now')) {
    return Number.MAX_SAFE_INTEGER;
  }

  // YYYY-MM-DD (or full ISO)
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymd) {
    const [, y, m, d, hh = '0', mm = '0', ss = '0'] = ymd;
    return Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return Date.UTC(Number(y), Number(m) - 1, Number(d));
  }

  // Hindi month e.g. "13 नवंबर 2026"
  for (const [mName, mIdx] of Object.entries(HINDI_MONTH_MAP)) {
    if (trimmed.includes(mName)) {
      const nums = trimmed.match(/\d+/g);
      if (nums && nums.length >= 1) {
        const day = nums.find(n => n.length <= 2) ? Number(nums.find(n => n.length <= 2)) : 1;
        const year = nums.find(n => n.length === 4) ? Number(nums.find(n => n.length === 4)) : 2026;
        return Date.UTC(year, mIdx, day);
      }
    }
  }

  const parsed = Date.parse(trimmed);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Deterministic comparator placing newly added posts (addedAtMs / "अभी-अभी" / newest date)
 * strictly at the very top while preserving array insertion order on ties.
 */
export const compareVacanciesNewestFirst = (
  a: { addedAtMs?: number; updatedAt?: string; createdAt?: string; importantDates?: any },
  b: { addedAtMs?: number; updatedAt?: string; createdAt?: string; importantDates?: any }
): number => {
  const addedDiff = (b.addedAtMs || 0) - (a.addedAtMs || 0);
  if (addedDiff !== 0) return addedDiff;

  const tsA = Math.max(
    parseVacancyTimestamp(a.updatedAt),
    parseVacancyTimestamp(a.createdAt),
    parseVacancyTimestamp(a.importantDates?.notificationDate)
  );
  const tsB = Math.max(
    parseVacancyTimestamp(b.updatedAt),
    parseVacancyTimestamp(b.createdAt),
    parseVacancyTimestamp(b.importantDates?.notificationDate)
  );

  if (tsB !== tsA) return tsB - tsA;
  return 0;
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

const isValidUtcDate = (year: number, monthIndex: number, day: number): boolean => {
  if (year < 1990 || year > 2100 || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, monthIndex, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === monthIndex && d.getUTCDate() === day;
};

const formatUtcIsoDate = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

const addDaysIsoDate = (isoYmd: string, days: number): string => {
  const m = isoYmd.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '2026-12-31';
  const baseMs = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return formatUtcIsoDate(baseMs + days * 86_400_000);
};

/**
 * Converts any date string (ISO 8601, DD/MM/YYYY, Hindi month string, or English month string)
 * into a guaranteed valid ISO 8601 date string (`YYYY-MM-DD` or validated ISO timestamp).
 * Non-date descriptive text falls back safely to `fallbackIso`.
 */
export const toIso8601DateString = (
  val?: string | null,
  fallbackIso = '2026-12-31',
  preserveTimestamp = false
): string => {
  const safeFallback = /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(fallbackIso) ? fallbackIso : '2026-12-31';
  if (!val || typeof val !== 'string') return safeFallback;

  const trimmed = val.trim();
  if (!trimmed) return safeFallback;

  const lower = trimmed.toLowerCase();
  if (
    trimmed.includes('अभी') ||
    lower.includes('just now') ||
    trimmed.includes('शीघ्र') ||
    lower === 'tba' ||
    trimmed === '0000-00-00'
  ) {
    if (trimmed.includes('अभी') || lower.includes('just now')) {
      return formatUtcIsoDate(Date.now());
    }
    return safeFallback;
  }

  // 1. Exact full ISO 8601 timestamp with timezone/offset or YYYY-MM-DD
  const isoFullMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/
  );
  if (isoFullMatch) {
    const year = Number(isoFullMatch[1]);
    const month = Number(isoFullMatch[2]) - 1;
    const day = Number(isoFullMatch[3]);
    if (isValidUtcDate(year, month, day)) {
      if (preserveTimestamp && isoFullMatch[4]) {
        const hh = isoFullMatch[4];
        const mm = isoFullMatch[5] || '00';
        const ss = isoFullMatch[6] || '00';
        const tz = isoFullMatch[7] || '+05:30';
        return `${year}-${pad2(month + 1)}-${pad2(day)}T${hh}:${mm}:${ss}${tz}`;
      }
      return `${year}-${pad2(month + 1)}-${pad2(day)}`;
    }
    return safeFallback;
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]) - 1;
    const year = Number(dmyMatch[3]);
    if (isValidUtcDate(year, month, day)) {
      return `${year}-${pad2(month + 1)}-${pad2(day)}`;
    }
    return safeFallback;
  }

  // 3. Hindi month formats (e.g. "28 अक्टूबर 2026" or "अक्टूबर 2026")
  for (const [mName, mIdx] of Object.entries(HINDI_MONTH_MAP)) {
    if (trimmed.includes(mName)) {
      const yearMatch = trimmed.match(/\b(20\d{2}|19\d{2})\b/);
      const year = yearMatch ? Number(yearMatch[1]) : 2026;
      const withoutYear = yearMatch ? trimmed.replace(yearMatch[0], '') : trimmed;
      const dayMatch = withoutYear.match(/\b([1-9]|[12]\d|3[01])\b/);
      const day = dayMatch ? Number(dayMatch[1]) : 1;
      if (isValidUtcDate(year, mIdx, day)) {
        return `${year}-${pad2(mIdx + 1)}-${pad2(day)}`;
      }
    }
  }

  // 4. Strict standard English date strings (only if trimmed actually contains a month name or ISO/slash pattern)
  if (/[a-z]{3}/i.test(trimmed) && /\b\d{4}\b/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      return formatUtcIsoDate(parsed);
    }
  }

  return safeFallback;
};

/**
 * Resolves strictly valid ISO 8601 `datePosted` and `validThrough` fields for Schema.org JobPosting/Article.
 * Guarantees `validThrough` is always a valid ISO 8601 date and never precedes `datePosted`.
 */
export const resolveJobSchemaDates = (v?: {
  createdAt?: string | null;
  updatedAt?: string | null;
  importantDates?: any;
}): { datePosted: string; validThrough: string } => {
  const defaultPosted = '2026-11-16';
  const rawNotif =
    v?.importantDates && !Array.isArray(v.importantDates)
      ? v.importantDates.notificationDate
      : Array.isArray(v?.importantDates)
        ? v.importantDates.find((d: any) => d?.key === 'notificationDate')?.value
        : undefined;
  const rawLastDate =
    v?.importantDates && !Array.isArray(v.importantDates)
      ? v.importantDates.applyLastDate || v.importantDates.feeLastDate
      : Array.isArray(v?.importantDates)
        ? v.importantDates.find((d: any) => d?.key === 'applyLastDate' || d?.key === 'feeLastDate')?.value
        : undefined;

  const datePosted = toIso8601DateString(
    v?.createdAt || rawNotif || v?.updatedAt,
    defaultPosted
  );

  const defaultValidThrough = addDaysIsoDate(datePosted, 45);
  let validThrough = toIso8601DateString(rawLastDate, defaultValidThrough);

  // Google Rich Results requires validThrough >= datePosted
  if (validThrough < datePosted) {
    validThrough = defaultValidThrough;
  }

  return { datePosted, validThrough };
};

/**
 * Formats any recognized date string (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, Hindi/English month dates)
 * strictly as DD/MM/YYYY (e.g., 16/11/2026). Descriptive non-date strings are preserved as-is.
 */
export const formatDateDDMMYYYY = (dateVal?: string | null, fallback = 'शीघ्र'): string => {
  if (!dateVal || typeof dateVal !== 'string') return fallback;
  const trimmed = dateVal.trim();
  if (!trimmed || trimmed.toUpperCase() === 'TBA' || trimmed === '0000-00-00') return fallback;

  const sentinel = '1900-01-01';
  const iso = toIso8601DateString(trimmed, sentinel);
  if (iso !== sentinel) {
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  return trimmed;
};

export const AUTO_DELETE_MAX_AGE_DAYS = 70;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ExpirablePostLike {
  category?: string;
  organization?: string;
  tags?: string[];
  addedAtMs?: number;
  updatedAt?: string;
  createdAt?: string;
  importantDates?: any;
}

/**
 * Sarkari Yojana (scheme) posts are evergreen government schemes and are permanently exempt from auto-delete.
 */
export const isYojanaPost = (v?: ExpirablePostLike | null): boolean => {
  if (!v) return false;
  return (
    v.category === 'scheme' ||
    v.organization === 'Sarkari Yojana' ||
    (Array.isArray(v.tags) && v.tags.some((t) => typeof t === 'string' && t.toLowerCase() === 'yojana'))
  );
};

/**
 * Resolves the effective publish/update timestamp (UTC epoch ms) for a post.
 */
export const getPostPublishedTimestamp = (v?: ExpirablePostLike | null): number => {
  if (!v) return 0;
  if (typeof v.addedAtMs === 'number' && Number.isFinite(v.addedAtMs) && v.addedAtMs > 0) {
    return v.addedAtMs;
  }
  const primaryTs = Math.max(
    parseVacancyTimestamp(v.updatedAt),
    parseVacancyTimestamp(v.createdAt)
  );
  if (primaryTs > 0) return primaryTs;
  return parseVacancyTimestamp(v.importantDates?.notificationDate);
};

/**
 * Returns true when a post is strictly older than `maxAgeDays` (default 70 days)
 * and should be automatically deleted from active listings, sitemaps, and feeds.
 * Sarkari Yojana (scheme) posts are exempt from auto-delete and always return false.
 */
export const isPostOlderThanDays = (
  v?: ExpirablePostLike | null,
  maxAgeDays = AUTO_DELETE_MAX_AGE_DAYS,
  referenceNowMs = Date.now()
): boolean => {
  if (!v || isYojanaPost(v)) return false;
  const postTs = getPostPublishedTimestamp(v);
  if (!postTs || postTs === Number.MAX_SAFE_INTEGER) return false;

  if (typeof v.addedAtMs === 'number' && Number.isFinite(v.addedAtMs) && v.addedAtMs > 0) {
    return referenceNowMs - v.addedAtMs > maxAgeDays * DAY_MS;
  }

  const refDate = new Date(referenceNowMs);
  const todayUtcMidnight = Date.UTC(
    refDate.getUTCFullYear(),
    refDate.getUTCMonth(),
    refDate.getUTCDate()
  );
  const cutoffUtcMidnight = todayUtcMidnight - maxAgeDays * DAY_MS;
  return postTs < cutoffUtcMidnight;
};

/**
 * Filters out non-Yojana posts older than `maxAgeDays` (default 70 days).
 * Sarkari Yojana (scheme) posts are always preserved.
 */
export const filterActivePostsWithinDays = <T extends ExpirablePostLike>(
  items: T[],
  maxAgeDays = AUTO_DELETE_MAX_AGE_DAYS,
  referenceNowMs = Date.now()
): T[] => {
  return items.filter((item) => !isPostOlderThanDays(item, maxAgeDays, referenceNowMs));
};
