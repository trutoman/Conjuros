import { describe, expect, it } from 'vitest';
import type { Theme } from '@conjuros/contracts';
import { applyTheme } from '../applyTheme';

const theme: Theme = {
  id: 'theme-light',
  name: 'light',
  label: 'Light',
  colors: {
    pageBg: '#f7faf8',
    pageBgAccent: 'rgba(15, 23, 42, 0.04)',
    surface: '#ffffff',
    surfaceElevated: '#fffdfa',
    surfaceMuted: '#edf2ef',
    surfaceAlt: '#f4f8f6',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#cbd5e1',
    borderStrong: '#a5b4c3',
    primary: '#4f46e5',
    primaryStrong: '#4338ca',
    accentSoft: '#e0e7ff',
    danger: '#dc2626',
    success: '#15803d',
    warning: '#b45309',
    shadow: '0 14px 32px rgba(15, 23, 42, 0.08)',
  },
  fonts: {
    display: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
    mono: "'Cutive Mono', monospace",
  },
  fontSizes: {
    heading: '2.65rem',
    body: '1rem',
    mono: '0.75rem',
  },
  backdrop: {
    pattern: 'lines',
    gridSize: '40px',
    lineWidth: '1px',
    glowPosition: 'top-right',
    glowSize: '30%',
    glowColor: 'rgba(15, 23, 42, 0.04)',
  },
  useImageBackdrop: false,
  imageBackdrop: null,
  iconAssets: {
    command: { path: 'M15 4V2 M15 16v-2 M3 21l9-9', viewBox: '0 0 24 24' },
    copy: { path: 'M10 8 H20 A2 2 0 0 1 22 10 V20', viewBox: '0 0 24 24' },
  },
  kindColors: {
    command: '#7c3aed',
    webLink: '#2563eb',
    markdown: '#b45309',
    file: '#0d9488',
    attachment: '#be123c',
  },
  tagColorPalette: ['#1A73E8', '#7C3AED'],
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('applyTheme', () => {
  it('applies theme tokens as CSS custom properties on the root element', () => {
    const root = document.createElement('html');
    applyTheme(root, theme);

    expect(root.style.getPropertyValue('--page-bg')).toBe('#f7faf8');
    expect(root.style.getPropertyValue('--primary')).toBe('#4f46e5');
    expect(root.style.getPropertyValue('--command')).toBe('#7c3aed');
    expect(root.style.getPropertyValue('--link')).toBe('#2563eb');
    expect(root.style.getPropertyValue('--attachment')).toBe('#be123c');
    expect(root.style.getPropertyValue('--font-display')).toBe("'Cinzel', serif");
    expect(root.style.getPropertyValue('--font-size-heading')).toBe('2.65rem');
  });

  it('sets the data-theme attribute from the theme name', () => {
    const root = document.createElement('html');
    applyTheme(root, { ...theme, name: 'dark' });

    expect(root.dataset.theme).toBe('dark');
    expect(root.style.getPropertyValue('color-scheme')).toBe('dark');
  });

  it('applies backdrop tokens and the pattern attribute', () => {
    const root = document.createElement('html');
    applyTheme(root, { ...theme, backdrop: { ...theme.backdrop, pattern: 'dots', glowPosition: 'bottom-left' } });

    expect(root.dataset.backdropPattern).toBe('dots');
    expect(root.style.getPropertyValue('--page-grid-size')).toBe('40px');
    expect(root.style.getPropertyValue('--page-grid-line-width')).toBe('1px');
    expect(root.style.getPropertyValue('--page-glow-position')).toBe('bottom left');
    expect(root.style.getPropertyValue('--page-glow-size')).toBe('30%');
    expect(root.style.getPropertyValue('--page-glow-color')).toBe('rgba(15, 23, 42, 0.04)');
  });

  it('applies the texture and image mode only when an image URL is given', () => {
    const root = document.createElement('html');
    applyTheme(root, { ...theme, useImageBackdrop: true, imageBackdrop: null }, 'https://cdn.test/theme/bg.png');

    expect(root.dataset.backdropMode).toBe('image');
    expect(root.style.getPropertyValue('--texture')).toBe('url("https://cdn.test/theme/bg.png")');
  });

  it('keeps backdrop mode when no image URL is given, even if the flag is set', () => {
    const root = document.createElement('html');
    applyTheme(root, { ...theme, useImageBackdrop: true, imageBackdrop: null });

    expect(root.dataset.backdropMode).toBeUndefined();
    expect(root.style.getPropertyValue('--texture')).toBe('');
  });

  it('switches from image mode back to backdrop mode', () => {
    const root = document.createElement('html');
    applyTheme(root, theme, 'https://cdn.test/theme/bg.png');
    applyTheme(root, theme);

    expect(root.dataset.backdropMode).toBeUndefined();
    expect(root.style.getPropertyValue('--texture')).toBe('');
  });

  it('clears the image mode when given null', () => {
    const root = document.createElement('html');
    applyTheme(root, theme, 'https://cdn.test/theme/bg.png');
    applyTheme(root, null);

    expect(root.dataset.backdropMode).toBeUndefined();
    expect(root.style.getPropertyValue('--texture')).toBe('');
  });

  it('clears previously applied tokens when given null', () => {
    const root = document.createElement('html');
    applyTheme(root, theme);
    applyTheme(root, null);

    expect(root.style.getPropertyValue('--page-bg')).toBe('');
    expect(root.style.getPropertyValue('--primary')).toBe('');
    expect(root.style.getPropertyValue('--page-grid-size')).toBe('');
    expect(root.style.getPropertyValue('--page-glow-position')).toBe('');
    expect(root.dataset.backdropPattern).toBeUndefined();
  });
});