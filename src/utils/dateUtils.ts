/**
 * Date formatting helper for unified date display across Rajasthan Vacancy portal.
 * If data is empty, blank, or missing, returns "शीघ्र" (or custom fallback).
 */
export const formatSingleDate = (dateVal?: string | null, fallback = 'शीघ्र'): string => {
  if (!dateVal || typeof dateVal !== 'string') return fallback;
  const trimmed = dateVal.trim();
  if (!trimmed || trimmed === 'TBA' || trimmed === '0000-00-00') return fallback;
  return trimmed;
};
