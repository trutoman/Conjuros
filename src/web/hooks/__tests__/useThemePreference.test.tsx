import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSiteTheme } from '../useSiteTheme';
import { useThemePreference } from '../useThemePreference';
import type { Theme, ThemePreference } from '@conjuros/contracts';

const lightTheme: Theme = {
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
  iconAssets: ['spell'],
  kindColors: { spell: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488' },
  tagColorPalette: ['#1A73E8'],
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const darkTheme: Theme = { ...lightTheme, id: 'theme-dark', name: 'dark', label: 'Dark', isDefault: false };

function Harness({ initialTheme }: { initialTheme: ThemePreference }) {
  const preference = useThemePreference(initialTheme, true);
  useSiteTheme(true, preference.settledTheme);
  const { theme, setTheme } = preference;
  return (
    <div>
      <button
        type="button"
        aria-pressed={theme === 'light'}
        onClick={() => void setTheme('light').catch(() => undefined)}
      >
        Light mode
      </button>
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        onClick={() => void setTheme('dark').catch(() => undefined)}
      >
        Dark mode
      </button>
    </div>
  );
}

function activeThemeResponse(theme: Theme) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ theme, source: 'preference' as const }),
  };
}

function themeForPreference(preference: ThemePreference): Theme {
  return preference === 'dark' ? darkTheme : lightTheme;
}

function preferenceAwareFetch() {
  let storedPreference: ThemePreference = 'light';
  const fetchMock = vi.fn((url: string, options?: RequestInit) => {
    if (url === '/api/auth/me/theme' && options?.method === 'PATCH') {
      const body = JSON.parse(String(options.body)) as { theme?: ThemePreference };
      if (!body.theme) {
        return Promise.resolve({ ok: false, status: 400, json: async () => ({ error: { message: 'invalid' } }) });
      }
      storedPreference = body.theme;
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ user: { theme: storedPreference } }) });
    }
    if (url === '/api/themes/active') {
      return Promise.resolve(activeThemeResponse(themeForPreference(storedPreference)));
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  });
  return { fetchMock, getStoredPreference: () => storedPreference };
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetRoot();
});

function resetRoot() {
  const style = document.documentElement.style;
  for (const property of ['--page-bg', '--primary', 'color-scheme']) {
    style.removeProperty(property);
  }
  delete document.documentElement.dataset.theme;
}

describe('theme preference flows', () => {
  it('applies the active theme resolved from the settled preference on load', async () => {
    const { fetchMock } = preferenceAwareFetch();
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/themes/active') return Promise.resolve(activeThemeResponse(darkTheme));
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Harness initialTheme="dark" />);

    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue('--page-bg')).toBe(darkTheme.colors.pageBg),
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists the new preference then re-applies the matching theme', async () => {
    const { fetchMock } = preferenceAwareFetch();
    vi.stubGlobal('fetch', fetchMock);

    render(<Harness initialTheme="light" />);
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe('light'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/me/theme', expect.objectContaining({ method: 'PATCH' }));
      expect(document.documentElement.style.getPropertyValue('--page-bg')).toBe(darkTheme.colors.pageBg);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reverts the preference on PATCH failure without changing the applied theme', async () => {
    const { fetchMock } = preferenceAwareFetch();
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/auth/me/theme' && options?.method === 'PATCH') {
        return Promise.resolve({ ok: false, status: 500, json: async () => ({ error: { message: 'boom' } }) });
      }
      if (url === '/api/themes/active') return Promise.resolve(activeThemeResponse(lightTheme));
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Harness initialTheme="light" />);
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe('light'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true'));
    expect(document.documentElement.style.getPropertyValue('--page-bg')).toBe(lightTheme.colors.pageBg);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('refetches the active theme when the settled preference changes', async () => {
    const { fetchMock } = preferenceAwareFetch();
    vi.stubGlobal('fetch', fetchMock);

    render(<Harness initialTheme="light" />);
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));

    fetchMock.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/themes/active', expect.anything());
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });

  it('does not write a bare data-theme attribute before the theme is applied', async () => {
    let resolveActive: ((value: Response | { ok: boolean; status: number; json: () => Promise<unknown> }) => void) | null = null;
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url === '/api/auth/me/theme' && options?.method === 'PATCH') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ user: { theme: 'dark' } }) });
      }
      if (url === '/api/themes/active') {
        return new Promise((resolve) => {
          resolveActive = resolve;
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Harness initialTheme="light" />);
    expect(document.documentElement.dataset.theme).toBe(undefined);

    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true'));

    await act(async () => {
      resolveActive?.({ ...activeThemeResponse(darkTheme), json: async () => ({ theme: darkTheme, source: 'preference' as const }) });
    });
  });
});