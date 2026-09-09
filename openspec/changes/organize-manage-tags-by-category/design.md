## Context

- The Manage tags surface (live: `CollectionPage` modal; legacy unrouted: `TagsPage`) renders a flat `TagList` of `visibleTags` plus a separate "Empty categories" section. See proposal.md Why.
- The sidebar (`Sidebar.tsx`) already groups tags by category (`category-group` + `h3` + `category-tags-list`) from `tags` + `categories` props; `TagList.tsx` owns the tag row, pill, three-dot menu, and drag/keyboard reorder.
- Category lifecycle APIs already exist and `useTagCategories` exposes `create`/`update`/`remove`/`reorder`, but no UI wires `update`/`remove` (a test asserts no standalone category management actions). Category validation/normalization rules are owned by the `tag-category` capability and are unchanged.
- Specs: `specs/tag-management/spec.md` (grouped layout) and `specs/tag-category/spec.md` (per-group menu).

## Goals / Non-Goals

**Goals:**
- One grouped Manage tags list mirroring the sidebar, with per-group three-dot Rename/Delete menus reusing existing API/hook flows.
- Both Manage tags surfaces (`CollectionPage` modal and legacy `TagsPage`) render the grouped list; the separate empty-categories sections fold into it.

**Non-Goals:**
- No API, contract, or persistence changes; no changes to validation/normalization.
- No category drag-reorder UI in this change (the `reorder` mutation stays unused by the view).
- No new standalone "Add category" entry point; categories are still created on demand via the tag form.
- No visual restyle beyond the group layout (no new libraries or animations).

## Decisions

- **Group inside `TagList`, driven by a new `categories` prop.** Both pages already render `TagList`, so grouping plus the category menu ship to both surfaces at once. Alternative (grouping in each page) duplicates the sidebar-grouping logic twice; rejected.
- **Derive groups with the same algorithm as the sidebar** (normalize to lowercase, seed from the `categories` list so empties appear, sort categories alphabetically, keep each tag's relative persisted order within its group) and flatten groups back into the ordered array `TagList` already reorders. Alternative (sort tags alphabetically like the sidebar) would fight the persisted custom tag order; rejected.
- **Keep existing reorder semantics on cross-group drops**: dropping a tag onto a tag in another group moves it to that flat position without changing its category (category changes stay in the tag/tag-category edit flows). Alternative (drop changes category) is surprising and conflicts with the single-category-per-form rule; rejected.
- **Reuse the tag three-dot menu markup/pattern for the category menu**, with `Rename`/`Delete` items; `general` renders no menu (or a menu with disabled items — implementer picks the variant matching the existing pattern). Rename uses a small modal form reusing `Modal` + `FormField` wired to `categoriesState.update`; Delete reuses the `DeleteConfirmDialog` pattern wired to `categoriesState.remove`, with backend validation errors surfaced through the existing `actionError`/`ErrorState` path.
- **Fold the per-page "Empty categories" sections into the grouped list** and delete them, since empty categories now render as groups.

## Risks / Trade-offs

- [Risk] Flattened grouped order changes the indices keyboard/drag reorder operates on → Mitigation: keep `onMove(id, order)` against the flattened visible order unchanged; cover cross-group drop with a test locking in no-category-change behavior.
- [Risk] Two Manage tags surfaces (`CollectionPage`, legacy `TagsPage`) drift → Mitigation: grouping lives in `TagList`; update both pages' tests, including the test asserting no standalone category actions (group menus are the new sanctioned surface).
- [Risk] Category rename/delete error text (non-empty, `general`) comes from the backend → Mitigation: display the backend message via the existing error path; no new error taxonomy.

## Migration Plan

- Frontend-only change; no data migration, no rollback beyond revert. Deploy with the normal web build.
