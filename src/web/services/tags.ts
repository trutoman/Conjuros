import {
  tagListSchema,
  tagQuerySchema,
  tagSchema,
  type TagInput,
  type TagQuery,
  type TagUpdate,
} from '@conjuros/contracts';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listTags(query: Partial<TagQuery> = {}) {
  const normalizedQuery = tagQuerySchema.partial().parse(query);
  const params = new URLSearchParams();
  Object.entries(normalizedQuery).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return tagListSchema.parse(await api(`/tags?${params.toString()}`));
}

export async function createTag(tag: TagInput) {
  return tagSchema.parse(await api('/tags', { method: 'POST', body: JSON.stringify(tag) }));
}

export async function updateTag(id: string, tag: TagUpdate) {
  return tagSchema.parse(await api(`/tags/${id}`, { method: 'PATCH', body: JSON.stringify(tag) }));
}

export async function deleteTag(id: string) {
  return api<void>(`/tags/${id}`, { method: 'DELETE' });
}

export async function reorderTag(id: string, order: number) {
  return tagSchema.parse(await api(`/tags/${id}/reorder`, { method: 'PATCH', body: JSON.stringify({ order }) }));
}
