## Context

See `proposal.md` for motivation. Current state: `tagCategory` is a normalized string on `StoredTag` (`packages/contracts/src/tags.ts:19-32`, `src/api/repositories/tags.repository.ts:11-15`); a category "exists" only while referenced. Dual repositories (`InMemory*` / `Mongo*`) share interfaces, DI via `createApp()`, validation at Zod boundary, `TagsService` owns uniqueness (`ownerId,tagNameNormalized,tagCategoryNormalized`) and palette checks. No `tagCategories` collection exists.

## Goals / Non-Goals

**Goals:**
- Make `TagCategory` an explicit owner-scoped entity with empty-set support and a guaranteed `general` default.
- Keep tag `tagCategory` string as the single source of truth for membership; resolve categories on every tag write.
- Preserve existing validation/normalization and owner-scoping guarantees.

**Non-Goals:**
- No hierarchical/nested categories, no per-category colors or sharing between users.
- No change to item-tag association (still loose `tags:string[]` by normalized name).
- No bulk category import UI beyond what the API enables.

## Decisions

### 1. New `TagCategory` contract + collection, membership derived

Add `packages/contracts/src/tag-categories.ts`: `tagCategoryNameSchema` (reuse `tagNamePattern`, trim, 1..120), `tagCategoryInputSchema{name,description?}`, `tagCategoryUpdateSchema{name?}`, `tagCategorySchema{id,name,tagIds:string[],order,createdAt,updatedAt}`, query/list schemas mirroring `tagQuerySchema` (limit 50, sort `order|updatedAt|name`).

New `tagCategories` Mongo collection + `TagCategoriesRepository` interface (`findOwned`, `findOwnedByNormalizedName`, `list`, `create`, `replace`, `delete`, `nextOrder`, `ensureGeneral`) with `InMemory` and `Mongo` implementations, following `tags.repository.ts` patterns. `StoredTagCategory {ownerId, nameNormalized}` persisted; `tagIds`/member set resolved by querying `tags` by `(ownerId, tagCategoryNormalized)` at read time rather than storing an embedded member array.

Rationale: user asks for "a set of tags inside" the category, but dual-writing an embedded array plus `tag.tagCategory` creates inconsistency risk on rename/delete. Derived membership keeps one writer (the tag) and still satisfies "empty set" (query returns `[]`). Alternative considered (embedded `tagIds` array with transactional sync) rejected for dual-write complexity.

### 2. `general` guaranteed via `ensureGeneral(ownerId)`

`TagCategoriesService.ensureGeneral()` creates `general` (order 1 if first) when missing; called from tag create/update category resolution, category `list`, and user registration/migration. `general` rejects rename/delete with 400 `VALIDATION_ERROR`.

Alternative (seed only at user creation) rejected: legacy users and tests without seeding would lack `general`.

### 3. Tag write flow resolves category first

`TagsService.create/update` changes to: normalize input category (absent/blank -> `general`) -> `tagCategories.resolveOrCreate(ownerId, name)` (find by normalized name or create with `nextOrder`) -> existing `assertUnique` + `assertPaletteColor` -> persist tag with normalized category. Update with category change keeps current behavior of not touching `items.tags` (items reference tag names, not categories).

Rename category: `replace` + bulk-update `tags` with old normalized category to new (`updateMany $set`), mirroring `items.renameTagForOwnerItems`. Delete category: only when member query is empty, else 409/400; `general` never deletable.

### 4. API surface mirrors tags

New router `src/api/routes/tag-categories.route.ts` mounted at `/api/tag-categories`: `GET / (list incl. empty with tagIds/tagCount)`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `PATCH /:id/reorder`. `POST/PATCH /api/tags` keeps its shape but `tagCategory` becomes optional-with-default (`general`) and unknown names succeed by auto-creating the category (behavior change documented in delta spec).

### 5. Frontend: default + empty visibility

Tag form category input defaults to `general`, offers datalist of existing categories, and surfaces "new category will be created" hint. Tag management + sidebar render categories from `/api/tag-categories` (so empties appear) instead of deriving groups from tags alone.

## Risks / Trade-offs

- [Risk] Two concurrent tag creates with the same new category name could double-create -> Mitigation: unique index `(ownerId,nameNormalized)` + catch duplicate-key as 409/retry-resolve.
- [Risk] Category rename touching many tags is a bulk write -> Mitigation: reuse existing bulk patterns (`bulkWrite`/`updateMany`), rename is infrequent; document non-atomicity in InMemory vs Mongo parity tests.
- [Risk] Listing categories with member sets is N+1 queries -> Mitigation: single `find({ownerId})` for tags grouped in memory, or aggregation `$lookup`; paginate categories (max 50) like tags.
- [Risk] No DB indexes exist in code today (`connection.ts` has no `createIndex`) -> Mitigation: add index creation for `tagCategories{ownerId,nameNormalized} unique` alongside existing implied indexes, or document as deploy step.

## Migration Plan

1. Deploy code with dual-read: `hydrateTag` still maps missing category -> `general`.
2. Migration script per owner: collect distinct `tagCategoryNormalized` from `tags` (+ legacy missing -> `general`), insert one `TagCategory` per name with `nextOrder`, ensure `general` first.
3. Rollback: drop `tagCategories` collection; tags keep their string `tagCategory`, so old code keeps working.

## Open Questions

- Should `TagCategory` carry its own `description`/`color`, or stay name-only plus members? Spec assumes name + members (+order); description can be added later without breaking the contract.
