import type { CollectionItem } from '@conjuros/contracts';
import { getAttachmentPreview } from '../services/items';

const expirySafetyMarginMs = 30_000;

type CachedPreview = {
  url: string;
  expiresAt: number;
};

const previewCache = new Map<string, CachedPreview>();
const pendingPreviews = new Map<string, Promise<string>>();

export function isImageAttachment(item: CollectionItem): boolean {
  return (
    item.kind === 'attachment' &&
    Boolean(item.storagePath) &&
    Boolean(item.mimeType?.startsWith('image/'))
  );
}

function cacheKey(item: CollectionItem): string {
  return `${item.id}:${item.storagePath ?? ''}`;
}

export async function getAttachmentPreviewUrl(item: CollectionItem): Promise<string> {
  const key = cacheKey(item);
  const cached = previewCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const pending = pendingPreviews.get(key);
  if (pending) return pending;

  const request = getAttachmentPreview(item.id)
    .then(({ url, expiresInSeconds }) => {
      const ttlMs = Math.max(0, expiresInSeconds * 1_000 - expirySafetyMarginMs);
      previewCache.set(key, { url, expiresAt: Date.now() + ttlMs });
      return url;
    })
    .finally(() => {
      pendingPreviews.delete(key);
    });

  pendingPreviews.set(key, request);
  return request;
}

export function clearAttachmentPreviewCache(): void {
  previewCache.clear();
  pendingPreviews.clear();
}
