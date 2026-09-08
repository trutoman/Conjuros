import { describe, expect, it } from 'vitest';

import {
  legacyCategoryOf,
  planMigration,
  verifyMigration,
  type CategoryDoc,
  type LegacyTagDoc,
  type MigrationPlan,
} from '../../../scripts/migrate-tag-category-storage.lib.mjs';

const OWNER = 'owner-1';
const OTHER = 'owner-2';

function tag(id: string, ownerId: string, fields: Record<string, unknown> = {}): LegacyTagDoc {
  return { _id: `db-${id}`, id, ownerId, tagName: id, ...fields };
}

function category(id: string, ownerId: string, name: string, tagIds: string[]): CategoryDoc {
  return { id, ownerId, name, nameNormalized: name, tagIds };
}

describe('migrate tag category storage', () => {
  it('groups legacy categories case-insensitively and falls back to general', () => {
    expect(legacyCategoryOf(tag('a', OWNER, { tagCategory: 'Work' }))).toBe('work');
    expect(legacyCategoryOf(tag('b', OWNER, { tagCategoryNormalized: 'Hobby' }))).toBe('hobby');
    expect(legacyCategoryOf(tag('c', OWNER, {}))).toBe('general');
    expect(legacyCategoryOf(tag('d', OWNER, { tagCategory: '   ' }))).toBe('general');
  });

  it('plans entities, assignments, and field cleanup per owner', () => {
    const plan = planMigration({
      tags: [
        tag('a', OWNER, { tagCategory: 'Work' }),
        tag('b', OWNER, { tagCategory: 'work' }),
        tag('c', OWNER, {}),
        tag('d', OTHER, { tagCategory: 'work' }),
      ],
      categories: [],
    });

    expect(plan.owners).toEqual(expect.arrayContaining([OWNER, OTHER]));
    expect(plan.entitiesToCreate).toEqual(
      expect.arrayContaining([
        { ownerId: OWNER, name: 'work' },
        { ownerId: OWNER, name: 'general' },
        { ownerId: OTHER, name: 'work' },
        { ownerId: OTHER, name: 'general' },
      ]),
    );
    expect(plan.entitiesToCreate).toHaveLength(4);

    const work = plan.assignments.find((group) => group.ownerId === OWNER && group.name === 'work');
    expect(work?.tagIds).toEqual(expect.arrayContaining(['a', 'b']));
    expect(plan.unsetIds).toEqual(expect.arrayContaining(['db-a', 'db-b', 'db-d']));
    expect(plan.unsetIds).not.toContain('db-c');
  });

  it('does not recreate existing entities and is a no-op on migrated data', () => {
    const tags = [tag('a', OWNER, {})];
    const categories = [category('cat-general', OWNER, 'general', ['a'])];

    const plan = planMigration({ tags, categories });
    expect(plan.entitiesToCreate).toEqual([]);

    expect(verifyMigration({ tags, categories }).ok).toBe(true);
  });

  it('verification fails on leftover fields, missing members, and duplicates', () => {
    const leftover = verifyMigration({
      tags: [tag('a', OWNER, { tagCategory: 'work' })],
      categories: [category('c1', OWNER, 'work', ['a'])],
    });
    expect(leftover.ok).toBe(false);
    expect(leftover.errors.join(' ')).toContain('legacy category fields');

    const missing = verifyMigration({
      tags: [tag('a', OWNER, {})],
      categories: [category('c1', OWNER, 'general', [])],
    });
    expect(missing.ok).toBe(false);
    expect(missing.errors.join(' ')).toContain('missing from every category');

    const duplicate = verifyMigration({
      tags: [tag('a', OWNER, {})],
      categories: [
        category('c1', OWNER, 'general', ['a']),
        category('c2', OWNER, 'work', ['a']),
      ],
    });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.errors.join(' ')).toContain('multiple categories');
  });

  it('simulates the full migration: plan, apply, verify, re-run', () => {
    const tags = [
      tag('a', OWNER, { tagCategory: 'Work', tagCategoryNormalized: 'work' }),
      tag('b', OWNER, {}),
    ];
    let categories: CategoryDoc[] = [];
    const upsertCategory = (doc: CategoryDoc) => {
      categories = [...categories.filter((c) => c.id !== doc.id), doc];
    };

    const applyPlan = (plan: MigrationPlan) => {
      for (const entity of plan.entitiesToCreate) {
        upsertCategory({
          id: `cat-${entity.ownerId}-${entity.name}`,
          ownerId: entity.ownerId,
          name: entity.name,
          nameNormalized: entity.name,
          tagIds: [],
        });
      }
      for (const group of plan.assignments) {
        const found = categories.find((c) => c.ownerId === group.ownerId && c.name === group.name);
        if (!found) throw new Error(`Missing category ${group.name}`);
        found.tagIds = [...new Set([...(found.tagIds ?? []), ...group.tagIds])];
      }
      for (const t of tags) {
        delete t.tagCategory;
        delete t.tagCategoryNormalized;
      }
    };

    applyPlan(planMigration({ tags, categories }));
    expect(verifyMigration({ tags, categories }).ok).toBe(true);

    const second = planMigration({ tags, categories });
    expect(second.entitiesToCreate).toEqual([]);
    expect(second.unsetIds).toEqual([]);
    expect(verifyMigration({ tags, categories }).ok).toBe(true);
  });
});
