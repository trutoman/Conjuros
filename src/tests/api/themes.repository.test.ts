// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  InMemoryThemesRepository,
  PostgresThemesRepository,
  type StoredTheme,
} from '../../api/repositories/themes.repository';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import {
  InMemoryUsersRepository,
  PostgresUsersRepository,
} from '../../api/repositories/users.repository';
import { ThemesService } from '../../api/services/themes.service';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  [
    'in-memory',
    () => ({ themes: new InMemoryThemesRepository(), users: new InMemoryUsersRepository() }),
  ],
  [
    'postgres',
    () => ({
      themes: new PostgresThemesRepository(database.db),
      users: new PostgresUsersRepository(database.db),
    }),
  ],
] as const;

function makeTheme(name: string, overrides: Partial<StoredTheme> = {}): StoredTheme {
  const [light] = buildSeedThemes();
  return {
    ...light,
    id: `theme-${name}`,
    name,
    label: name.toUpperCase(),
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const query = { limit: 25, skip: 0, sort: 'name' as const };

describe.each(implementations)('%s themes repository', (_name, createRepositories) => {
  const createRepository = () => createRepositories().themes;

  describe('storage', () => {
    it('keeps a given id and generates one when it is empty', async () => {
      const repository = createRepository();

      const given = await repository.create(makeTheme('given'));
      const generated = await repository.create(makeTheme('generated', { id: '' }));

      expect(given.id).toBe('theme-given');
      expect(generated.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(await repository.findById(generated.id)).toEqual(generated);
    });

    it('round-trips the theme tokens and ISO timestamps', async () => {
      const repository = createRepository();
      const theme = makeTheme('roundtrip', {
        createdAt: '2026-03-04T05:06:07.089Z',
        updatedAt: '2026-05-06T07:08:09.010Z',
      });

      await repository.create(theme);

      expect(await repository.findById(theme.id)).toEqual(theme);
    });

    it('finds themes by name and reports the default theme and the count', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('one', { isDefault: true }));
      await repository.create(makeTheme('two'));

      expect((await repository.findByName('two'))?.id).toBe('theme-two');
      expect(await repository.findByName('missing')).toBeNull();
      expect(await repository.findById('missing')).toBeNull();
      expect((await repository.findDefault())?.id).toBe('theme-one');
      expect(await repository.count()).toBe(2);
    });

    it('returns every theme from findAll in creation order', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('first', { createdAt: '2026-01-01T00:00:00.000Z' }));
      await repository.create(makeTheme('second', { createdAt: '2026-01-02T00:00:00.000Z' }));

      expect((await repository.findAll()).map((theme) => theme.name)).toEqual(['first', 'second']);
    });

    it('replaces a stored theme', async () => {
      const repository = createRepository();
      const theme = await repository.create(makeTheme('editable'));
      const edited = {
        ...theme,
        label: 'Edited',
        colors: { ...theme.colors, primary: '#000000' },
        tagColorPalette: ['#111111'],
        updatedAt: '2026-02-02T00:00:00.000Z',
      };

      expect(await repository.replace(edited)).toEqual(edited);
      expect(await repository.findById(theme.id)).toEqual(edited);
    });

    it('deletes a theme and reports whether one was removed', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('doomed'));

      expect(await repository.delete('theme-doomed')).toBe(true);
      expect(await repository.delete('theme-doomed')).toBe(false);
      expect(await repository.count()).toBe(0);
    });
  });

  describe('list', () => {
    it('searches name and label case-insensitively', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('midnight', { label: 'Deep Ocean' }));
      await repository.create(makeTheme('sunrise', { label: 'Warm Glow' }));

      const byName = await repository.list({ ...query, search: 'MIDNIGHT' });
      const byLabel = await repository.list({ ...query, search: 'glow' });

      expect(byName.items.map((theme) => theme.name)).toEqual(['midnight']);
      expect(byLabel.items.map((theme) => theme.name)).toEqual(['sunrise']);
    });

    it('matches search wildcards literally', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('percent', { label: '100% Dark' }));
      await repository.create(makeTheme('plain', { label: '1000 Dark' }));
      await repository.create(makeTheme('under_score', { label: 'Under_score' }));
      await repository.create(makeTheme('underXscore', { label: 'UnderXscore' }));

      const percent = await repository.list({ ...query, search: '100%' });
      const underscore = await repository.list({ ...query, search: 'under_score' });

      expect(percent.items.map((theme) => theme.name)).toEqual(['percent']);
      expect(underscore.items.map((theme) => theme.name)).toEqual(['under_score']);
    });

    it('sorts by name, label and last update (newest first)', async () => {
      const repository = createRepository();
      await repository.create(
        makeTheme('bravo', { label: 'Alpha', updatedAt: '2026-01-01T00:00:00.000Z' }),
      );
      await repository.create(
        makeTheme('alpha', { label: 'Charlie', updatedAt: '2026-01-03T00:00:00.000Z' }),
      );
      await repository.create(
        makeTheme('charlie', { label: 'Bravo', updatedAt: '2026-01-02T00:00:00.000Z' }),
      );
      const names = async (sort: 'name' | 'label' | 'updatedAt') =>
        (await repository.list({ ...query, sort })).items.map((theme) => theme.name);

      expect(await names('name')).toEqual(['alpha', 'bravo', 'charlie']);
      expect(await names('label')).toEqual(['bravo', 'charlie', 'alpha']);
      expect(await names('updatedAt')).toEqual(['alpha', 'charlie', 'bravo']);
    });

    it('paginates with limit and skip and reports the total of all matches', async () => {
      const repository = createRepository();
      for (const name of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        await repository.create(makeTheme(name));
      }

      const page = await repository.list({ ...query, limit: 3, skip: 3 });

      expect(page.items.map((theme) => theme.name)).toEqual(['d', 'e', 'f']);
      expect(page.total).toBe(7);
    });

    it('pages through themes that share the sort key without repeats or gaps', async () => {
      const repository = createRepository();
      for (const name of ['a', 'b', 'c', 'd', 'e']) {
        await repository.create(makeTheme(name, { updatedAt: '2026-01-01T00:00:00.000Z' }));
      }

      const seen: string[] = [];
      for (let skip = 0; skip < 5; skip += 2) {
        const page = await repository.list({ ...query, sort: 'updatedAt', limit: 2, skip });
        seen.push(...page.items.map((theme) => theme.name));
      }

      expect([...seen].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('setDefault', () => {
    const defaultIds = async (repository: ReturnType<typeof createRepository>) =>
      (await repository.findAll()).filter((theme) => theme.isDefault).map((theme) => theme.id);

    it('promotes the target and demotes the previous default', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('one', { isDefault: true }));
      await repository.create(makeTheme('two'));

      const promoted = await repository.setDefault('theme-two');

      expect(promoted?.isDefault).toBe(true);
      expect(await defaultIds(repository)).toEqual(['theme-two']);
    });

    it('keeps a single default when the target already is the default', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('one', { isDefault: true }));
      await repository.create(makeTheme('two'));

      await repository.setDefault('theme-one');

      expect(await defaultIds(repository)).toEqual(['theme-one']);
    });

    it('returns null and changes nothing for an unknown theme', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('one', { isDefault: true }));

      expect(await repository.setDefault('missing')).toBeNull();
      expect((await repository.findDefault())?.id).toBe('theme-one');
    });

    it('leaves exactly one default after repeated activations', async () => {
      const repository = createRepository();
      await repository.create(makeTheme('one', { isDefault: true }));
      await repository.create(makeTheme('two'));
      await repository.create(makeTheme('three'));

      await repository.setDefault('theme-two');
      await repository.setDefault('theme-three');
      await repository.setDefault('theme-one');

      expect(await defaultIds(repository)).toEqual(['theme-one']);
    });
  });

  describe('ThemesService.ensureSeeded', () => {
    it('seeds the light and dark themes with exactly one default on an empty database', async () => {
      const { themes, users } = createRepositories();
      const service = new ThemesService(themes, users);

      await service.ensureSeeded();

      const all = await themes.findAll();
      expect(all.map((theme) => theme.name).sort()).toEqual(['dark', 'light']);
      expect(all.filter((theme) => theme.isDefault)).toHaveLength(1);
      expect((await themes.findDefault())?.name).toBe('light');
    });

    it('does not seed again when themes already exist', async () => {
      const { themes, users } = createRepositories();
      const service = new ThemesService(themes, users);

      await service.ensureSeeded();
      await service.ensureSeeded();

      expect(await themes.count()).toBe(2);
    });
  });
});
