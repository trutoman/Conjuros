import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_PAGE_SIZE } from '@conjuros/contracts';
import { COLLECTION_PAGE_SIZE, useCollectionFilters } from '../useCollectionFilters';

beforeEach(() => sessionStorage.clear());

describe('useCollectionFilters', () => {
  it('starts on the first page with the maximum page size', () => {
    const { result } = renderHook(() => useCollectionFilters());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(MAX_PAGE_SIZE);
    expect(result.current.query).toMatchObject({ limit: MAX_PAGE_SIZE, skip: 0, sort: 'order' });
  });

  it('derives the skip offset from the current page', () => {
    const { result } = renderHook(() => useCollectionFilters());

    act(() => result.current.setPage(2));
    expect(result.current.query.skip).toBe(COLLECTION_PAGE_SIZE);

    act(() => result.current.setPage(3));
    expect(result.current.query.skip).toBe(COLLECTION_PAGE_SIZE * 2);
  });

  it('returns to the first page when the search changes', () => {
    const { result } = renderHook(() => useCollectionFilters());
    act(() => result.current.setPage(2));

    act(() => result.current.setFilters({ ...result.current.filters, search: 'git' }));

    expect(result.current.page).toBe(1);
    expect(result.current.query).toMatchObject({ search: 'git', skip: 0 });
  });

  it('returns to the first page when the type, tags, or match mode change', () => {
    const { result } = renderHook(() => useCollectionFilters());

    act(() => result.current.setPage(2));
    act(() => result.current.setFilters({ ...result.current.filters, kind: 'command' }));
    expect(result.current.page).toBe(1);
    expect(result.current.query).toMatchObject({ kind: 'command', skip: 0 });

    act(() => result.current.setPage(2));
    act(() => result.current.setFilters({ ...result.current.filters, tags: ['git'] }));
    expect(result.current.page).toBe(1);
    expect(result.current.query).toMatchObject({ tags: ['git'], skip: 0 });

    act(() => result.current.setPage(2));
    act(() => result.current.setFilters({ ...result.current.filters, tagFilterMode: 'any' }));
    expect(result.current.page).toBe(1);
    expect(result.current.query).toMatchObject({ tagFilterMode: 'any', skip: 0 });
  });

  it('restores the persisted filters without restoring the page', () => {
    sessionStorage.setItem('conjuros:filters', JSON.stringify({ search: 'state', tags: ['git'] }));

    const { result } = renderHook(() => useCollectionFilters());

    expect(result.current.filters).toMatchObject({ search: 'state', tags: ['git'] });
    expect(result.current.page).toBe(1);
    expect(result.current.query).toMatchObject({ search: 'state', tags: ['git'], skip: 0 });
  });
});
