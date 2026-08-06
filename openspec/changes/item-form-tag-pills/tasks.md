## 1. Update the tags field markup in ItemForm

- [x] 1.1 In `src/web/components/ItemForm.tsx`, replace the `FormField label="Tags"` wrapper with a `<fieldset className="item-form-tags"><legend>Tags</legend>...` so there is a single visible "Tags" label and no separate span row
- [x] 1.2 In `src/web/components/ItemForm.tsx`, render each available tag as a `tag-filter-pill` label with inline `color`/`borderColor`/`background` (`color-mix` 20% when checked, 8% otherwise) matching the sidebar, keeping the checkbox toggle logic and `aria-label={tag.tagName}`

## 2. Style the tags fieldset

- [x] 2.1 In `src/web/index.css`, add an `.item-form .item-form-tags` rule (wrap layout + legend styled like a form label) and ensure pill typography is not overridden by the generic `.item-form fieldset label` font-size rule

## 3. Tests

- [x] 3.1 In `src/web/components/__tests__/ItemForm.test.tsx`, add tests asserting the fieldset legend is "Tags" with no separate "Tags" span label, and that tag checkboxes render as pills with their tag color

## 4. Validation

- [x] 4.1 Run `npm run check` and confirm lint, tests, and build pass
