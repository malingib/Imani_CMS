/**
 * Pagination utilities for handling large datasets
 * Implements cursor-based and offset-based pagination
 */

export interface PaginationParams {
  page: number;     // 1-indexed page number
  pageSize: number; // Items per page
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginate an array of items
 * Useful for client-side pagination of already-loaded data
 */
export function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginatedResult<T> {
  const { page, pageSize } = params;

  // Validate params
  if (page < 1) {
    throw new Error('Page number must be >= 1');
  }
  if (pageSize < 1) {
    throw new Error('Page size must be >= 1');
  }

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Filter and paginate items
 * Useful for implementing search + pagination
 */
export function filterAndPaginate<T>(
  items: T[],
  predicate: (item: T) => boolean,
  params: PaginationParams
): PaginatedResult<T> {
  const filtered = items.filter(predicate);
  return paginate(filtered, params);
}

/**
 * Sort and paginate items
 */
export function sortAndPaginate<T>(
  items: T[],
  compareFn: (a: T, b: T) => number,
  params: PaginationParams
): PaginatedResult<T> {
  const sorted = [...items].sort(compareFn);
  return paginate(sorted, params);
}

/**
 * Combine filter, sort, and paginate
 * Complete solution for list views
 */
export function filterSortAndPaginate<T>(
  items: T[],
  filter: (item: T) => boolean,
  sort: (a: T, b: T) => number,
  params: PaginationParams
): PaginatedResult<T> {
  const filtered = items.filter(filter);
  const sorted = filtered.sort(sort);
  return paginate(sorted, params);
}

/**
 * Hook-friendly pagination state manager
 * Handles page navigation and size changes
 */
export class PaginationManager {
  page: number = 1;
  pageSize: number = 50;

  constructor(initialPage: number = 1, initialPageSize: number = 50) {
    this.page = initialPage;
    this.pageSize = initialPageSize;
  }

  nextPage(): void {
    this.page++;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1) {
      this.page = page;
    }
  }

  setPageSize(size: number): void {
    if (size >= 1) {
      this.pageSize = size;
      this.page = 1; // Reset to first page when size changes
    }
  }

  reset(): void {
    this.page = 1;
  }

  getParams(): PaginationParams {
    return { page: this.page, pageSize: this.pageSize };
  }
}

/**
 * Compute offset for database queries
 */
export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Compute SQL limit clause
 */
export function getLimitClause(pageSize: number): string {
  return `LIMIT ${pageSize}`;
}

/**
 * Compute SQL offset clause
 */
export function getOffsetClause(page: number, pageSize: number): string {
  return `OFFSET ${getOffset(page, pageSize)}`;
}

/**
 * Format pagination info for display
 */
export function formatPaginationInfo(result: PaginatedResult<any>): string {
  const start = (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);
  return `Showing ${start}-${end} of ${result.total}`;
}

/**
 * Get array of page numbers for pagination controls
 * Returns pages around current page (e.g., [1, 2, 3, 4, 5])
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  windowSize: number = 5
): (number | string)[] {
  const pages: (number | string)[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  let start = Math.max(1, currentPage - halfWindow);
  let end = Math.min(totalPages, currentPage + halfWindow);

  // Adjust window if near edges
  if (start === 1) {
    end = Math.min(totalPages, end + (halfWindow - (currentPage - 1)));
  }
  if (end === totalPages) {
    start = Math.max(1, start - (halfWindow - (totalPages - currentPage)));
  }

  // Add first page and ellipsis
  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }
  }

  // Add pages in range
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add last page and ellipsis
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Default page sizes for different contexts
 */
export const DEFAULT_PAGE_SIZES = {
  SMALL: 10,      // For small screens or dense lists
  MEDIUM: 25,     // Default
  LARGE: 50,      // For desktop views
  EXTRA_LARGE: 100, // For admin/reporting views
};
