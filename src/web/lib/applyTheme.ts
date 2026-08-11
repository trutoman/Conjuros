import type { Theme } from '@conjuros/contracts';
import { normalizeTagColor } from '@conjuros/contracts';

export function applyTheme(root: HTMLElement, theme: Theme | null): void {
  const style = root.style;

  if (!theme) {
    style.removeProperty('color-scheme');
    style.removeProperty('--page-bg');
    style.removeProperty('--page-bg-accent');
    style.removeProperty('--surface');
    style.removeProperty('--surface-elevated');
    style.removeProperty('--surface-muted');
    style.removeProperty('--surface-alt');
    style.removeProperty('--text');
    style.removeProperty('--text-muted');
    style.removeProperty('--border');
    style.removeProperty('--border-strong');
    style.removeProperty('--primary');
    style.removeProperty('--primary-strong');
    style.removeProperty('--accent-soft');
    style.removeProperty('--spell');
    style.removeProperty('--link');
    style.removeProperty('--markdown');
    style.removeProperty('--file');
    style.removeProperty('--danger');
    style.removeProperty('--success');
    style.removeProperty('--warning');
    style.removeProperty('--shadow');
    style.removeProperty('--font-display');
    style.removeProperty('--font-body');
    style.removeProperty('--font-mono');
    style.removeProperty('--font-size-heading');
    style.removeProperty('--font-size-body');
    style.removeProperty('--font-size-mono');
    return;
  }

  const { colors, fonts, fontSizes, kindColors, name } = theme;
  root.dataset.theme = name;
  style.setProperty('color-scheme', name === 'dark' ? 'dark' : 'light');
  style.setProperty('--page-bg', colors.pageBg);
  style.setProperty('--page-bg-accent', colors.pageBgAccent);
  style.setProperty('--surface', colors.surface);
  style.setProperty('--surface-elevated', colors.surfaceElevated);
  style.setProperty('--surface-muted', colors.surfaceMuted);
  style.setProperty('--surface-alt', colors.surfaceAlt);
  style.setProperty('--text', colors.text);
  style.setProperty('--text-muted', colors.textMuted);
  style.setProperty('--border', colors.border);
  style.setProperty('--border-strong', colors.borderStrong);
  style.setProperty('--primary', colors.primary);
  style.setProperty('--primary-strong', colors.primaryStrong);
  style.setProperty('--accent-soft', colors.accentSoft);
  style.setProperty('--spell', kindColors.spell);
  style.setProperty('--link', kindColors.webLink);
  style.setProperty('--markdown', kindColors.markdown);
  style.setProperty('--file', kindColors.file);
  style.setProperty('--danger', colors.danger);
  style.setProperty('--success', colors.success);
  style.setProperty('--warning', colors.warning);
  style.setProperty('--shadow', colors.shadow);
  style.setProperty('--font-display', fonts.display);
  style.setProperty('--font-body', fonts.body);
  style.setProperty('--font-mono', fonts.mono);
  style.setProperty('--font-size-heading', fontSizes.heading);
  style.setProperty('--font-size-body', fontSizes.body);
  style.setProperty('--font-size-mono', fontSizes.mono);
}

export function normalizedHex(hex: string): string {
  return normalizeTagColor(hex);
}