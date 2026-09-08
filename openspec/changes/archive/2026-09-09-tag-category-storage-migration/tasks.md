## 1. Contracts

- [x] 1.1 Drop `tagCategory` from the stored tag shape; persist `tagIds` on `StoredTagCategory` (keep public `Tag`/`TagCategory` payloads unchanged)
- [x] 1.2 Keep `tagInputSchema`/`tagUpdateSchema` category input semantics (absent/blank resolves to `general`, same validation)

## 2. Repositories

- [x] 2.1 Remove `tagCategory`/`tagCategoryNormalized`, `hydrateTag`, `PersistedTagRecord`, and legacy query branches from `tags.repository.ts` (InMemory + Mongo)
- [x] 2.2 Store `tagIds` on `tagCategories` documents and add member operations (`addMembers`, `removeMember`, `moveMembers`) to `tag-categories.repository.ts` (InMemory + Mongo)
- [x] 2.3 Remove `renameCategoryForOwnerTags`/`findOwnedByCategoryNormalized` from the tags repository once callers are migrated

## 3. Services and API

- [x] 3.1 Resolve tag reads through category membership and keep deriving `tagCategory` in public tag payloads (batch owner categories per request, join in memory)
- [x] 3.2 Move membership writes to the categories service: create adds the tag id, update moves it, delete removes it; category rename moves member ids without touching tags
- [x] 3.3 Preserve (name, category) 409 semantics by checking same-named tags within the resolved category membership
- [x] 3.4 Keep tag search/sort by category working via the membership join; verify sidebar grouping and tag forms are unchanged

## 4. Migration script

- [x] 4.1 Implement `scripts/migrate-tag-category-storage.mjs` (group by owner + normalized legacy category, ensure entities + `general`, `$addToSet` tag ids, `$unset` legacy fields, `--dry-run`, backup confirmation flag, verification pass)
- [x] 4.2 Delete superseded `scripts/backfill-tag-categories.mjs`
- [ ] 4.3 Dry-run the script against a copy of production data and review the reported plan

## 5. Tests

- [x] 5.1 Update repository/service tests: no legacy hydration, membership stored on categories, delete-tag-keeps-category via `tagIds`
- [x] 5.2 Update API tests: payloads still expose derived `tagCategory`, cross-user isolation of membership, rename moves members, delete-only-when-empty via stored `tagIds`
- [x] 5.3 Add migration coverage: seed legacy-shaped documents, run migration phases, assert entities + `tagIds` + `$unset` + idempotent re-run + verification failure cases

## 6. Deploy and quality gates

- [ ] 6.1 Execute the deploy plan: archive `tag-category-entity` first, `mongodump`, stop API, migrate, verify, deploy, smoke-test tag CRUD and category views
- [x] 6.2 Run `npm run check` (lint, test, build) and fix failures
- [x] 6.3 Run `openspec validate tag-category-storage-migration --strict` and fix findings
