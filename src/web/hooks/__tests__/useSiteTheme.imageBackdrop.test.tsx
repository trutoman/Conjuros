import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '@conjuros/contracts';
import { useSiteTheme } from '../useSiteTheme';
import { getActiveTheme } from '../../services/themes';

vi.mock('../../services/themes', () => ({ getActiveTheme: vi.fn() }));

const images: FakeImage[] = [];

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    images.push(this);
  }
}

const baseTheme: Theme = {
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
  fonts: { display: 'serif', body: 'serif', mono: 'monospace' },
  fontSizes: { heading: '2rem', body: '1rem', mono: '0.75rem' },
  backdrop: {
    pattern: 'lines',
    gridSize: '40px',
    lineWidth: '1px',
    glowPosition: 'top-right',
    glowSize: '30%',
    glowColor: 'rgba(15, 23, 42, 0.04)',
  },
  useImageBackdrop: true,
  imageBackdrop: { storagePath: 'themes/theme-light/bg.png', mimeType: 'image/png', sizeBytes: 64 },
  imageBackdropUrl: 'https://cdn.test/themes/theme-light/bg.png',
  iconAssets: { command: { path: 'M0 0', viewBox: '0 0 24 24' } },
  kindColors: {
    command: '#7c3aed',
    webLink: '#2563eb',
    markdown: '#b45309',
    file: '#0d9488',
    attachment: '#be123c',
  },
  tagColorPalette: ['#1A73E8'],
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function mockActiveTheme(theme: Theme) {
  vi.mocked(getActiveTheme).mockResolvedValue({ theme, source: 'preference' });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  images.length = 0;
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  root.removeAttribute('data-backdrop-mode');
  root.style.cssText = '';
});

describe('useSiteTheme image backdrop probe', () => {
  it('switches to image mode once the image loads', async () => {
    vi.stubGlobal('Image', FakeImage);
    mockActiveTheme(baseTheme);

    renderHook(() => useSiteTheme(true, 'light'));

    await waitFor(() => expect(images).toHaveLength(1));
    expect(document.documentElement.dataset.backdropMode).toBeUndefined();
    expect(images[0].src).toBe('https://cdn.test/themes/theme-light/bg.png');

    images[0].onload?.();

    expect(document.documentElement.dataset.backdropMode).toBe('image');
    expect(document.documentElement.style.getPropertyValue('--texture')).toBe(
      'url("https://cdn.test/themes/theme-light/bg.png")',
    );
  });

  it('stays in backdrop mode when the image never loads', async () => {
    vi.stubGlobal('Image', FakeImage);
    mockActiveTheme(baseTheme);

    renderHook(() => useSiteTheme(true, 'light'));

    await waitFor(() => expect(images).toHaveLength(1));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.dataset.backdropMode).toBeUndefined();
  });

  it('ignores a probe that finishes after the hook unmounts', async () => {
    vi.stubGlobal('Image', FakeImage);
    mockActiveTheme(baseTheme);

    const { unmount } = renderHook(() => useSiteTheme(true, 'light'));

    await waitFor(() => expect(images).toHaveLength(1));
    unmount();
    images[0].onload?.();

    expect(document.documentElement.dataset.backdropMode).toBeUndefined();
  });

  it('does not probe a theme without the image flag', async () => {
    vi.stubGlobal('Image', FakeImage);
    mockActiveTheme({ ...baseTheme, useImageBackdrop: false });

    renderHook(() => useSiteTheme(true, 'light'));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));
    expect(images).toHaveLength(0);
  });
});
