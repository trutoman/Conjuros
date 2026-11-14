import { describe, expect, it } from 'vitest';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import type { StoredTheme } from '../../api/repositories/themes.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import { InMemoryUserPreferencesRepository } from '../../api/repositories/user-preferences.repository';
import { ThemesService } from '../../api/services/themes.service';
import { grantAdminRole, ensureThemesSeeded } from '../../api/bootstrap';
import { AppError } from '../../api/errors';
import { ICON_ASSETS } from '../../web/lib/iconAssets';
import { MAX_PAGE_SIZE, type ThemeQuery } from '@conjuros/contracts';

function setup() {
  const themes = new InMemoryThemesRepository();
  const users = new InMemoryUsersRepository();
  const preferences = new InMemoryUserPreferencesRepository();
  const service = new ThemesService(themes, preferences);
  return { themes, users, preferences, service };
}

const query: ThemeQuery = { sort: 'name', limit: MAX_PAGE_SIZE, skip: 0 };

describe('themes service', () => {
  it('seeds default themes on an empty collection', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);

    const { items, total } = await service.list(query);
    expect(total).toBe(2);
    expect(items.find((theme) => theme.name === 'light')).toMatchObject({ isDefault: true });
    for (const theme of items) {
      expect(theme.iconAssets.settings).toEqual(ICON_ASSETS.settings);
    }
  });

  it('creates and updates customized settings artwork', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);
    const seed = (await service.list(query)).items[0];
    const first = { path: 'M1 1L2 2', viewBox: '0 0 10 10' };
    const second = { path: 'M3 3L4 4', viewBox: '0 0 20 20' };
    const created = await service.create(service.parseInput({
      ...seed,
      name: 'custom-settings',
      isDefault: false,
      iconAssets: { ...seed.iconAssets, settings: first },
    }));
    expect(created.iconAssets.settings).toEqual(first);
    await service.update(created.id, service.parseUpdate({
      iconAssets: { ...created.iconAssets, settings: second },
    }));
    expect((await service.get(created.id)).iconAssets.settings).toEqual(second);
  });

  it('resolves the active theme from the user theme id preference', async () => {
    const { users, preferences, service } = setup();
    await ensureThemesSeeded(service);
    await users.create('dark@example.com', 'hash');
    const darkUser = (await users.findByEmail('dark@example.com'))!;
    const dark = (await service.list(query)).items.find((theme) => theme.name === 'dark')!;
    await preferences.upsert(darkUser.id, { themeId: dark.id });

    const context = await service.getActiveForUser(darkUser.id);
    expect(context.theme.name).toBe('dark');
    expect(context.source).toBe('preference');
  });

  it('falls back to the default theme when the preference has no matching theme', async () => {
    const { users, preferences, service } = setup();
    await ensureThemesSeeded(service);
    const user = await users.create('x@example.com', 'hash');
    await preferences.upsert(user.id, { themeId: 'missing-theme' });

    const dark = (await service.list(query)).items.find((theme) => theme.name === 'dark')!;
    await service.setActive(dark.id);

    // The selected theme remains a preference while the site fallback changes.
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
      backdrop: {
        pattern: 'lines',
        gridSize: '40px',
        lineWidth: '1px',
        glowPosition: 'top-right',
        glowSize: '30%',
        glowColor: 'rgba(15, 23, 42, 0.04)',
      },
      iconAssets: ['command', 'copy'] as unknown as StoredTheme['iconAssets'],
      kindColors: { command: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488', attachment: '#be123c' },
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
    expect(iconAssets.command).toMatchObject({ path: expect.any(String), viewBox: expect.any(String) });
    expect(iconAssets.copy).toMatchObject({ path: expect.any(String), viewBox: expect.any(String) });
    expect(iconAssets.settings).toEqual(ICON_ASSETS.settings);
  });

  it('lists legacy-shape themes with a normalized iconAssets record', async () => {
    const { themes, service } = setup();
    await seedLegacyArrayTheme(themes);

    const { items } = await service.list(query);
    const light = items.find((theme) => theme.name === 'light')!;
    expect(light.iconAssets).toMatchObject({
      command: { path: expect.any(String), viewBox: expect.any(String) },
      copy: { path: expect.any(String), viewBox: expect.any(String) },
    });
  });

  it('passes a keyed-shape theme through unchanged', async () => {
    const { service } = setup();
    await ensureThemesSeeded(service);

    const { items } = await service.list(query);
    const light = items.find((theme) => theme.name === 'light')!;
    const command = light.iconAssets.command;
    expect(command).toBeDefined();
    const commandPath = command?.path ?? '';
    expect(commandPath).toBeTruthy();
    expect(commandPath).toMatch(/^[Mm]/);
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
      backdrop: {
        pattern: 'lines',
        gridSize: '40px',
        lineWidth: '1px',
        glowPosition: 'top-right',
        glowSize: '30%',
        glowColor: 'rgba(15, 23, 42, 0.04)',
      },
      iconAssets: ['command', 'copy'] as unknown as StoredTheme['iconAssets'],
      kindColors: { command: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488', attachment: '#be123c' },
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
      backdrop: {
        pattern: 'lines',
        gridSize: '40px',
        lineWidth: '1px',
        glowPosition: 'top-right',
        glowSize: '30%',
        glowColor: 'rgba(15, 23, 42, 0.04)',
      },
      iconAssets: {
        command: { path: 'CUSTOM_COMMAND_PATH', viewBox: '0 0 24 24' },
        copy: { path: 'CUSTOM_COPY_PATH', viewBox: '0 0 24 24' },
      } as unknown as StoredTheme['iconAssets'],
      kindColors: { command: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488', attachment: '#be123c' },
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
    const expectedKeys = Object.keys(ICON_ASSETS);
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

    const read = await service.get('theme-light-partial');
    expect(read.iconAssets.settings).toEqual(ICON_ASSETS.settings);
    expect(read.iconAssets.command?.path).toBe('CUSTOM_COMMAND_PATH');
    await service.backfillIconAssets();

    const stored = await themes.findById('theme-light-partial');
    const iconAssets = stored!.iconAssets as Record<string, { path: string; viewBox: string }>;
    expect(iconAssets.command.path).toBe('CUSTOM_COMMAND_PATH');
    expect(iconAssets.copy.path).toBe('CUSTOM_COPY_PATH');
    expect(iconAssets.close).toBeDefined();
    expect(iconAssets.clear).toMatchObject({
      path: ICON_ASSETS.clear.path,
      viewBox: ICON_ASSETS.clear.viewBox,
    });
    expect(iconAssets.sun).toBeDefined();
    expect(iconAssets.moon).toBeDefined();
    expect(iconAssets.add).toBeDefined();
    expect(iconAssets.settings).toEqual(ICON_ASSETS.settings);
  });

  it('preserves customized settings artwork on read and backfill', async () => {
    const { themes, service } = setup();
    await ensureThemesSeeded(service);
    const theme = (await themes.findAll())[0];
    const custom = { path: 'M1 1L2 2', viewBox: '0 0 10 10' };
    await themes.replace({ ...theme, iconAssets: { ...theme.iconAssets, settings: custom } });

    expect((await service.get(theme.id)).iconAssets.settings).toEqual(custom);
    await service.backfillIconAssets();
    expect((await themes.findById(theme.id))?.iconAssets.settings).toEqual(custom);
  });

  it('migrates the superseded bundled settings artwork on read and backfill, preserving custom values', async () => {
    const { themes, service } = setup();
    await ensureThemesSeeded(service);

    const superseded = {
      path: 'm421-132-15-111q-23-7-51-22.5T308-299l-102 46-59-105 90-67q-2-13-3.5-27t-1.5-27q0-12 1.5-26t3.5-30l-90-68 59-102 101 44q22-18 48-33t50-22l16-112h118l15 112q27 10 50 23t45 32l106-44 58 102-94 70q4 15 5 28t1 25q0 11-1.5 24t-4.5 30l93 68-59 105-104-47q-23 20-46.5 34.5T554-244l-15 112H421Zm18-22h81l15-111q30-8 54.5-22t51.5-39l102 44 40-69-90-67q4-19 6-33.5t2-28.5q0-16-2-29.5t-6-30.5l92-69-40-69-105 44q-18-20-49-39t-57-22l-13-111h-82l-12 110q-32 6-57.5 20.5T318-635l-103-43-40 69 90 66q-5 14-7 30t-2 34q0 16 2 31t6 30l-89 67 40 69 102-43q24 25 50 39t59 22l13 110Zm38-241q36 0 60.5-24.5T562-480q0-36-24.5-60.5T477-565q-35 0-60 24.5T392-480q0 36 25 60.5t60 24.5Zm3-85Z',
      viewBox: '0 -960 960 960',
    };
    const custom = { path: 'CUSTOM_SETTINGS_PATH', viewBox: '0 0 24 24' };

    const light = (await themes.findByName('light'))!;
    await themes.replace({ ...light, iconAssets: { ...light.iconAssets, settings: superseded } });
    const dark = (await themes.findByName('dark'))!;
    await themes.replace({ ...dark, iconAssets: { ...dark.iconAssets, settings: custom } });

    expect((await service.get(light.id)).iconAssets.settings).toEqual(ICON_ASSETS.settings);
    expect((await themes.findById(light.id))!.iconAssets.settings).toEqual(superseded);

    await service.backfillIconAssets();

    expect((await themes.findById(light.id))!.iconAssets.settings).toEqual(ICON_ASSETS.settings);
    expect((await themes.findById(dark.id))!.iconAssets.settings).toEqual(custom);
  });

  it('ships the settings artwork on the 24-unit grid without a hardcoded color', () => {
    expect(ICON_ASSETS.settings.viewBox).toBe('0 0 24 24');
    expect(ICON_ASSETS.settings.path.startsWith('M9.25,22')).toBe(true);
    expect(JSON.stringify(ICON_ASSETS.settings)).not.toContain('#');
  });

  it('ships the clear artwork on the 24-unit grid with no hardcoded color', () => {
    expect(ICON_ASSETS.clear.viewBox).toBe('0 0 24 24');
    expect(ICON_ASSETS.clear.path.startsWith('M4 6')).toBe(true);
    expect(JSON.stringify(ICON_ASSETS.clear)).not.toContain('#');
  });

  it('ships the attachment artwork on the 24-unit grid with no hardcoded color', () => {
    expect(ICON_ASSETS.attachment.viewBox).toBe('0 0 24 24');
    expect(ICON_ASSETS.attachment.path.startsWith('M 17 6')).toBe(true);
    expect(JSON.stringify(ICON_ASSETS.attachment)).not.toContain('#');
    for (const [key, entry] of Object.entries(ICON_ASSETS)) {
      if (key === 'settings') continue;
      expect(entry.viewBox).toBe('0 0 24 24');
    }
    expect(ICON_ASSETS.settings.viewBox).toBe('0 0 24 24');
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
    {
      name: '24-grid rescaled path',
      path: 'm11.9 13.5l2.1 -2.1l2.1 2.1l1.4 -1.4l-2.1 -2.1l2.1 -2.1l-1.4 -1.4l-2.1 2.1l-2.1 -2.1l-1.4 1.4l2.1 2.1l-2.1 2.1l1.4 1.4ZM8 18q-0.82 0 -1.41 -0.59T6 16v-12q0 -0.82 0.59 -1.41T8 2h12q0.83 0 1.41 0.59T22 4v12q0 0.83 -0.59 1.41T20 18H8Zm0 -2h12v-12H8v12ZM4 22q-0.82 0 -1.41 -0.59T2 20v-14h2v14h14v2H4Zm4 -18v12v-12Z',
      viewBox: '0 0 24 24',
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

  it('migrates the superseded bundled attachment artwork on read and backfill, preserving custom values', async () => {
    const { themes, service } = setup();
    await ensureThemesSeeded(service);

    const SUPERSEDED = {
      path: 'M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z',
      viewBox: '0 -960 960 960',
    };
    const CUSTOM = { path: 'CUSTOM_ATTACHMENT_PATH', viewBox: '0 0 24 24' };

    const light = (await themes.findByName('light'))!;
    await themes.replace({ ...light, iconAssets: { ...light.iconAssets, attachment: SUPERSEDED } });
    const dark = (await themes.findByName('dark'))!;
    await themes.replace({ ...dark, iconAssets: { ...dark.iconAssets, attachment: CUSTOM } });

    // Read normalization converges without persisting.
    expect((await service.get(light.id)).iconAssets.attachment).toMatchObject({
      path: ICON_ASSETS.attachment.path,
      viewBox: ICON_ASSETS.attachment.viewBox,
    });
    expect((await themes.findById(light.id))!.iconAssets.attachment).toMatchObject(SUPERSEDED);

    await service.backfillIconAssets();

    // Backfill persists the migration while preserving the custom value.
    expect((await themes.findById(light.id))!.iconAssets.attachment).toMatchObject({
      path: ICON_ASSETS.attachment.path,
      viewBox: ICON_ASSETS.attachment.viewBox,
    });
    expect((await themes.findById(dark.id))!.iconAssets.attachment).toMatchObject(CUSTOM);
  });

  it('restores collapse/expand chevrons from the superseded tags artwork on read and backfill', async () => {
    const { themes, service } = setup();
    await ensureThemesSeeded(service);

    const SUPERSEDED = {
      path: 'M 3 2.25 C 1.88 2.25 1.88 4.13 3 4.13 H 4.88 V 20.25 C 4.88 21 5.25 21.38 6 21 L 12 16.5 L 18 21 C 18.75 21.38 19.13 21 19.13 20.25 V 4.13 H 21 C 22.13 4.13 22.13 2.25 21 2.25 Z',
      viewBox: '0 0 24 24',
    };
    const CUSTOM = { path: 'CUSTOM_COLLAPSE_PATH', viewBox: '0 0 24 24' };

    const light = (await themes.findByName('light'))!;
    await themes.replace({
      ...light,
      iconAssets: { ...light.iconAssets, collapse: SUPERSEDED, expand: SUPERSEDED },
    });
    const dark = (await themes.findByName('dark'))!;
    await themes.replace({
      ...dark,
      iconAssets: { ...dark.iconAssets, collapse: CUSTOM, expand: SUPERSEDED },
    });

    // Read normalization converges without persisting.
    expect((await service.get(light.id)).iconAssets.collapse).toMatchObject({
      path: ICON_ASSETS.collapse.path,
      viewBox: ICON_ASSETS.collapse.viewBox,
    });
    expect((await service.get(light.id)).iconAssets.expand).toMatchObject({
      path: ICON_ASSETS.expand.path,
      viewBox: ICON_ASSETS.expand.viewBox,
    });
    expect((await themes.findById(light.id))!.iconAssets.collapse).toMatchObject(SUPERSEDED);

    await service.backfillIconAssets();

    // Backfill persists the migration while preserving the custom value.
    expect((await themes.findById(light.id))!.iconAssets.collapse).toMatchObject({
      path: ICON_ASSETS.collapse.path,
      viewBox: ICON_ASSETS.collapse.viewBox,
    });
    expect((await themes.findById(light.id))!.iconAssets.expand).toMatchObject({
      path: ICON_ASSETS.expand.path,
      viewBox: ICON_ASSETS.expand.viewBox,
    });
    expect((await themes.findById(dark.id))!.iconAssets.collapse).toMatchObject(CUSTOM);
    expect((await themes.findById(dark.id))!.iconAssets.expand).toMatchObject({
      path: ICON_ASSETS.expand.path,
      viewBox: ICON_ASSETS.expand.viewBox,
    });
  });

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
