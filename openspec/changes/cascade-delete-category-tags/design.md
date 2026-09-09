## Context

See `proposal.md` Why. Current state:

- `TagCategoriesService.delete` (`src/api/services/tag-categories.service.ts:119`) rejects non-empty categories with `400 "Tag category is not empty"`; the `general` category is protected.
- `TagsService.delete` (`src/api/services/tags.service.ts:136`) already implements full single-tag delete semantics: removes the tag from its category set and strips it from all owner items before deleting the tag document.
- Wiring (`src/api/app.ts:46-49`): `TagCategoriesService` is constructed with only the categories repository, then `TagsService` receives both the tags repository and the categories service. So the categories service has no access to tag deletion, while the tags service can reach everything the cascade needs.
- Frontend (`CollectionPage.tsx`, `TagsPage.tsx`): category deletes go through `categoriesState.remove` inside a `DeleteConfirmDialog` with dialog-scoped errors; `useTagCategories` invalidation already refreshes both tags and categories lists together.

Constraints: no contract shape change (`204` on success stays); `general` stays protected; sequential tag deletion per the requested default behavior.

## Goals / Non-Goals

**Goals:**

- Deleting a non-empty category deletes its member tags first, then the category, reusing exact single-tag delete semantics (including item cleanup).
- Keep the empty-only guard as a safety invariant below the cascade entry point.
- Surface the cascade consequence in the Manage tags confirmation and refresh both lists on success.

**Non-Goals:**

- Bulk/parallel deletion APIs or a `?cascade=` query flag; cascade is the only (default) behavior.
- Transactions across the cascade; partial-failure handling stays retry-based (see Risks).
- Changing tag-delete semantics themselves or the `general` protection rules.

## Decisions

### 1. Orchestrate the cascade in `TagsService`, not in `TagCategoriesService`

- Add a method such as `TagsService.deleteCategoryWithTags(ownerId, categoryId)`: require the owned category, reject `general` with the existing `400`, sequentially `await this.delete(ownerId, tagId)` for each member tag id, then call the existing `TagCategoriesService.delete` (whose empty-set guard now passes naturally and remains as defense in depth).
- Rewire the `DELETE /api/tag-categories/:id` controller path to this method; `TagCategoriesService.delete` keeps its guard and its direct unit-test behavior.
- Rationale: reuses full tag-delete semantics (category membership removal + `removeTagFromOwnerItems`) with zero logic duplication.
- Alternatives considered: injecting `TagsService` into `TagCategoriesService` — rejected (constructor cycle: tags service already depends on the categories service); replicating tag deletion inside the categories service — rejected (duplicates item-cleanup logic and will drift).

### 2. Sequential awaits, category deleted last

- Loop with sequential `await`, never `Promise.all`: matches the requested "first all tags, then the category" order and avoids concurrent writes against the same category entity and item documents.
- Order of operations: ownership/`general` checks first (fail fast before deleting anything), then tags, then the category.

### 3. Frontend communicates the cascade in the existing confirmation

- Extend the category `DeleteConfirmDialog` invocation (not the shared component API unless needed) so the copy states the member-tag count will also be deleted (e.g. title/body mentioning N tags); the category's `tagCount`/`tagIds` are already available in the Manage tags view.
- On success close the dialog, clear the scoped error, and rely on existing React Query invalidation for both lists. No new error paths: genuine failures keep the current dialog-scoped behavior.

## Risks / Trade-offs

- [Risk] Mid-cascade failure leaves a partially deleted category (some tags gone, category remains) → Mitigation: tags-first/category-last ordering makes retry safe and idempotent; document that no rollback of already-deleted tags occurs.
- [Risk] Existing API test asserting `400` on non-empty delete fails → Mitigation: update `src/tests/api/tag-categories.test.ts` to assert `204` plus tag removal and item cleanup; keep the `general`-protection assertion.
- [Risk] Large categories make deletion linear-time → Mitigation: accepted; personal collections are small and each step is a single-document operation.
- [Risk] Frontend tests asserting the old rejection message (`keeps the view open when deleting ... fails`) break → Mitigation: rework them into cascade-success assertions (dialog closes, groups/tags gone) and keep a scoped-error test for the `general` case.

## Migration Plan

No migration. Backend + web ship together; rollback by reverting. Verify with `npm run check` (lint → test → build).

## Open Questions

None.
