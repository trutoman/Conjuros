import { useEffect, useState } from 'react';
import type { CollectionQuery, ItemKind } from '@conjuros/contracts';

export interface CollectionFilters {
  search: string;
  kind?: ItemKind;
  tags: string[];
  tagFilterMode: 'all' | 'any';
}

const defaultFilters: CollectionFilters = { search: '', tags: [], tagFilterMode: 'all' };

export function useCollectionFilters() {
  const [filters, setFilters] = useState<CollectionFilters>(() => {
    try {
      return { ...defaultFilters, ...JSON.parse(sessionStorage.getItem('conjuros:filters') ?? '{}') };
    } catch {
      return defaultFilters;
    }
  });
  useEffect(() => { sessionStorage.setItem('conjuros:filters', JSON.stringify(filters)); }, [filters]);
  const query: CollectionQuery = {
    limit: 50,
    skip: 0,
    sort: 'order',
    tagFilterMode: filters.tagFilterMode,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.kind ? { kind: filters.kind } : {}),
    ...(filters.tags.length > 0 ? { tags: filters.tags } : {}),
  };
  return { filters, setFilters, query };
}