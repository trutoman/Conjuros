// @vitest-environment node
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { UNIQUE_VIOLATION } from '../../api/db/sqlstate';
import {
  PostgresThemesRepository,
  type StoredTheme,
} from '../../api/repositories/themes.repository';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { setupPgliteDatabase, sqlStateOf } from './pglite';

const database = setupPgliteDatabase();

function makeTheme(name: string, overrides: Partial<StoredTheme> = {}): StoredTheme {
  const [light] = buildSeedThemes();
  return { ...light, id: `theme-${name}`, name, label: name, isDefault: false, ...overrides };
}

describe('PostgresThemesRepository', () => {
  it('round-trips the image backdrop reference', async () => {
    const repository = new PostgresThemesRepository(database.db);
    const reference = { storagePath: 'themes/theme-image/a.webp', mimeType: 'image/webp' as const, sizeBytes: 2048 };
    await repository.create(makeTheme('image', { imageBackdrop: reference }));

    expect((await repository.findById('theme-image'))?.imageBackdrop).toEqual(reference);
  });

  it('reads rows written before the image columns existed as backdrop mode', async () => {
    const [light] = buildSeedThemes();
    await database.db.execute(sql`
      INSERT INTO themes (id, name, label, colors, font_sizes, fonts, backdrop, icon_assets, kind_colors,
        tag_color_palette, is_default, created_at, updated_at)
      VALUES ('theme-legacy', 'legacy', 'Legacy',
        ${JSON.stringify(light.colors)}::jsonb, ${JSON.stringify(light.fontSizes)}::jsonb,
        ${JSON.stringify(light.fonts)}::jsonb, ${JSON.stringify(light.backdrop)}::jsonb,
        ${JSON.stringify(light.iconAssets)}::jsonb, ${JSON.stringify(light.kindColors)}::jsonb,
        ARRAY['#1A73E8']::text[], false, now(), now())`);

    const repository = new PostgresThemesRepository(database.db);
    expect(await repository.findById('theme-legacy')).toMatchObject({
      useImageBackdrop: false,
      imageBackdrop: null,
    });
  });

  it('rejects a second theme with an existing name', async () => {
    const repository = new PostgresThemesRepository(database.db);
    await repository.create(makeTheme('midnight'));

    const state = await sqlStateOf(repository.create(makeTheme('midnight', { id: 'another-id' })));

    expect(state).toBe(UNIQUE_VIOLATION);
    expect(await repository.count()).toBe(1);
  });

  it('rejects a second default theme and keeps the first one', async () => {
    const repository = new PostgresThemesRepository(database.db);
    await repository.create(makeTheme('one', { isDefault: true }));

    const created = await sqlStateOf(repository.create(makeTheme('two', { isDefault: true })));
    await repository.create(makeTheme('three'));
    const replaced = await sqlStateOf(repository.replace(makeTheme('three', { isDefault: true })));

    expect(created).toBe(UNIQUE_VIOLATION);
    expect(replaced).toBe(UNIQUE_VIOLATION);
    expect((await repository.findDefault())?.id).toBe('theme-one');
  });

  it('keeps the previous default when activating another theme fails', async () => {
    const repository = new PostgresThemesRepository(database.db);
    await repository.create(makeTheme('one', { isDefault: true }));
    await repository.create(makeTheme('two'));
    await database.db.execute(sql`
      CREATE FUNCTION reject_theme_two() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.is_default AND NEW.id = 'theme-two' THEN RAISE EXCEPTION 'activation rejected'; END IF;
        RETURN NEW;
      END $$`);
    await database.db.execute(sql`
      CREATE TRIGGER reject_theme_two BEFORE UPDATE ON themes
      FOR EACH ROW EXECUTE FUNCTION reject_theme_two()`);

    try {
      await expect(repository.setDefault('theme-two')).rejects.toBeDefined();
    } finally {
      await database.db.execute(sql`DROP TRIGGER reject_theme_two ON themes`);
      await database.db.execute(sql`DROP FUNCTION reject_theme_two()`);
    }

    expect((await repository.findDefault())?.id).toBe('theme-one');
  });

  it('handles simultaneous activations one after the other', async () => {
    const repository = new PostgresThemesRepository(database.db);
    await repository.create(makeTheme('one', { isDefault: true }));
    await repository.create(makeTheme('two'));
    await repository.create(makeTheme('three'));

    await Promise.all([repository.setDefault('theme-two'), repository.setDefault('theme-three')]);

    const defaults = (await repository.findAll()).filter((theme) => theme.isDefault);
    expect(defaults).toHaveLength(1);
  });
});
