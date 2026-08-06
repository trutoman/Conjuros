## Context

The tag management view (`CollectionPage.tsx` "Manage tags" mode and `TagsPage.tsx`) renders `TagList` with per-row text buttons: Edit, Delete, Move up, Move down. The collection list (`CollectionList.tsx` + `ItemCard.tsx`) already provides two reusable interaction patterns this change adopts: the three-dot dropdown menu (with Edit/Delete and a delete-confirm sub-view) and drag-and-drop / keyboard reordering. The `tag-filter-pill` CSS class already exists and is used by the sidebar filters and item form. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Visually align tag rows with the app's pill language (`tag-filter-pill`) and the item form / collection list style.
- Replace inline action buttons with the existing dropdown-menu interaction.
- Replace Move up/Move down with drag-and-drop ordering, reusing the collection list's drag and keyboard logic.
- Keep tag management flows (Add tag, edit, delete confirm) unchanged.

**Non-Goals:**
- No changes to tag APIs, contracts, or data model.
- No new drag-and-drop library; reuse the existing HTML5 drag pattern already in `CollectionList`.
- No changes to the sidebar tag filters or item form tag pills.

## Decisions

- **Keep `TagList` prop contract stable where possible.** It currently receives `tags`, `onEdit`, `onDelete`, `onMove`. `onMove` remains the persistence path (`tagsState.reorder`); only the UI that triggers it changes. This keeps both `CollectionPage` and `TagsPage` wiring untouched unless a new prop (e.g., open menu state) is needed.
- **Reuse the item menu markup/CSS classes** (`item-menu-wrapper`, `item-menu-dropdown`, `icon-action`, three-dot icon) rather than inventing new menu styles. Only one menu open at a time, tracked in `TagList` local state, mirroring `CollectionList`'s `openMenuId`.
- **Delete stays in the confirmation dialog.** The item card has an inline confirm sub-view inside the menu; for tags the existing `DeleteConfirmDialog` already handles confirmation at the page level, so the menu Delete action simply invokes `onDelete(tag)`. Simpler and consistent with the current tag flow.
- **Reuse `CollectionList`'s reorder logic.** Copy the proven pattern: draggable row, drag-start sets dragged + drop-target, drag-over updates target, drop computes the target's order and calls `onMove(sourceId, targetOrder)`, plus Alt+ArrowUp/ArrowDown keyboard reorder with focus retention. A shared helper is not warranted for two lists; duplicating the small logic keeps changes local and low-risk.
- **Pills from `tag-filter-pill`.** Render the tag name as a pill with inline `color`, `borderColor`, and `color-mix` background, matching the sidebar/item-form presentation; keep the color swatch/category meta as compact muted text inside the row so no information is lost.

## Risks / Trade-offs

- Duplicating drag logic across `CollectionList` and `TagList` → Mitigated by keeping the logic small and matching; a future extraction is easy if a third list appears.
- Moving menu state into `TagList` couples it to page-level flows → The menu only calls `onEdit`/`onDelete`, which are already page-level callbacks, so no new coupling is introduced.
- Removing Move up/down buttons is a discoverability regression for keyboard users → Covered by preserving the Alt+Arrow keyboard reorder that collection items already use.
