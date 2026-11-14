import { MAX_PAGE_SIZE } from '@conjuros/contracts';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface PageRequest {
  limit: number;
  skip: number;
}

/**
 * Reads every page of a list endpoint so callers that render a complete list keep
 * showing all entries while the API caps the page size.
 */
export async function collectPages<T>(
  fetchPage: (request: PageRequest) => Promise<PaginatedResult<T>>,
  pageSize = MAX_PAGE_SIZE,
): Promise<PaginatedResult<T>> {
  const firstPage = await fetchPage({ limit: pageSize, skip: 0 });
  const items = [...firstPage.items];

  while (items.length < firstPage.total) {
    const page = await fetchPage({ limit: pageSize, skip: items.length });
    if (page.items.length === 0) {
      break;
    }
    items.push(...page.items);
  }

  return { items, total: firstPage.total };
}
