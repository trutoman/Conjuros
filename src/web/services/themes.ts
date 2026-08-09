import {
  siteThemeContextSchema,
  themeListSchema,
  themeQuerySchema,
  themeSchema,
  type SiteThemeContext,
  type Theme,
  type ThemeInput,
  type ThemeQuery,
  type ThemeUpdate,
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

export async function listThemes(query: Partial<ThemeQuery> = {}) {
  const normalizedQuery = themeQuerySchema.partial().parse(query);
  const params = new URLSearchParams();
  Object.entries(normalizedQuery).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return themeListSchema.parse(await api(`/themes?${params.toString()}`));
}

export async function getActiveTheme() {
  return siteThemeContextSchema.parse(await api('/themes/active'));
}

export async function createTheme(theme: ThemeInput) {
  return themeSchema.parse(await api('/themes', { method: 'POST', body: JSON.stringify(theme) }));
}

export async function updateTheme(id: string, theme: ThemeUpdate) {
  return themeSchema.parse(await api(`/themes/${id}`, { method: 'PATCH', body: JSON.stringify(theme) }));
}

export async function deleteTheme(id: string) {
  return api<void>(`/themes/${id}`, { method: 'DELETE' });
}

export async function activateTheme(id: string) {
  return themeSchema.parse(await api(`/themes/${id}/activate`, { method: 'PATCH' }));
}

export interface ActiveThemeView {
  theme: Theme;
  source: SiteThemeContext['source'];
}