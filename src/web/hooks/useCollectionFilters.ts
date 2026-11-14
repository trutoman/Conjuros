import { useEffect, useState } from 'react';
import { MAX_PAGE_SIZE, type CollectionQuery, type ItemKind } from '@conjuros/contracts';

export interface CollectionFilters {
  search: string;
  kind?: ItemKind;
  tags: string[];
  tagFilterMode: 'all' | 'any';
}

const defaultFilters: CollectionFilters = { search: '', tags: [], tagFilterMode: 'all' };
export const COLLECTION_PAGE_SIZE = MAX_PAGE_SIZE;

export function useCollectionFilters() {
  const [filters, setFiltersState] = useState<CollectionFilters>(() => {
    try {
      return { ...defaultFilters, ...JSON.parse(sessionStorage.getItem('conjuros:filters') ?? '{}') };
    } catch {
      return defaultFilters;
    }
  });
  const [page, setPage] = useState(1);
  useEffect(() => { sessionStorage.setItem('conjuros:filters', JSON.stringify(filters)); }, [filters]);

  function setFilters(next: CollectionFilters) {
    setFiltersState(next);
    setPage(1);
  }

  const query: CollectionQuery = {
    limit: COLLECTION_PAGE_SIZE,
    skip: (page - 1) * COLLECTION_PAGE_SIZE,
    sort: 'order',
    tagFilterMode: filters.tagFilterMode,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.kind ? { kind: filters.kind } : {}),
    ...(filters.tags.length > 0 ? { tags: filters.tags } : {}),
  };
  return { filters, setFilters, page, pageSize: COLLECTION_PAGE_SIZE, setPage, query };
}
