/**
 * Date formatting and normalization utilities for Rajasthan Vacancy portal.
 * Internal data and URL indexing (Google Schema JobPosting datePosted / validThrough)
 * use strict ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss),
 * while user UI display renders friendly format (e.g. "24 October 2026 | 07:00 PM").
 */

export const formatDisplayDate = (dateVal?: string | null, fallback = 'शीघ्र'): string => {
  if (!dateVal || typeof dateVal !== 'string') return fallback;
  const trimmed = dateVal.trim();
  if (!trimmed || trimmed === 'TBA' || trimmed === '0000-00-00') return fallback;

  // 1. Direct match for YYYY-MM-DD (e.g. 2026-09-01 -> 01/09/2026)
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  // 2. Direct match for DD-MM-YYYY (e.g. 01-09-2026 -> 01/09/2026)
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

  // 4. Try parsing with native Date if it's a valid date string
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime()) && !trimmed.includes('अक्टूबर') && !trimmed.includes('नवंबर') && !trimmed.includes('जनवरी')) {
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

  // If already looks like YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T07:00:00+00:00`;
  }

  return defaultIso;
};
