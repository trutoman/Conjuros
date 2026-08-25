## Why

The tag management header's "Add tag" button is a plain text button aligned to the far right, which is visually and interactionally inconsistent with the "Add item" button that uses a `+` icon and sits at the left of the collection subheader. This inconsistency makes the primary create action harder to recognize and disrupts the header reading order.

## What Changes

- Render the "Add tag" button in the tag management header using the same iconographic style as the "Add item" button: a `+` icon instead of plain text.
- Move the "Add tag" button to the left of the tag management header, so the reading order becomes: Add tag button, then "Manage tags" heading, then the tag search box.
- Preserve the existing small text control approach used by the theme management header, whose "Add theme" button is unchanged.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `tag-management`: Change the add-tag entry point in the tag management header so it renders as an icon button with a `+` and is positioned to the left of the "Manage tags" heading and the tag search box.

## Impact

- Frontend: `src/web/pages/CollectionPage.tsx` (tag management header markup), `src/web/index.css` (tag management header layout / button styling).
- Iconography: reuses the existing `ThemeIcon name="add"` component already used by the Add item button.
- Tests: `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx` may need role/label assertions updated for the icon button.
