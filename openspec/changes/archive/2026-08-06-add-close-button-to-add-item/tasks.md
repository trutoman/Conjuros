## 1. Add the close button to the item form

- [x] 1.1 Add a borderless floating close button to the item form in `src/web/components/ItemForm.tsx`, positioned in the top-right corner and wired to the existing `onCancel` handler
- [x] 1.2 Give the close button an accessible label (e.g., "Close item form") and render an "X" glyph with no visible frame, reusing the shared `.form-close` class

## 2. Style the close button

- [x] 2.1 Verify `.form-close` in `src/web/index.css` positions the item-form close button in the top-right corner without overlapping the form heading; adjust if needed

## 3. Tests

- [x] 3.1 Add an `ItemForm` component test asserting the close button is present, has an accessible name, and activating it invokes `onCancel`
- [x] 3.2 Update `CollectionPage.test.tsx` (or add a new integration test) asserting the item-form close button dismisses the Add item form and returns to the collection view, matching the existing `Cancel` button behavior

## 4. Validation

- [x] 4.1 Run `npm run check` and confirm lint, tests, and build pass
