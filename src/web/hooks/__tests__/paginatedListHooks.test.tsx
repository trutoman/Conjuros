import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_PAGE_SIZE, type Tag, type TagCategory, type Theme } from '@conjuros/contracts';
import { listTags } from '../../services/tags';
import { listTagCategories } from '../../services/tag-categories';
import { listThemes } from '../../services/themes';
import { useTags } from '../useTags';
import { useTagCategories } from '../useTagCategories';
import { useThemes } from '../useThemes';

vi.mock('../../services/tags', () => ({
  listTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  reorderTag: vi.fn(),
}));

vi.mock('../../services/tag-categories', () => ({
  listTagCategories: vi.fn(),
  createTagCategory: vi.fn(),
  updateTagCategory: vi.fn(),
  deleteTagCategory: vi.fn(),
  reorderTagCategory: vi.fn(),
}));

vi.mock('../../services/themes', () => ({
  listThemes: vi.fn(),
  getActiveTheme: vi.fn(),
  createTheme: vi.fn(),
  updateTheme: vi.fn(),
  uploadThemeImage: vi.fn(),
  deleteTheme: vi.fn(),
  activateTheme: vi.fn(),
}));

function pageOf<T>(all: T[], request: { limit: number; skip: number }) {
  return Promise.resolve({ items: all.slice(request.skip, request.skip + request.limit), total: all.length });
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const fortyTags = Array.from({ length: 40 }, () => ({ id: 'tag' })) as unknown as Tag[];
const thirtyCategories = Array.from({ length: 30 }, () => ({ id: 'category' })) as unknown as TagCategory[];
const thirtyThemes = Array.from({ length: 30 }, () => ({ id: 'theme' })) as unknown as Theme[];

beforeEach(() => vi.clearAllMocks());

describe('paginated list hooks', () => {
  it('collects every tag page into a complete list', async () => {
    vi.mocked(listTags).mockImplementation((request = {}) =>
      pageOf(fortyTags, { limit: request.limit ?? MAX_PAGE_SIZE, skip: request.skip ?? 0 }),
    );

    const { result } = renderHook(() => useTags(), { wrapper });

    await waitFor(() => expect(result.current.tags).toHaveLength(40));
    expect(listTags).toHaveBeenNthCalledWith(1, { limit: MAX_PAGE_SIZE, skip: 0, sort: 'order' });
    expect(listTags).toHaveBeenNthCalledWith(2, { limit: MAX_PAGE_SIZE, skip: MAX_PAGE_SIZE, sort: 'order' });
    expect(result.current.total).toBe(40);
  });

  it('collects every tag category page into a complete list', async () => {
    vi.mocked(listTagCategories).mockImplementation((request = {}) =>
      pageOf(thirtyCategories, { limit: request.limit ?? MAX_PAGE_SIZE, skip: request.skip ?? 0 }),
    );

    const { result } = renderHook(() => useTagCategories(), { wrapper });

    await waitFor(() => expect(result.current.categories).toHaveLength(30));
    expect(result.current.total).toBe(30);
  });

  it('collects every theme page into a complete list', async () => {
    vi.mocked(listThemes).mockImplementation((request = {}) =>
      pageOf(thirtyThemes, { limit: request.limit ?? MAX_PAGE_SIZE, skip: request.skip ?? 0 }),
    );

    const { result } = renderHook(() => useThemes(), { wrapper });

    await waitFor(() => expect(result.current.themes).toHaveLength(30));
    expect(listThemes).toHaveBeenNthCalledWith(1, { limit: MAX_PAGE_SIZE, skip: 0, sort: 'name' });
    expect(result.current.total).toBe(30);
  });
});
