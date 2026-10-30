import { useEffect, useState } from 'react';
import { updateUserPreferences } from '../services/user-preferences';

export function useThemePreference(initialThemeId: string | null, enabled: boolean) {
  const [themeId, setThemeId] = useState<string | null>(initialThemeId);
  const [settledThemeId, setSettledThemeId] = useState<string | null>(initialThemeId);

  useEffect(() => {
    setThemeId(initialThemeId);
    setSettledThemeId(initialThemeId);
  }, [enabled, initialThemeId]);

  async function changeTheme(nextThemeId: string | null) {
    if (!enabled) {
      setThemeId(nextThemeId);
      setSettledThemeId(nextThemeId);
      return;
    }

    const previousThemeId = settledThemeId;
    setThemeId(nextThemeId);
    try {
      const preferences = await updateUserPreferences({ themeId: nextThemeId });
      setSettledThemeId(preferences.themeId);
      setThemeId(preferences.themeId);
    } catch (error) {
      setThemeId(previousThemeId);
      throw error;
    }
  }

  return { themeId, settledThemeId, setTheme: changeTheme };
}
