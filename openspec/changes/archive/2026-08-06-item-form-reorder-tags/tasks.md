## 1. Reorder the item form fields

- [x] 1.1 In `src/web/components/ItemForm.tsx`, move the tag selector `<fieldset className="item-form-tags">...</fieldset>` so it renders after the Command/URL `FormField` and before the `.form-actions` buttons, keeping all existing fields and checkbox toggle logic intact

## 2. Update tests

- [x] 2.1 In `src/web/components/__tests__/ItemForm.test.tsx`, add a test asserting the Command/URL field renders above the tag selector and the tag selector renders above the action buttons

## 3. Validate

- [x] 3.1 Run `npm run check` and confirm lint, tests, and build pass
