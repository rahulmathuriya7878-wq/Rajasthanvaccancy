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

export interface TableTemplateDefinition {
  id: string;
  label: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  headers: string[];
  defaultRows: string[][];
}

export const RESULT_DETAILS_TABLE_TEMPLATE: TableTemplateDefinition = {
  id: 'result-details',
  label: 'Result Details (Category | Cut-off Marks)',
  title: 'Result Details',
  titleHi: 'Result Details',
  content: 'Category-wise Cut-off Marks:',
  contentHi: 'श्रेणीवार कट-ऑफ अंक (Cut-off Marks) नीचे तालिका में देखें:',
  headers: ['Category', 'Cut-off Marks'],
  defaultRows: [
    ['General (UR)', ''],
    ['OBC (NCL)', ''],
    ['EWS', ''],
    ['SC', ''],
    ['ST', ''],
  ],
};

export interface PersistentResultTemplate {
  templateId: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  headers: string[];
  defaultRows: string[][];
  autoGenerateOnResult: boolean;
}

export function getDefaultPersistentResultTemplate(): PersistentResultTemplate {
  return {
    templateId: RESULT_DETAILS_TABLE_TEMPLATE.id,
    title: RESULT_DETAILS_TABLE_TEMPLATE.title,
    titleHi: RESULT_DETAILS_TABLE_TEMPLATE.titleHi,
    content: RESULT_DETAILS_TABLE_TEMPLATE.content,
    contentHi: RESULT_DETAILS_TABLE_TEMPLATE.contentHi,
    headers: [...RESULT_DETAILS_TABLE_TEMPLATE.headers],
    defaultRows: RESULT_DETAILS_TABLE_TEMPLATE.defaultRows.map((row) => [...row]),
    autoGenerateOnResult: true,
  };
}

export function normalizePersistentResultTemplate(
  raw?: Partial<PersistentResultTemplate> | null
): PersistentResultTemplate {
  const defaults = getDefaultPersistentResultTemplate();
  if (!raw || typeof raw !== 'object') return defaults;

  const title =
    (typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : defaults.title).slice(
      0,
      150
    );
  const titleHi =
    (typeof raw.titleHi === 'string' && raw.titleHi.trim()
      ? raw.titleHi.trim()
      : title || defaults.titleHi
    ).slice(0, 150);
  const content = (typeof raw.content === 'string' ? raw.content : defaults.content).slice(0, 1000);
  const contentHi = (typeof raw.contentHi === 'string' ? raw.contentHi : defaults.contentHi).slice(
    0,
    1000
  );

  const rawHeaders = Array.isArray(raw.headers)
    ? raw.headers.map((h) => (typeof h === 'string' ? h.trim().slice(0, 100) : ''))
    : [...defaults.headers];

  // Track non-Download-Link column indices to keep existing cell alignment when migrating old templates
  const keptIndices: number[] = [];
  rawHeaders.forEach((h, idx) => {
    if (!h) return;
    if (h.toLowerCase() === 'download link') return;
    keptIndices.push(idx);
  });

  let headers = keptIndices.map((idx) => rawHeaders[idx]).slice(0, 10);

  // Guarantee the canonical 'Category' and 'Cut-off Marks' columns exist
  const requiredCols = ['Category', 'Cut-off Marks'];
  const lowerHeaders = headers.map((h) => h.toLowerCase());
  const hasCategory = lowerHeaders.some((h) => h.includes('category'));
  const hasCutoff = lowerHeaders.some((h) => h.includes('cut') || h.includes('marks'));

  const useKeptIndexMapping = hasCategory && hasCutoff && headers.length > 0;
  if (!useKeptIndexMapping) {
    const extraCols = headers.filter((h) => {
      const l = h.toLowerCase();
      return !l.includes('category') && !l.includes('cut') && !l.includes('marks');
    });
    headers = [...requiredCols, ...extraCols].slice(0, 10);
  }

  const rawRows = Array.isArray(raw.defaultRows) ? raw.defaultRows : defaults.defaultRows;
  const normalizedRows = rawRows
    .filter((r) => Array.isArray(r))
    .slice(0, 50)
    .map((row) =>
      useKeptIndexMapping
        ? keptIndices.slice(0, headers.length).map((origIdx) => String(row[origIdx] ?? '').slice(0, 500))
        : headers.map((_, colIdx) => String(row[colIdx] ?? '').slice(0, 500))
    );

  return {
    templateId: RESULT_DETAILS_TABLE_TEMPLATE.id,
    title,
    titleHi,
    content,
    contentHi,
    headers,
    defaultRows:
      normalizedRows.length > 0
        ? normalizedRows
        : defaults.defaultRows.map((r) => headers.map((_, idx) => r[idx] ?? '')),
    autoGenerateOnResult:
      typeof raw.autoGenerateOnResult === 'boolean' ? raw.autoGenerateOnResult : true,
  };
}

