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

/**
 * Returns a valid ISO 8601 date string for Google URL indexing and JobPosting Schema (datePosted / validThrough).
 */
export const getIsoDate = (dateVal?: string | null, defaultIso = '2026-10-24T07:00:00+00:00'): string => {
  if (!dateVal || typeof dateVal !== 'string') return defaultIso;
  const trimmed = dateVal.trim();
  if (!trimmed || trimmed === 'TBA' || trimmed === '0000-00-00') return defaultIso;

  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch (e) {
    // fallback
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T07:00:00+00:00`;
  }

  return defaultIso;
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
