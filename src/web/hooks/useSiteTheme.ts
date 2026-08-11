import { useEffect, useState } from 'react';
import type { IconAssetKey, Theme } from '@conjuros/contracts';
import { getActiveTheme } from '../services/themes';
import { applyTheme } from '../lib/applyTheme';
import { ICON_ASSETS } from '../lib/iconAssets';

function resolveIcons(theme: Theme | null): Record<IconAssetKey, { path: string; viewBox: string }> {
  const merged: Record<IconAssetKey, { path: string; viewBox: string }> = { ...ICON_ASSETS };
  if (theme && theme.iconAssets && typeof theme.iconAssets === 'object' && !Array.isArray(theme.iconAssets)) {
    for (const [key, value] of Object.entries(theme.iconAssets)) {
      merged[key as IconAssetKey] = value;
    }
  }
  return merged;
}

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
    icons: resolveIcons(theme),
  };
}