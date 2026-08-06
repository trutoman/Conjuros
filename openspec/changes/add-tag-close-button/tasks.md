## 1. Add the close button to the tag form

- [x] 1.1 Add a borderless floating close button to the Add tag form in `src/web/components/TagForm.tsx`, positioned in the top-right corner and wired to the existing `onCancel` handler
- [x] 1.2 Give the close button an accessible label (e.g., "Close tag form") and render an "X" glyph with no visible frame

## 2. Replace the tag management view back control

- [x] 2.1 Replace the `← Collection` button in the `tag-management-view` in `src/web/pages/CollectionPage.tsx` with a borderless floating close button wired to `closeManageTags`
- [x] 2.2 Position the manage-view close button in the top-left corner with an accessible label (e.g., "Close tag management") and an "X" glyph with no visible frame

## 3. Style the close button

- [x] 3.1 Add CSS in `src/web/index.css` for a shared `.form-close` rule (borderless, floating, circular hover) positioned in the top-right corner of the `.item-form` container, with a top-left variant for the tag management view
- [x] 3.2 Add CSS so the `Manage tags` heading does not overlap the top-left close button

## 4. Tests

- [x] 4.1 Add a `TagForm` component test asserting the close button is present, has an accessible name, and activating it invokes `onCancel`
- [x] 4.2 Update `CollectionPage.manageTags.test.tsx` queries from "← Collection" to the new accessible name, and add an integration test asserting the manage-view close button dismisses the view and shows the collection view
- [x] 4.3 Add an integration test asserting the tag-form close button dismisses the Add tag form and returns to the tag management list

## 5. Validation

- [x] 5.1 Run `npm run check` and confirm lint, tests, and build pass
