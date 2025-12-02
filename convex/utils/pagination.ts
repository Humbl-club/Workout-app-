/**
 * Pagination Utilities
 *
 * Standardized pagination helpers for consistent query behavior.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Validate and normalize pagination limit
 */
export function validatePagination(limit?: number): number {
  if (!limit) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
}

/**
 * Pagination result type
 */
export interface PaginatedResult<T> {
  page: T[];
  continueCursor: string | null;
  isDone: boolean;
}
