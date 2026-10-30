import type { UserPreferences, UserPreferencesUpdate } from '@conjuros/contracts';

export async function updateUserPreferences(update: UserPreferencesUpdate): Promise<UserPreferences> {
  const response = await fetch('/api/auth/me/preferences', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  const body = await response.json().catch(() => null) as {
    user?: { preferences?: UserPreferences };
    error?: { message?: string };
  } | null;
  if (!response.ok) throw new Error(body?.error?.message ?? 'Could not update preferences');
  if (!body?.user?.preferences) throw new Error('The server returned invalid preferences');
  return body.user.preferences;
}
