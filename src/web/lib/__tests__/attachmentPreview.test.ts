import type { CollectionItem } from '@conjuros/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const previewApi = vi.hoisted(() => ({ getAttachmentPreview: vi.fn() }));

vi.mock('../../services/items', () => ({
  getAttachmentPreview: previewApi.getAttachmentPreview,
}));

const {
  clearAttachmentPreviewCache,
  getAttachmentPreviewUrl,
  isImageAttachment,
} = await import('../attachmentPreview');

function attachment(overrides: Partial<CollectionItem> = {}): CollectionItem {
  return {
    id: 'attachment-1',
    kind: 'attachment',
    title: 'Screenshot',
    description: '',
    tags: [],
    order: 1,
    relatedItemIds: [],
    command: null,
    url: null,
    content: null,
    filename: 'screenshot.png',
    storagePath: 'owner/file.png',
    mimeType: 'image/png',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  clearAttachmentPreviewCache();
  previewApi.getAttachmentPreview.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isImageAttachment', () => {
  it('accepts stored image attachments', () => {
    expect(isImageAttachment(attachment())).toBe(true);
    expect(isImageAttachment(attachment({ mimeType: 'image/webp' }))).toBe(true);
  });

  it('rejects non-images, empty attachments, and other kinds', () => {
    expect(isImageAttachment(attachment({ mimeType: 'application/pdf' }))).toBe(false);
    expect(isImageAttachment(attachment({ mimeType: null }))).toBe(false);
    expect(isImageAttachment(attachment({ storagePath: null }))).toBe(false);
    expect(isImageAttachment(attachment({ kind: 'markdown' }))).toBe(false);
  });
});

describe('getAttachmentPreviewUrl', () => {
  it('requests a preview and caches it for repeated callers', async () => {
    previewApi.getAttachmentPreview.mockResolvedValue({
      url: 'https://storage.test/image.png?token=1',
      expiresInSeconds: 300,
    });

    const first = await getAttachmentPreviewUrl(attachment());
    const second = await getAttachmentPreviewUrl(attachment());

    expect(first).toBe('https://storage.test/image.png?token=1');
    expect(second).toBe(first);
    expect(previewApi.getAttachmentPreview).toHaveBeenCalledTimes(1);
  });

  it('re-signs after the cached URL expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    previewApi.getAttachmentPreview
      .mockResolvedValueOnce({ url: 'https://storage.test/first.png', expiresInSeconds: 300 })
      .mockResolvedValueOnce({ url: 'https://storage.test/second.png', expiresInSeconds: 300 });

    await expect(getAttachmentPreviewUrl(attachment())).resolves.toBe(
      'https://storage.test/first.png',
    );

    vi.setSystemTime(new Date('2026-01-01T00:05:01.000Z'));

    await expect(getAttachmentPreviewUrl(attachment())).resolves.toBe(
      'https://storage.test/second.png',
    );
    expect(previewApi.getAttachmentPreview).toHaveBeenCalledTimes(2);
  });

  it('deduplicates requests that are still in flight', async () => {
    let resolvePreview: (value: { url: string; expiresInSeconds: number }) => void = () => undefined;
    const pending = new Promise<{ url: string; expiresInSeconds: number }>((resolve) => {
      resolvePreview = resolve;
    });
    previewApi.getAttachmentPreview.mockReturnValue(pending);

    const first = getAttachmentPreviewUrl(attachment());
    const second = getAttachmentPreviewUrl(attachment());
    resolvePreview({ url: 'https://storage.test/image.png', expiresInSeconds: 300 });

    await expect(first).resolves.toBe('https://storage.test/image.png');
    await expect(second).resolves.toBe('https://storage.test/image.png');
    expect(previewApi.getAttachmentPreview).toHaveBeenCalledTimes(1);
  });

  it('keys the cache by item id and storage path', async () => {
    previewApi.getAttachmentPreview
      .mockResolvedValueOnce({ url: 'https://storage.test/one.png', expiresInSeconds: 300 })
      .mockResolvedValueOnce({ url: 'https://storage.test/two.png', expiresInSeconds: 300 });

    await getAttachmentPreviewUrl(attachment());
    await getAttachmentPreviewUrl(attachment({ storagePath: 'owner/other.png' }));

    expect(previewApi.getAttachmentPreview).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures', async () => {
    previewApi.getAttachmentPreview
      .mockRejectedValueOnce(new Error('preview failed'))
      .mockResolvedValueOnce({ url: 'https://storage.test/image.png', expiresInSeconds: 300 });

    await expect(getAttachmentPreviewUrl(attachment())).rejects.toThrow('preview failed');
    await expect(getAttachmentPreviewUrl(attachment())).resolves.toBe(
      'https://storage.test/image.png',
    );
    expect(previewApi.getAttachmentPreview).toHaveBeenCalledTimes(2);
  });
});
