import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useThemePreference } from '../useThemePreference';

describe('useThemePreference', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('saves a selected theme id through the preferences endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { preferences: { themeId: 'theme-dark', tagsPanelExpanded: true } } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useThemePreference('theme-light', true));

    await act(async () => result.current.setTheme('theme-dark'));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me/preferences', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ themeId: 'theme-dark' }),
    }));
    expect(result.current.themeId).toBe('theme-dark');
    expect(result.current.settledThemeId).toBe('theme-dark');
  });

  it('rolls back to the previous id when saving fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Save failed' } }),
    }));
    const { result } = renderHook(() => useThemePreference('theme-light', true));

    await act(async () => {
      await expect(result.current.setTheme('theme-dark')).rejects.toThrow('Save failed');
    });

    expect(result.current.themeId).toBe('theme-light');
    expect(result.current.settledThemeId).toBe('theme-light');
  });

  it('updates local selection without persistence when disabled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useThemePreference(null, false));

    await act(async () => result.current.setTheme('theme-custom'));

    expect(result.current.themeId).toBe('theme-custom');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resets to the new initial preference', async () => {
    const { result, rerender } = renderHook(
      ({ themeId }) => useThemePreference(themeId, true),
      { initialProps: { themeId: 'theme-light' as string | null } },
    );
    rerender({ themeId: 'theme-dark' });

    await waitFor(() => expect(result.current.themeId).toBe('theme-dark'));
    expect(result.current.settledThemeId).toBe('theme-dark');
  });
});