export function createResultDetailsTableData(
  defaultDownloadUrl = '',
  template?: PersistentResultTemplate | null
): {
  id: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  headers: string[];
  rows: string[][];
} {
  const tpl = normalizePersistentResultTemplate(template);
  const candidateUrl = defaultDownloadUrl.trim();
  const safeUrl = validateDownloadLinkUrl(candidateUrl).valid ? candidateUrl : '';
  const linkColIndices = new Set(
    tpl.headers
      .map((h, idx) =>
        isDownloadLinkColumn(tpl.templateId, tpl.title, tpl.titleHi, h, idx) ? idx : -1
      )
      .filter((idx) => idx >= 0)
  );

  return {
    id: tpl.templateId,
    title: tpl.title,
    titleHi: tpl.titleHi,
    content: tpl.content,
    contentHi: tpl.contentHi,
    headers: [...tpl.headers],
    rows: tpl.defaultRows.map((row) =>
      tpl.headers.map((_, colIdx) => {
        const val = String(row[colIdx] ?? '');
        if (linkColIndices.has(colIdx) && !val.trim() && safeUrl) {
          return safeUrl;
        }
        return val;
      })
    ),
  };
}

export interface ParsedTableCellLink {
  label: string;
  url: string;
}

/**
 * Parses table cells such as:
 * - "https://ssc.gov.in/result.pdf"
 * - "[Download Result PDF](https://ssc.gov.in/result.pdf)"
 * - "Download PDF | https://ssc.gov.in/result.pdf"
 * Only allows http/https URLs for XSS safety.
 */
export function parseTableCellLink(rawCell?: string | null): ParsedTableCellLink | null {
  if (!rawCell || typeof rawCell !== 'string') return null;
  const trimmed = rawCell.trim();
  if (!trimmed) return null;

  // Markdown link: [Label](https://...)
  const mdMatch = trimmed.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/i);
  if (mdMatch) {
    return {
      label: mdMatch[1].trim() || 'Download Link',
      url: mdMatch[2].trim(),
    };
  }

  // Pipe syntax: Label | https://...
  const pipeMatch = trimmed.match(/^([^|]+)\|\s*(https?:\/\/\S+)$/i);
  if (pipeMatch) {
    return {
      label: pipeMatch[1].trim() || 'Download Link',
      url: pipeMatch[2].trim(),
    };
  }

  // Direct http/https URL
  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    const isPdf = /\.pdf(\?|#|$)/i.test(trimmed);
    return {
      label: isPdf ? 'Download PDF' : 'Download / Click Here',
      url: trimmed,
    };
  }

  return null;
}

export interface CellValidationResult {
  valid: boolean;
  error?: string;
}

export function isResultDetailsTableMeta(id: string, title?: string, titleHi?: string): boolean {
  return (
    id === RESULT_DETAILS_TABLE_TEMPLATE.id ||
    (title || '').trim().toLowerCase() === 'result details' ||
    (titleHi || '').trim().toLowerCase() === 'result details'
  );
}

export function isCutoffMarksColumn(
  tableId: string,
  title: string,
  titleHi: string,
  header: string,
  colIdx: number
): boolean {
  const lowerH = (header || '').trim().toLowerCase();
  if (lowerH.includes('cut') || lowerH.includes('marks')) return true;
  if (
    isResultDetailsTableMeta(tableId, title, titleHi) &&
    colIdx === 1 &&
    !lowerH.includes('link') &&
    !lowerH.includes('url') &&
    !lowerH.includes('category')
  ) {
    return true;
  }
  return false;
}

