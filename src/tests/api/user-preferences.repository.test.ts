// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { users } from '../../api/db/schema';
import { InMemoryThemesRepository, PostgresThemesRepository } from '../../api/repositories/themes.repository';
import {
  InMemoryUserPreferencesRepository,
  PostgresUserPreferencesRepository,
} from '../../api/repositories/user-preferences.repository';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  ['in-memory', () => ({ preferences: new InMemoryUserPreferencesRepository(), themes: new InMemoryThemesRepository() })],
  ['postgres', () => ({ preferences: new PostgresUserPreferencesRepository(database.db), themes: new PostgresThemesRepository(database.db) })],
] as const;

describe.each(implementations)('%s user preferences repository', (name, createRepositories) => {
  it('returns defaults when a user has no preference row', async () => {
    const { preferences } = createRepositories();

    expect(await preferences.get('user-1')).toEqual({ themeId: null, tagsPanelExpanded: true });
  });

  it('upserts partial values and preserves fields omitted by later updates', async () => {
    const { preferences, themes } = createRepositories();
    const userId = `user-${randomUUID()}`;
    const [seed] = buildSeedThemes();
    const theme = await themes.create({ ...seed, id: 'theme-dark', name: 'dark', isDefault: false });
    if (name === 'postgres') {
      await database.db.insert(users).values({
        id: userId,
        email: `${userId}@example.com`,
        passwordHash: 'hash',
        createdAt: new Date(),
      });
    }

    expect(await preferences.upsert(userId, { tagsPanelExpanded: false })).toEqual({
      themeId: null,
      tagsPanelExpanded: false,
    });
    expect(await preferences.upsert(userId, { themeId: theme.id })).toEqual({
      themeId: theme.id,
      tagsPanelExpanded: false,
    });
  });
});

describe('Postgres user preference foreign key', () => {
  it('clears a selected theme when that theme is deleted', async () => {
    const [theme] = buildSeedThemes();
    const userId = `user-${randomUUID()}`;
    await database.db.insert(users).values({
      id: userId,
      email: `${userId}@example.com`,
      passwordHash: 'hash',
      createdAt: new Date(),
    });
    const postgresThemes = new PostgresThemesRepository(database.db);
    await postgresThemes.create({ ...theme, id: 'theme-to-delete', name: 'theme-to-delete', isDefault: false });
    const preferences = new PostgresUserPreferencesRepository(database.db);
    await preferences.upsert(userId, { themeId: 'theme-to-delete' });

    await postgresThemes.delete('theme-to-delete');

    expect(await preferences.get(userId)).toEqual({ themeId: null, tagsPanelExpanded: true });
  });
});
