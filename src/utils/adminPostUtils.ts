import type { VacancyItem } from '@/types';

const HINDI_MONTHS: Record<string, number> = {
  जनवरी: 0,
  फरवरी: 1,
  मार्च: 2,
  अप्रैल: 3,
  मई: 4,
  जून: 5,
  जुलाई: 6,
  अगस्त: 7,
  सितंबर: 8,
  सितम्बर: 8,
  अक्टूबर: 9,
  अक्तूबर: 9,
  नवंबर: 10,
  नवम्बर: 10,
  दिसंबर: 11,
  दिसम्बर: 11,
};

const EN_MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/**
 * Parses common ISO, DD/MM/YYYY, English, and Hindi date strings into a local start-of-day Date.
 */
function parseFlexibleVacancyDate(raw?: string | null): Date | null {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!text) return null;

  // ISO YYYY-MM-DD
  const isoMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dmyMatch) {
    const d = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Hindi format: "26 नवंबर 2026"
  for (const [monthHi, monthIdx] of Object.entries(HINDI_MONTHS)) {
    if (text.includes(monthHi)) {
      const m = text.match(new RegExp(`(\\d{1,2})\\s*${monthHi}\\s*,?\\s*(\\d{4})`));
      if (m) {
        const d = new Date(Number(m[2]), monthIdx, Number(m[1]));
        return Number.isNaN(d.getTime()) ? null : d;
      }
    }
  }

  // English format: "26 November 2026" or "Nov 26, 2026"
  const enDayFirst = text.toLowerCase().match(/\b(\d{1,2})\s+([a-z]{3,9})\s*,?\s*(\d{4})\b/);
  if (enDayFirst && EN_MONTHS[enDayFirst[2]] !== undefined) {
    const d = new Date(Number(enDayFirst[3]), EN_MONTHS[enDayFirst[2]], Number(enDayFirst[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const enMonthFirst = text.toLowerCase().match(/\b([a-z]{3,9})\s+(\d{1,2})\s*,?\s*(\d{4})\b/);
  if (enMonthFirst && EN_MONTHS[enMonthFirst[1]] !== undefined) {
    const d = new Date(Number(enMonthFirst[3]), EN_MONTHS[enMonthFirst[1]], Number(enMonthFirst[2]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function getDaysUntilLastDate(vacancy: VacancyItem, now: Date = new Date()): number | null {
  const lastDateRaw =
    vacancy.importantDates?.applyLastDate ||
    vacancy.yojanaOverview?.applyLastDate ||
    null;
  const parsed = parseFlexibleVacancyDate(lastDateRaw);
  if (!parsed) return null;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  return Math.round((targetStart - todayStart) / (24 * 60 * 60 * 1000));
}

export function isExpiringWithinDays(vacancy: VacancyItem, maxDays = 3, now: Date = new Date()): boolean {
  if (vacancy.status === 'closed') return false;
  const diff = getDaysUntilLastDate(vacancy, now);
  return diff !== null && diff >= 0 && diff <= maxDays;
}

export interface SeoAuditIssue {
  missingMetaDescription: boolean;
  missingLinks: boolean;
  isDraftOrUpcoming: boolean;
  reasons: string[];
}

export function auditVacancySeo(vacancy: VacancyItem): SeoAuditIssue {
  const metaDesc = (
    vacancy.seoSettings?.metaDescription ||
    vacancy.briefSummaryHi ||
    vacancy.briefSummary ||
    ''
  ).trim();
  const missingMetaDescription = metaDesc.length < 55;

  const hasApplyOrNotif = Boolean(
    vacancy.officialLinks?.applyOnlineUrl ||
      vacancy.officialLinks?.notificationPdfUrl ||
      (Array.isArray(vacancy.directLinks) && vacancy.directLinks.some((l) => Boolean(l.url)))
  );
  const missingLinks = !hasApplyOrNotif;
  const isDraftOrUpcoming = vacancy.status === 'upcoming';

  const reasons: string[] = [];
  if (missingMetaDescription) reasons.push('Meta description short/missing');
  if (missingLinks) reasons.push('Important links missing');
  if (isDraftOrUpcoming) reasons.push('Draft / Upcoming');

  return {
    missingMetaDescription,
    missingLinks,
    isDraftOrUpcoming,
    reasons,
  };
}

export interface WebPConversionResult {
  dataUrl: string;
  originalBytes: number;
  webpBytes: number;
  width: number;
  height: number;
  fileName: string;
}

/**
 * Compresses any uploaded image to WebP directly in the browser using Canvas
 * (zero server binary dependencies, works identically on Cloudflare Workers & Vercel).
 */
export async function convertImageFileToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 630,
  quality = 0.82
): Promise<WebPConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or unsupported image file.'));
      img.onload = () => {
        let targetW = img.naturalWidth || img.width;
        let targetH = img.naturalHeight || img.height;

        if (targetW > maxWidth || targetH > maxHeight) {
          const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
          targetW = Math.max(1, Math.round(targetW * ratio));
          targetH = Math.max(1, Math.round(targetH * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        const base64Body = webpDataUrl.split(',')[1] || '';
        const approxBytes = Math.round((base64Body.length * 3) / 4);
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'vacancy-cover';

        resolve({
          dataUrl: webpDataUrl,
          originalBytes: file.size,
          webpBytes: approxBytes,
          width: targetW,
          height: targetH,
          fileName: `${baseName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.webp`,
        });
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytesCompact(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
