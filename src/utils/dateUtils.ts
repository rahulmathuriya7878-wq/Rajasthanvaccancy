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
  if (!notif) notif = v.updatedAt || v.createdAt || 'अक्टूबर 2026';
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
