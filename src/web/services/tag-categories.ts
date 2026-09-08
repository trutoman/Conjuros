import {
  tagCategoryEntitySchema,
  tagCategoryListSchema,
  tagCategoryQuerySchema,
  type TagCategoryInput,
  type TagCategoryQuery,
  type TagCategoryUpdate,
} from '@conjuros/contracts';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listTagCategories(query: Partial<TagCategoryQuery> = {}) {
  const normalizedQuery = tagCategoryQuerySchema.partial().parse(query);
  const params = new URLSearchParams();
  Object.entries(normalizedQuery).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return tagCategoryListSchema.parse(await api(`/tag-categories?${params.toString()}`));
}

export async function createTagCategory(input: TagCategoryInput) {
  return tagCategoryEntitySchema.parse(await api('/tag-categories', { method: 'POST', body: JSON.stringify(input) }));
}

export async function updateTagCategory(id: string, input: TagCategoryUpdate) {
  return tagCategoryEntitySchema.parse(await api(`/tag-categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }));
}

export async function deleteTagCategory(id: string) {
  return api<void>(`/tag-categories/${id}`, { method: 'DELETE' });
}

export async function reorderTagCategory(id: string, order: number) {
  return tagCategoryEntitySchema.parse(
    await api(`/tag-categories/${id}/reorder`, { method: 'PATCH', body: JSON.stringify({ order }) }),
  );
}
