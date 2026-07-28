import { useEffect, useState } from 'react';
import type { CollectionQuery, ItemKind, Tag } from '@conjuros/contracts';

export interface CollectionFilters {
  search: string;
  kind?: ItemKind;
  tag?: Tag;
}

const defaultFilters: CollectionFilters = { search: '' };

export function useCollectionFilters() {
  const [filters, setFilters] = useState<CollectionFilters>(() => {
    try {
      return { ...defaultFilters, ...JSON.parse(sessionStorage.getItem('conjuros:filters') ?? '{}') };
    } catch {
      return defaultFilters;
    }
  });
  useEffect(() => { sessionStorage.setItem('conjuros:filters', JSON.stringify(filters)); }, [filters]);
  const query: CollectionQuery = { limit: 50, skip: 0, sort: 'order', ...(filters.search ? { search: filters.search } : {}), ...(filters.kind ? { kind: filters.kind } : {}), ...(filters.tag ? { tag: filters.tag } : {}) };
  return { filters, setFilters, query };
}