## Why

In the Add/Edit item form, the tag selector renders a duplicate label ("Tags" span above a fieldset whose legend says "Owned tags") and each tag as a plain checkbox+text row. This looks inconsistent with the rest of the app, where tags appear as colored pills (sidebar `tag-filter-pill`). The form should show a single "Tags" label (via the fieldset legend) and present each tag as a colored pill matching the sidebar.

## What Changes

- In `ItemForm`, the tag selector drops the `FormField` wrapper's `Tags` span; the fieldset legend becomes the visible "Tags" label.
- Each available tag renders as a `tag-filter-pill` with its own tag color (text, border, and `color-mix` background), visually identical to the sidebar's `category-tags-list`.
- Checked (selected) pills use the same emphasis as the sidebar filter pills (higher `color-mix` percentage).
- Accessible names and checkbox semantics are preserved.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `collection-management`: The item form's tag selector must present a single "Tags" label and render available tags as color-coded pills consistent with the sidebar.

## Impact

- `src/web/components/ItemForm.tsx`: tag field markup changes (legend label + pill-styled checkboxes).
- `src/web/index.css`: minor styling so the form's pills match the sidebar look (reuse `.tag-filter-pill`, adjust `.item-form fieldset` layout).
- `src/web/components/__tests__/ItemForm.test.tsx`: update/add tests for the new legend and pill rendering.
- No API, contract, or data layer changes.
