import { describe, expect, it } from 'vitest';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import type { StoredTheme } from '../../api/repositories/themes.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import { ThemesService } from '../../api/services/themes.service';
import { grantAdminRole, ensureThemesSeeded } from '../../api/bootstrap';
import { AppError } from '../../api/errors';
import { ICON_ASSETS } from '../../web/lib/iconAssets';
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
  async function seedLegacyArrayTheme(themes: InMemoryThemesRepository, name = 'light') {
    const now = new Date().toISOString();
    const stored = {
      id: `theme-${name}-legacy-array`,
      name,
      label: name === 'light' ? 'Light' : 'Dark',
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
    await seedLegacyArrayTheme(themes);

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
    await seedLegacyArrayTheme(themes);

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

describe('iconAssets backfill', () => {
  async function seedLegacyArrayTheme(themes: InMemoryThemesRepository, name = 'light') {
    const now = new Date().toISOString();
    const stored = {
      id: `theme-${name}-legacy-array`,
      name,
      label: name === 'light' ? 'Light' : 'Dark',
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

  async function seedPartialKeyedTheme(themes: InMemoryThemesRepository) {
    const now = new Date().toISOString();
    const partial = {
      id: 'theme-light-partial',
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
      iconAssets: {
        spell: { path: 'CUSTOM_SPELL_PATH', viewBox: '0 0 24 24' },
        copy: { path: 'CUSTOM_COPY_PATH', viewBox: '0 0 24 24' },
      } as unknown as StoredTheme['iconAssets'],
      kindColors: { spell: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488' },
      tagColorPalette: ['#1A73E8', '#7C3AED'],
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredTheme;
    await themes.create(partial);
    return partial;
  }

  it('upserts a legacy-shape document to a full keyed record', async () => {
    const { themes, service } = setup();
    await seedLegacyArrayTheme(themes);

    await service.backfillIconAssets();

    const stored = await themes.findById('theme-light-legacy-array');
    expect(stored).not.toBeNull();
    const iconAssets = stored!.iconAssets as Record<string, { path: string; viewBox: string }>;
    const expectedKeys = ['spell', 'web-link', 'markdown', 'file', 'copy', 'open', 'view', 'download', 'menu', 'edit', 'delete', 'confirm', 'cancel', 'expand', 'collapse', 'close', 'clear', 'search', 'sun', 'moon', 'add'];
    for (const key of expectedKeys) {
      expect(iconAssets[key]).toBeDefined();
      expect(iconAssets[key].path).toBe(ICON_ASSETS[key as keyof typeof ICON_ASSETS].path);
      expect(iconAssets[key].viewBox).toBe(ICON_ASSETS[key as keyof typeof ICON_ASSETS].viewBox);
    }
    expect(Object.keys(iconAssets).length).toBe(expectedKeys.length);
  });

  it('preserves custom paths and only fills missing keys', async () => {
    const { themes, service } = setup();
    await seedPartialKeyedTheme(themes);

    await service.backfillIconAssets();

    const stored = await themes.findById('theme-light-partial');
    const iconAssets = stored!.iconAssets as Record<string, { path: string; viewBox: string }>;
    expect(iconAssets.spell.path).toBe('CUSTOM_SPELL_PATH');
    expect(iconAssets.copy.path).toBe('CUSTOM_COPY_PATH');
    expect(iconAssets.close).toBeDefined();
    expect(iconAssets.clear).toMatchObject({
      path: ICON_ASSETS.clear.path,
      viewBox: ICON_ASSETS.clear.viewBox,
    });
    expect(iconAssets.sun).toBeDefined();
    expect(iconAssets.moon).toBeDefined();
    expect(iconAssets.add).toBeDefined();
  });

  it('ships the rescaled clear artwork on the 24-unit grid with no hardcoded color', () => {
    expect(ICON_ASSETS.clear.viewBox).toBe('0 0 24 24');
    expect(ICON_ASSETS.clear.path.startsWith('m11.9 13.5')).toBe(true);
    expect(JSON.stringify(ICON_ASSETS.clear)).not.toContain('#');
    // Uniform grid + shared `.icon` styling ⇒ same visual weight for every icon.
    for (const entry of Object.values(ICON_ASSETS)) {
      expect(entry.viewBox).toBe('0 0 24 24');
    }
  });

  it.each([
    {
      name: 'outline redrawing',
      path: 'M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5z M17.5 8.5l3 3 M20.5 8.5l-3 3',
      viewBox: '0 0 24 24',
    },
    {
      name: '960-grid verbatim path',
      path: 'm476-420 84-84 84 84 56-56-84-84 84-84-56-56-84 84-84-84-56 56 84 84-84 84 56 56ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z',
      viewBox: '0 -960 960 960',
    },
  ])(
    'migrates the superseded bundled clear artwork ($name) on read and backfill, preserving custom values',
    async ({ path, viewBox }) => {
      const { themes, service } = setup();
      await ensureThemesSeeded(service);

      const SUPERSEDED = { path, viewBox };
      const CUSTOM = { path: 'CUSTOM_CLEAR_PATH', viewBox: '0 0 24 24' };

      const light = (await themes.findByName('light'))!;
      await themes.replace({ ...light, iconAssets: { ...light.iconAssets, clear: SUPERSEDED } });
      const dark = (await themes.findByName('dark'))!;
      await themes.replace({ ...dark, iconAssets: { ...dark.iconAssets, clear: CUSTOM } });

      // Read normalization converges without persisting.
      expect((await service.get(light.id)).iconAssets.clear).toMatchObject({
        path: ICON_ASSETS.clear.path,
        viewBox: ICON_ASSETS.clear.viewBox,
      });
      expect((await themes.findById(light.id))!.iconAssets.clear).toMatchObject(SUPERSEDED);

      await service.backfillIconAssets();

      // Backfill persists the migration while preserving the custom value.
      expect((await themes.findById(light.id))!.iconAssets.clear).toMatchObject({
        path: ICON_ASSETS.clear.path,
        viewBox: ICON_ASSETS.clear.viewBox,
      });
      expect((await themes.findById(dark.id))!.iconAssets.clear).toMatchObject(CUSTOM);
    },
  );

  it('is idempotent on a second run', async () => {
    const { themes, service } = setup();
    await seedLegacyArrayTheme(themes);

    await service.backfillIconAssets();
    const firstUpdatedAt = (await themes.findById('theme-light-legacy-array'))!.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    await service.backfillIconAssets();
    const secondUpdatedAt = (await themes.findById('theme-light-legacy-array'))!.updatedAt;

    expect(secondUpdatedAt).toBe(firstUpdatedAt);
  });

  it('is a no-op when the collection is empty', async () => {
    const { service } = setup();
    await expect(service.backfillIconAssets()).resolves.toBeUndefined();
  });

  it('passes through a fully keyed record unchanged', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);

    const before = await service.list(query);
    const beforeUpdatedAt = before.items[0].updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    await service.backfillIconAssets();

    const after = await service.list(query);
    expect(after.items[0].updatedAt).toBe(beforeUpdatedAt);
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