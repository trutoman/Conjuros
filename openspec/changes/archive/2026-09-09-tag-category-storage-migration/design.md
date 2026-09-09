## Context

See `proposal.md` for motivation. Current state: `StoredTag` carries `tagCategory` + `tagCategoryNormalized` (`src/api/repositories/tags.repository.ts:11-15`) with `hydrateTag` reconciling legacy variants (`:29-36`); `TagCategoriesService.toPublic` derives membership by querying tags per category (`src/api/services/tag-categories.service.ts:139-152`); `StoredTagCategory` has no member list (`tag-categories.repository.ts:9-18`); `scripts/backfill-tag-categories.mjs` only creates entities without touching tags. The `tag-category-entity` change is implemented but not yet archived, so main specs have no `tag-category` capability.

## Goals / Non-Goals

**Goals:**
- Single source of truth: `TagCategory.tagIds` (stored); tags carry zero category fields.
- Zero user-visible change: public payloads, search, sort, sidebar, and forms behave identically.
- Migration is safe to re-run and verifies its own result.

**Non-Goals:**
- No new category features (hierarchy, sharing, colors).
- No change to item-tag association or auth/ownership model.
- No online zero-downtime migration machinery; a brief maintenance window is acceptable.

## Decisions

### 1. Stored `tagIds` on the category, derived `tagCategory` on the tag payload

Add persisted `tagIds: string[]` to `StoredTagCategory` (Mongo document + InMemory record); expose it through the existing `tagCategoryEntitySchema` (`tagIds`/`tagCount` already in the contract). Membership writes (`$addToSet`/`$pull`, rename moves, delete-tag cleanup) live in the categories repository/service. Tag reads resolve `tagCategory` by reverse lookup (find the owner's category containing the tag id), keeping response shapes identical.

Rationale: with the legacy fields gone, derivation-by-query is impossible, so the set must be stored — this also finally realizes the "category carries its set of tags" model. Keeping the derived payload field avoids a **BREAKING** API change and any frontend work. Alternative considered (remove `tagCategory` from responses) rejected for frontend churn with no user benefit.

### 2. Drop `hydrateTag` reconciliation and legacy query branches

`StoredTag` loses `tagCategory`/`tagCategoryNormalized`; `hydrateTag`, `PersistedTagRecord`, the `$or` legacy branch in `findOwnedByNormalizedPair`, and `renameCategoryForOwnerTags`/`findOwnedByCategoryNormalized` on the tags repository are removed. Uniqueness stays scoped to (name, category) as today: `TagsService` resolves the target category first, then checks for a same-named tag already member of it (via the categories service), preserving exact 409 semantics.

Alternative considered (keep dual-read fallback for un-migrated DBs) rejected: it preserves the dual source of truth this change exists to kill; the migration + verification replaces it.

### 3. New script supersedes the backfill script

`scripts/migrate-tag-category-storage.mjs` follows the existing script pattern (native driver, `MONGODB_URI`/`MONGODB_DATABASE` from env): phase 1 group tags by `(ownerId, normalized legacy category)` and ensure entities; phase 2 `$addToSet` tag ids; phase 3 `$unset` legacy fields; phase 4 verification queries that fail the run on any violation. Flags: `--dry-run` (no writes), `--yes-I-have-a-backup` (required for writes). Delete `scripts/backfill-tag-categories.mjs` to avoid two competing tools.

### 4. Deploy order: backup → stop API → migrate → verify → deploy code

The new code cannot read un-migrated tags (no legacy branch) and the old code cannot maintain `tagIds`, so code and data must cut over together. Sequence: `mongodump`, stop API container, run migration (verify passes), deploy, smoke-test tag CRUD + category views. Rollback is restore-from-backup + redeploy previous image.

Alternative considered (dual-read code first, migrate later, cleanup after) rejected as over-engineering for a single-DB project with an acceptable maintenance window.

## Risks / Trade-offs

- [Risk] `$unset` is destructive; a bug loses the only category mapping → Mitigation: mandatory backup flag, `--dry-run` first, verification phase fails loudly, and phase 2 completes fully before phase 3 starts.
- [Risk] Concurrent writes during migration (API left running) corrupt `tagIds` → Mitigation: stop the API container for the migration window; script refuses to run if it detects tag `updatedAt` newer than its start time (optional guard, implement if cheap).
- [Risk] Tag name collisions across categories after uniqueness becomes per-owner (e.g. `todo|work` + `todo|personal`) → Mitigation: none needed — uniqueness stays scoped to (name, category) exactly as today (see Decision 2), so no new collision class appears; verification still reports any tag id in zero or multiple categories.
- [Risk] Reverse lookup (tag → category) is now a query per tag read; tag list + category list could fan out → Mitigation: batch by fetching all owner categories once per request and joining in memory (same pattern the current `toPublic` already uses per category, inverted).

## Migration Plan

1. Archive `tag-category-entity` first so `tag-category` exists in main specs.
2. `mongodump --uri $MONGODB_URI --db $MONGODB_DATABASE`; deploy nothing yet.
3. `docker compose stop api`; run `node scripts/migrate-tag-category-storage.mjs --dry-run`, review; run for real with backup flag.
4. Deploy new code; smoke test: create tag without category (→ `general`), rename category, delete tag, list categories with counts.
5. Rollback: `mongorestore` + redeploy previous API image.
