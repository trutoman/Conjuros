import {
  attachmentDownloadSchema,
  collectionItemSchema,
  collectionListSchema,
  type CollectionItem,
  type CollectionItemInput,
  type CollectionItemUpdate,
  type CollectionQuery,
} from '@conjuros/contracts';

async function requestError(response: Response) {
  const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
  return new Error(body?.error?.message ?? 'Request failed');
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) throw await requestError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listItems(query: CollectionQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === 'tags' && Array.isArray(value)) {
      value.forEach((tag) => params.append('tags', tag));
      return;
    }
    params.set(key, String(value));
  });
  return collectionListSchema.parse(await api(`/items?${params.toString()}`));
}

export async function createItem(item: CollectionItemInput) {
  return collectionItemSchema.parse(await api('/items', { method: 'POST', body: JSON.stringify(item) }));
}

export async function updateItem(id: string, item: CollectionItemUpdate) {
  return collectionItemSchema.parse(await api(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(item) }));
}

export async function deleteItem(id: string) {
  return api<void>(`/items/${id}`, { method: 'DELETE' });
}

export async function reorderItem(id: string, order: number): Promise<CollectionItem> {
  return collectionItemSchema.parse(await api(`/items/${id}/reorder`, { method: 'PATCH', body: JSON.stringify({ order }) }));
}

export async function uploadAttachment(id: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`/api/items/${id}/attachment`, {
    method: 'PUT',
    credentials: 'include',
    body,
  });
  if (!response.ok) throw await requestError(response);
  return collectionItemSchema.parse(await response.json());
}

export async function removeAttachment(id: string) {
  return collectionItemSchema.parse(await api(`/items/${id}/attachment`, { method: 'DELETE' }));
}

export async function getAttachmentDownload(id: string) {
  return attachmentDownloadSchema.parse(await api(`/items/${id}/attachment/download`));
}
