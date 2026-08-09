import { useEffect, useState } from 'react';
import type { Theme } from '@conjuros/contracts';
import { getActiveTheme } from '../services/themes';
import { applyTheme } from '../lib/applyTheme';

export function useSiteTheme(enabled: boolean, preference: 'light' | 'dark' | undefined) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (!enabled) return;
    applyTheme(document.documentElement, null);
    setTheme(null);

    let cancelled = false;
    void getActiveTheme()
      .then((context) => {
        if (cancelled) return;
        setTheme(context.theme);
        applyTheme(document.documentElement, context.theme);
      })
      .catch(() => {
        if (cancelled) return;
        applyTheme(document.documentElement, null);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, preference]);

  return {
    theme,
    palette: theme?.tagColorPalette ?? null,
  };
}