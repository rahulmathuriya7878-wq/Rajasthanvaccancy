import type { CategoryType, VacancyItem } from '../types';
import { compareVacanciesNewestFirst } from './dateUtils';

const VALID_PORTAL_CATEGORIES: ReadonlySet<CategoryType> = new Set([
  'latest_job',
  'admit_card',
  'result',
  'answer_key',
  'syllabus',
  'scheme',
  'upcoming',
  'ugc_net',
  'exam_date',
  'news',
]);

/**
 * Normalizes category keys consistently across the homepage grid, View More links,
 * category archive pages, URL query params, and header/sidebar navigation.
 */
export function normalizePortalCategory(category?: string | null): CategoryType | 'ALL' {
  if (!category) return 'ALL';
  const trimmed = category.trim().toLowerCase();
  if (!trimmed || trimmed === 'all') return 'ALL';
  if (trimmed === 'job' || trimmed === 'ugc_net') return 'latest_job';
  if (VALID_PORTAL_CATEGORIES.has(trimmed as CategoryType)) {
    return trimmed as CategoryType;
  }
  return 'latest_job';
}

/**
 * Resolves the canonical single category that owns a vacancy post.
 */
export function getVacancyCategory(item: VacancyItem): CategoryType {
  const raw = (item.category || '').trim().toLowerCase();
  if (!raw || raw === 'job' || raw === 'ugc_net') {
    return 'latest_job';
  }
  if (VALID_PORTAL_CATEGORIES.has(raw as CategoryType)) {
    return raw as CategoryType;
  }
  return 'latest_job';
}

/**
 * Strictly checks whether a vacancy belongs to the given category.
 * Prevents posts from other categories from leaking into View More / archive lists.
 */
export function matchesVacancyCategory(item: VacancyItem, selectedCategory?: string | null): boolean {
  const normalizedTarget = normalizePortalCategory(selectedCategory);
  if (normalizedTarget === 'ALL') return true;
  return getVacancyCategory(item) === normalizedTarget;
}

/**
 * Filters vacancies strictly by category and optional search query, sorted newest-first.
 */
export function filterVacanciesByCategory(
  vacancies: VacancyItem[],
  selectedCategory: string = 'ALL',
  searchQuery: string = ''
): VacancyItem[] {
  const normalizedTarget = normalizePortalCategory(selectedCategory);
  const query = searchQuery.toLowerCase().trim();

  return vacancies
    .filter((item) => {
      if (normalizedTarget !== 'ALL' && getVacancyCategory(item) !== normalizedTarget) {
        return false;
      }

      if (query) {
        const inTitle = (item.title || '').toLowerCase().includes(query);
        const inTitleHi = (item.titleHi || '').toLowerCase().includes(query);
        const inDept = (item.department || '').toLowerCase().includes(query);
        const inAdvt = (item.advtNo || '').toLowerCase().includes(query);
        const inPost = (item.postName || '').toLowerCase().includes(query);
        const inTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inTitleHi && !inDept && !inAdvt && !inPost && !inTags) {
          return false;
        }
      }

      return true;
    })
    .sort(compareVacanciesNewestFirst);
}
