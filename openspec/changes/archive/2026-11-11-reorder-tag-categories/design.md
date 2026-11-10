## Context

`tag_categories` already has a `position` column (`order` in the API), `PATCH /tag-categories/:id/reorder`, a repository `reorder` that renumbers owned rows, and a `useTagCategories().reorder` hook. `TagList` groups tags by category but sorts groups by name, and only tag rows are draggable.

## Goals / Non-Goals

**Goals:** order groups by `order`; drag category titles to reorder; adjust font sizes.
**Non-Goals:** new endpoints, schema changes, moving tags between categories.

## Decisions

- **Order direction:** lowest `order` first, identical to items; no contract change.
- **Backend:** reuse the existing reorder endpoint; add tests confirming ascending list, renumbering and ownership checks. Fix only if tests reveal gaps.
- **Frontend:** in `TagList`, sort groups by `category.order` (uncategorized derived groups last, by name). Make the category title the drag handle (separate `draggedCategoryId` state from tag drag so the two do not interfere); on drop call `onMoveCategory(id, targetCategory.order)`, mirroring `reorderByIndex` for tags. Add the same keyboard shortcut as tag rows. Only unfiltered views allow category reordering to avoid ambiguous positions while searching.
- **Wiring:** `TagsPage` passes `reorder` from `useTagCategories`; on error show the existing scoped error state and refetch to restore order.
- **CSS:** `.tag-category` title to `1rem`; tag pill label to `0.7rem` in `index.css`; add dragging/drop-target styles for category blocks.

## Risks / Trade-offs

- Nested draggables (tag rows inside a category block) → only the title is draggable for categories, and handlers check which kind is being dragged.
- Optimistic UI vs refetch → rely on query invalidation for simplicity.
