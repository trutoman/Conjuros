## Context

See `proposal.md` Why. Current state (`src/web/pages/CollectionPage.tsx:96,232-240,374,471` and `src/web/pages/TagsPage.tsx:32,44-72,117`):

- A single `actionError: string` holds failures for collection items, tags, categories, and themes.
- `confirmCategoryDelete` / `confirmTagDelete` catch the backend `Error("Tag category is not empty")` (from `TagCategoriesService.delete`, `src/api/services/tag-categories.service.ts:125`) and write it into that shared `actionError` without closing `deleteCategory` / `deleteTag`.
- The shared error is rendered twice via `ErrorState` (`src/web/components/ErrorState.tsx`, `.state` dashed frame): above the main `CollectionList` and above the `TagList` inside the Manage tags `Modal`. One failure therefore looks like a ghost first row in both lists and persists until any other `actionError` write overwrites it.

Constraints: no API change; `DELETE /api/tag-categories/:id` keeps `400` for non-empty and protected `general`; React Query invalidation via `useTagCategories` / `useTags` stays as-is; follow existing `actionError` / `ErrorState` pattern, no new libraries.

## Goals / Non-Goals

**Goals:**

- Isolate Manage tags tag/category delete failures from the main collection error path.
- Keep the delete confirmation open on failure with a scoped, dismissible error; clear it on cancel, view close, or next success.
- Preserve successful-delete refresh of both tags and categories lists.

**Non-Goals:**

- Changing delete lifecycle rules, validation messages, or status codes.
- Redesigning global error/toast infrastructure or restyling `ErrorState`.
- Touching item, theme, or tag reorder error paths except to avoid regressions.

## Decisions

### 1. Split error state by surface in `CollectionPage.tsx` (and mirror in `TagsPage.tsx`)

- Introduce e.g. `collectionActionError` for item flows and `manageTagsActionError` (or `deleteDialogError`) for tag/category deletes initiated from Manage tags; `confirmTagDelete` / `confirmCategoryDelete` write only to the scoped state.
- Main-frame `ErrorState` binds to `collectionActionError` only; Manage tags modal binds to the scoped state (ideally inside/adjacent to the `DeleteConfirmDialog`, falling back to the modal header if dialog-local is impractical).
- Alternative considered: single `actionError` with a `source` tag — rejected because every render site must then branch, and a missed site reintroduces the ghost.
- Clear scoped error in `closeManageTags`, on dialog cancel (`setDeleteCategory(null)` / `setDeleteTag(null)`), and on delete success.

### 2. Keep the confirmation dialog open on failure

- Retain current `TagsPage.test.tsx` expectation (`keeps the view open when deleting a non-empty category fails`): do not null `deleteCategory` on catch; surface the scoped error alongside the open dialog so the user can retry a different category or cancel.
- Alternative considered: auto-close dialog and show modal-level banner — rejected because it hides which object failed and diverges from the tested behavior.

### 3. No backend or contract change

- Backend rejection stays the source of truth; frontend only fixes where the message is stored and rendered. No `packages/contracts` or `openspec/specs` lifecycle change.
- Rationale: smallest blast radius; specs delta only adds error-scoping requirements.

## Risks / Trade-offs

- [Risk] Two error states drift (one cleared, one not) → Mitigation: single `clearManageTagsErrors()` helper called from all close/success paths; cover with tests.
- [Risk] Dialog-local error placement may not fit `DeleteConfirmDialog` API → Mitigation: fall back to modal-header `ErrorState` bound to the scoped variable only (never the main list); still satisfies specs.
- [Risk] `TagsPage.tsx` standalone route duplicates the bug → Mitigation: apply the same split there or extract the pattern; add a regression test for each page.

## Migration Plan

No migration. Frontend-only change; deploy with the web bundle. Rollback by reverting the two pages. Verify with `npm run check` (lint → test → build).

## Open Questions

None. Placement detail (dialog-local vs modal-header scoped banner) is left to the implementer within the spec constraint that the main list never renders Manage tags delete errors.
