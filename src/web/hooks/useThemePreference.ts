import { useEffect, useState } from 'react';
import type { ThemePreference } from '@conjuros/contracts';

type ThemePreferenceResponse = {
  user?: {
    theme?: ThemePreference;
  };
};

async function updateThemePreference(theme: ThemePreference) {
  const response = await fetch('/api/auth/me/theme', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Could not update theme');
  }

  const body = await response.json().catch(() => null) as ThemePreferenceResponse | null;
  return body?.user?.theme ?? theme;
}

export function useThemePreference(initialTheme: ThemePreference, enabled: boolean) {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [settledTheme, setSettledTheme] = useState<ThemePreference>(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
    setSettledTheme(initialTheme);
  }, [enabled, initialTheme]);

  async function changeTheme(nextTheme: ThemePreference) {
    if (!enabled) {
      setTheme(nextTheme);
      setSettledTheme(nextTheme);
      return;
    }

    const previousTheme = settledTheme;
    setTheme(nextTheme);

    try {
      const persistedTheme = await updateThemePreference(nextTheme);
      setSettledTheme(persistedTheme);
      setTheme(persistedTheme);
    } catch (error) {
      setTheme(previousTheme);
      throw error;
    }
  }

  return { theme, settledTheme, setTheme: changeTheme };
}