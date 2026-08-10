import { describe, expect, it } from 'vitest';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import type { StoredTheme } from '../../api/repositories/themes.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import { ThemesService } from '../../api/services/themes.service';
import { grantAdminRole, ensureThemesSeeded } from '../../api/bootstrap';
import { AppError } from '../../api/errors';
import type { ThemeQuery } from '@conjuros/contracts';

function setup() {
  const themes = new InMemoryThemesRepository();
  const users = new InMemoryUsersRepository();
  const service = new ThemesService(themes, users);
  return { themes, users, service };
}

const query: ThemeQuery = { sort: 'name', limit: 50, skip: 0 };

describe('themes service', () => {
  it('seeds default themes on an empty collection', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);

    const { items, total } = await service.list(query);
    expect(total).toBe(2);
    expect(items.find((theme) => theme.name === 'light')).toMatchObject({ isDefault: true });
  });

  it('resolves the active theme from the user theme preference', async () => {
    const { users, service } = setup();
    await ensureThemesSeeded(service);
    users.create('dark@example.com', 'hash');
    const darkUser = (await users.findByEmail('dark@example.com'))!;
    await users.setRole(darkUser.id, 'user');

    const context = await service.getActiveForUser(darkUser.id);
    expect(context.theme.name).toBe('light');
    expect(context.source).toBe('preference');
  });

  it('falls back to the default theme when the preference has no matching theme', async () => {
    const { users, service } = setup();
    await ensureThemesSeeded(service);
    const user = await users.create('x@example.com', 'hash');
    await users.updateTheme(user.id, 'dark');

    const dark = (await service.list(query)).items.find((theme) => theme.name === 'dark')!;
    await service.setActive(dark.id);

    // remove light entirely, then a light-preferring user still gets dark as fallback
    const fallbackContext = await service.getActiveForUser(user.id);
    expect(fallbackContext.theme.name).toBe('dark');
  });

  it('exposes a null palette when no theme is available', async () => {
    const { users, service } = setup();
    const user = await users.create('x@example.com', 'hash');

    expect(await service.getActivePaletteForUser(user.id)).toBeNull();
  });

  it('enforces palette membership case-insensitively', async () => {
    const { users, service } = setup();
    await ensureThemesSeeded(service);
    const user = await users.create('x@example.com', 'hash');

    await expect(service.assertTagColorInPalette(user.id, '#1A73E8')).resolves.toBeUndefined();
    await expect(service.assertTagColorInPalette(user.id, '#1a73e8')).resolves.toBeUndefined();
    await expect(service.assertTagColorInPalette(user.id, '#FFFFFF')).rejects.toBeInstanceOf(AppError);
  });

  it('prevents deleting the default theme', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);
    const light = (await service.list(query)).items.find((theme) => theme.name === 'light')!;

    await expect(service.delete(light.id)).rejects.toMatchObject({ status: 409 });
  });

  it('changes the site default theme and falls back to it when no preference matches', async () => {
    const { users, service } = setup();
    await ensureThemesSeeded(service);
    const dark = (await service.list(query)).items.find((theme) => theme.name === 'dark')!;
    await service.setActive(dark.id);

    const light = (await service.list(query)).items.find((theme) => theme.name === 'light')!;
    await service.delete(light.id);

    const user = await users.create('x@example.com', 'hash');

    const context = await service.getActiveForUser(user.id);
    expect(context.theme.name).toBe('dark');
    expect(context.source).toBe('default');
  });
});

describe('legacy iconAssets shape migration', () => {
  async function seedLegacyTheme(themes: InMemoryThemesRepository) {
    const now = new Date().toISOString();
    const stored = {
      id: 'theme-light-legacy',
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
      fontSizes: { heading: '2.65rem', body: '1rem', mono: '0.75rem' },
      iconAssets: ['spell', 'copy'] as unknown as StoredTheme['iconAssets'],
      kindColors: { spell: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488' },
      tagColorPalette: ['#1A73E8', '#7C3AED'],
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredTheme;
    await themes.create(stored);
    return stored;
  }

  it('resolves a stored theme whose iconAssets is the legacy array shape', async () => {
    const { themes, service } = setup();
    await seedLegacyTheme(themes);

    const context = await service.getActiveForUser('nobody@example.com');
    expect(context.theme.name).toBe('light');
    const { iconAssets } = context.theme;
    expect(Array.isArray(iconAssets)).toBe(false);
    expect(typeof iconAssets).toBe('object');
    expect(iconAssets.spell).toMatchObject({ path: expect.any(String), viewBox: expect.any(String) });
    expect(iconAssets.copy).toMatchObject({ path: expect.any(String), viewBox: expect.any(String) });
  });

  it('lists legacy-shape themes with a normalized iconAssets record', async () => {
    const { themes, service } = setup();
    await seedLegacyTheme(themes);

    const { items } = await service.list(query);
    const light = items.find((theme) => theme.name === 'light')!;
    expect(light.iconAssets).toMatchObject({
      spell: { path: expect.any(String), viewBox: expect.any(String) },
      copy: { path: expect.any(String), viewBox: expect.any(String) },
    });
  });

  it('passes a keyed-shape theme through unchanged', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);

    const { items } = await service.list(query);
    const light = items.find((theme) => theme.name === 'light')!;
    const spell = light.iconAssets.spell;
    expect(spell).toBeDefined();
    const spellPath = spell?.path ?? '';
    expect(spellPath).toBeTruthy();
    expect(spellPath).toMatch(/^[Mm]/);
  });
});

describe('admin bootstrap', () => {
  it('grants admin role to the matching account idempotently', async () => {
    const { users } = setup();
    const user = await users.create('admin@example.com', 'hash');
    expect(user.role).toBe('user');

    await grantAdminRole(users, 'admin@example.com');
    const first = (await users.findByEmail('admin@example.com'))!;
    expect(first.role).toBe('admin');

    await grantAdminRole(users, 'admin@example.com');
    const second = (await users.findByEmail('admin@example.com'))!;
    expect(second.role).toBe('admin');
  });

  it('does nothing when no admin email is configured', async () => {
    const { users } = setup();
    await users.create('admin@example.com', 'hash');

    await grantAdminRole(users, null);
    expect((await users.findByEmail('admin@example.com'))!.role).toBe('user');
  });
});