export function isDownloadLinkColumn(
  _tableId: string,
  _title: string,
  _titleHi: string,
  header: string,
  _colIdx: number
): boolean {
  const lowerH = (header || '').trim().toLowerCase();
  if (lowerH.includes('link') || lowerH.includes('url')) return true;
  return false;
}

/**
 * Keeps only digits (0-9) and at most one decimal point for Cut-off Marks cells.
 */
export function sanitizeNumericCutoffInput(raw: string): string {
  const cleaned = (raw || '').replace(/[^0-9.]/g, '');
  const firstDotIdx = cleaned.indexOf('.');
  if (firstDotIdx === -1) return cleaned;
  const beforeDot = cleaned.slice(0, firstDotIdx);
  const afterDot = cleaned.slice(firstDotIdx + 1).replace(/\./g, '');
  const prefix = beforeDot === '' ? '0' : beforeDot;
  return `${prefix}.${afterDot}`;
}

export function validateCutoffMarksValue(raw?: string | null): CellValidationResult {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { valid: true };
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Cut-off Marks must be a valid number (e.g. 142 or 142.50).',
    };
  }
  return { valid: true };
}

export function validateDownloadLinkUrl(raw?: string | null): CellValidationResult {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { valid: true };
  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      error: 'Download Link cannot contain spaces. Enter a valid URL (https://...).',
    };
  }
  try {
    const parsed = new URL(trimmed);
    const hasHttpProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const host = parsed.hostname;
    const isValidHost =
      Boolean(host) &&
      !host.startsWith('.') &&
      !host.endsWith('.') &&
      (host === 'localhost' || (host.includes('.') && host.split('.').every((part) => part.length > 0)));
    if (!hasHttpProtocol || !isValidHost) {
      return {
        valid: false,
        error: 'Enter a valid URL starting with http:// or https:// (e.g. https://example.com/result.pdf).',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Enter a valid URL starting with http:// or https:// (e.g. https://example.com/result.pdf).',
    };
  }
}

export interface TableSectionsValidationResult {
  valid: boolean;
  cellErrors: Record<string, string>;
  firstError?: string;
}

export function validateResultTableSections(
  sections: Array<{
    id: string;
    title: string;
    titleHi?: string;
    headers: string[];
    rows: string[][];
  }>
): TableSectionsValidationResult {
  const cellErrors: Record<string, string> = {};
  let firstError: string | undefined;

  for (const tbl of sections) {
    const tableLabel = (tbl.titleHi || tbl.title || 'Table').trim();
    for (let rowIdx = 0; rowIdx < tbl.rows.length; rowIdx++) {
      const row = tbl.rows[rowIdx] || [];
      for (let colIdx = 0; colIdx < tbl.headers.length; colIdx++) {
        const header = tbl.headers[colIdx] || '';
        const cellVal = row[colIdx] ?? '';
        const key = `${tbl.id}:${rowIdx}:${colIdx}`;

        if (isCutoffMarksColumn(tbl.id, tbl.title, tbl.titleHi || '', header, colIdx)) {
          const check = validateCutoffMarksValue(cellVal);
          if (!check.valid && check.error) {
            cellErrors[key] = check.error;
            if (!firstError) {
              firstError = `${tableLabel} — Row ${rowIdx + 1} (${header || 'Cut-off Marks'}): ${check.error}`;
            }
          }
        } else if (isDownloadLinkColumn(tbl.id, tbl.title, tbl.titleHi || '', header, colIdx)) {
          const check = validateDownloadLinkUrl(cellVal);
          if (!check.valid && check.error) {
            cellErrors[key] = check.error;
            if (!firstError) {
              firstError = `${tableLabel} — Row ${rowIdx + 1} (${header || 'Download Link'}): ${check.error}`;
            }
          }
        }
      }
    }
  }

  return {
    valid: Object.keys(cellErrors).length === 0,
    cellErrors,
    firstError,
  };
}
