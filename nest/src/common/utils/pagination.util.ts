export const PAGINATION_MAX_LIMIT = 100;
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_DEFAULT_PAGE = 1;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  page?: number | string,
  limit?: number | string,
): PaginationParams {
  const p = Math.max(1, parseInt(String(page || PAGINATION_DEFAULT_PAGE), 10) || 1);
  const rawLimit = parseInt(String(limit || PAGINATION_DEFAULT_LIMIT), 10) || PAGINATION_DEFAULT_LIMIT;
  const l = Math.min(PAGINATION_MAX_LIMIT, Math.max(1, rawLimit));
  return {
    page: p,
    limit: l,
    skip: (p - 1) * l,
  };
}
