## 1. Update the tag management header markup

- [x] 1.1 In `src/web/pages/CollectionPage.tsx`, replace the plain text "Add tag" button in the tag management header with an icon button reusing the `add-item-button` class and `ThemeIcon name="add"`, keeping `type="button"` and an accessible `aria-label`/`title` for the add-tag action.
- [x] 1.2 Reorder the tag management header DOM so the add-tag button appears first, followed by the "Manage tags" heading, then the tag search field.

## 2. Update the header styling

- [x] 2.1 In `src/web/index.css`, add a rule so the add-tag button inside the tag management header uses the same icon-button sizing/aspect-ratio as the Add item button.
- [x] 2.2 Ensure the header flex layout renders the button leftmost with the heading and search box following in the intended order.

## 3. Update and verify tests

- [x] 3.1 Add/update a test asserting the "Add tag" control renders as an icon button (not plain text) in the tag management header.
- [x] 3.2 Add/update a test asserting the left-aligned order: button, then "Manage tags" heading, then tag search box.
- [x] 3.3 Run `npm run check` and confirm lint, tests, and build pass; the existing `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx` still passes or is updated.
