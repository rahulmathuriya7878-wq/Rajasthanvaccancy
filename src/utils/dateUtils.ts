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

  // Try parsing ISO date or datetime string
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();

      // Check if time is present in string (contains 'T' or ':')
      if (trimmed.includes('T') || trimmed.includes(':')) {
        let hours = parsed.getHours();
        const minutes = parsed.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const hoursStr = hours < 10 ? '0' + hours : hours;
        return `${day}-${month}-${year} | ${hoursStr}:${minutesStr} ${ampm}`;
      } else {
        return `${day}-${month}-${year}`;
      }
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
