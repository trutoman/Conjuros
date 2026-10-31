## 1. Shared modal and color field

- [x] 1.1 Add an `extra-wide` value to the `Modal` size union and map it to a `modal-panel-extra-wide` class
- [x] 1.2 Add `.modal-panel-extra-wide` (`width: min(72rem, 100%)`) and the `.color-input`, swatch, and picker styles to `index.css`
- [x] 1.3 Create `src/web/components/ColorInput.tsx` with a static swatch mode and a native color-picker mode, keeping the swatch and value in one bordered container

## 2. Single Add theme control

- [x] 2.1 Remove the `onAdd` prop and the trailing "Add theme" button from `ThemeListView`
- [x] 2.2 In the theme management header in `CollectionPage`, render exactly one `Add theme` button before the heading using `add-item-button` and `ThemeIcon name="add"`, with the accessible name "Add theme"
- [x] 2.3 Stop passing `onAdd` from `CollectionPage` and open the base-theme step from the header button instead

## 3. Base theme step and seeding

- [x] 3.1 Create `src/web/components/ThemeBasePicker.tsx`: a radio list of existing themes (preselecting the site default) with confirm and cancel actions
- [x] 3.2 Add a pure `deriveThemeCopyIdentity(base, existingNames)` helper returning a unique valid name and an editable copy label
- [x] 3.3 Extend `ThemeForm` with `baseTheme` and `existingNames` props: seed colors, kind colors, fonts, font sizes, backdrop, icon assets, and palette from the base theme, derive name and label, disable image backdrop mode, and leave "Make site default" unchecked
- [x] 3.4 Force a fresh `ThemeForm` instance per edit target or base theme (via a `key`) so seeded state never leaks between openings
- [x] 3.5 Wire the base-theme state in `CollectionPage`: open the picker on Add theme, open the form on confirm, open nothing on cancel, and reset both when the editor closes
- [x] 3.6 Open the theme form modal with `size="extra-wide"`

## 4. Color swatches in the form

- [x] 4.1 Replace the theme color text inputs with `ColorInput`, leaving the composite `shadow` field as a plain input
- [x] 4.2 Replace the item kind color and backdrop glow color inputs with `ColorInput`
- [x] 4.3 Render each tag palette row through `ColorInput` in picker mode, removing the separate native color input while keeping the row alignment and remove action

## 5. Tests

- [x] 5.1 Update `CollectionPage.themes.test.tsx`: exactly one Add theme control, rendered as an icon button, opening the base-theme picker
- [x] 5.2 Cover the base step in `CollectionPage.themes.test.tsx`: confirming a base opens a prefilled form, cancelling opens nothing, and the form panel uses the extra-wide class
- [x] 5.3 Add `ThemeForm.test.tsx` covering base seeding, copy identity uniqueness, image backdrop off, and the unchecked default flag
- [x] 5.4 Add color field tests covering the swatch value, live updates, the shadow exception, and the palette picker mode
- [x] 5.5 Run `npm run check` and resolve all failures

## 6. Verification

- [x] 6.1 Run `openspec validate refine-theme-editor` and confirm the delta is valid
