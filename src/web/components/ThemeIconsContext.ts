import { createContext, useContext } from 'react';
import type { IconAssetKey } from '@conjuros/contracts';
import { ICON_ASSETS } from '../lib/iconAssets';

export type ThemeIconDefinition = { path: string; viewBox: string };

export type ThemeIcons = Record<IconAssetKey, ThemeIconDefinition>;

export const ThemeIconsContext = createContext<ThemeIcons | null>(null);

export function useThemeIcons(): ThemeIcons {
  const provided = useContext(ThemeIconsContext);
  const merged: ThemeIcons = { ...ICON_ASSETS } as ThemeIcons;
  if (provided) {
    for (const [key, value] of Object.entries(provided) as [IconAssetKey, ThemeIconDefinition][]) {
      if (value) merged[key] = value;
    }
  }
  return merged;
}