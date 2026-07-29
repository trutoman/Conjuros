import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { useThemePreference } from '../../hooks/useThemePreference';
import type { ThemePreference } from '@conjuros/contracts';

function ThemeHarness({ initialTheme, enabled }: { initialTheme: ThemePreference; enabled: boolean }) {
  const { theme, setTheme } = useThemePreference(initialTheme, enabled);
  return <ThemeToggle theme={theme} onChange={setTheme} />;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.dataset.theme = 'light';
});

describe('ThemeToggle', () => {
  it('renders the default light theme and switches to dark', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { theme: 'dark' as const } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ThemeHarness initialTheme="light" enabled />);

    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me/theme', expect.objectContaining({ method: 'PATCH' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('keeps a saved dark preference after reload', () => {
    render(<ThemeHarness initialTheme="dark" enabled />);

    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  });
});