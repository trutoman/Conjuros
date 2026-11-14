import { describe, expect, it, vi } from 'vitest';
import { MAX_PAGE_SIZE } from '@conjuros/contracts';
import { collectPages } from '../collectPages';

describe('collectPages', () => {
  it('reads every page until the reported total is reached', async () => {
    const all = Array.from({ length: 30 }, (_value, index) => `row-${index}`);
    const fetchPage = vi.fn(async ({ limit, skip }: { limit: number; skip: number }) => ({
      items: all.slice(skip, skip + limit),
      total: all.length,
    }));

    const result = await collectPages(fetchPage);

    expect(fetchPage).toHaveBeenNthCalledWith(1, { limit: MAX_PAGE_SIZE, skip: 0 });
    expect(fetchPage).toHaveBeenNthCalledWith(2, { limit: MAX_PAGE_SIZE, skip: MAX_PAGE_SIZE });
    expect(result.items).toEqual(all);
    expect(result.total).toBe(30);
  });

  it('stops when a page comes back empty before the reported total', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ items: ['only'], total: 5 })
      .mockResolvedValueOnce({ items: [], total: 5 });

    const result = await collectPages(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual(['only']);
    expect(result.total).toBe(5);
  });

  it('does not request a second page when the first page is already complete', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ items: ['a', 'b'], total: 2 });

    const result = await collectPages(fetchPage, 27);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(result.items).toEqual(['a', 'b']);
  });
});
