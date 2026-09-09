## Why

The Manage tags modal lists tags as a flat list while the sidebar already groups tags by category. Users cannot scan or manage tags per category, and categories have no visible actions in the management view.

## What Changes

- Reorganize the Manage tags list into category groups mirroring the sidebar: each group shows the category name left-aligned with its member tags stacked vertically beneath it, right-aligned.
- Render empty categories as a named group with zero tags (matching existing empty-category visibility rules).
- Add a three-dot actions menu to each category group header, mirroring the per-tag menu pattern (Edit/Delete subject to existing `tag-category` lifecycle rules, e.g. `general` can never be deleted/renamed).
- Keep all existing tag row behavior unchanged: pill rendering, inline description truncation, tag three-dot Edit/Delete menu, drag-and-drop plus keyboard reorder, and header search filtering by name and category.
- Keep search behavior consistent: filtering by tag name/category narrows visible groups; groups with no matching tags or category name are hidden unless they match the query.

## Capabilities

### Modified Capabilities

- `tag-management`: Manage tags view groups tags by category (left-aligned group name, right-aligned vertical tag stack) instead of a flat list.
- `tag-category`: category lifecycle actions (rename/delete) are surfaced through a per-group three-dot menu in the Manage tags view.

## Impact

- Frontend only: `TagList` (or its Manage tags container), related CSS, and frontend tests.
- No API or contract changes: grouping reuses existing `tags` + `categories` payloads; category actions reuse existing category lifecycle endpoints.
- Accessibility: new category menus must follow the existing three-dot menu keyboard/ARIA pattern.
