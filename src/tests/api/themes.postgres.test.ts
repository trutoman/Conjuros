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
