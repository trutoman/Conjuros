## Why

Authoring a theme is slow and error-prone: the editor offers two "Add theme" controls, a new theme always starts completely blank so an administrator must retype every color, font, size, and icon path, the form modal is the narrowest one in the app despite holding dozens of fields, and color values are shown as bare text with no visual confirmation. Theme work is an admin-only, infrequent task, so the flow should ask for the new theme's starting point once and then show the copied tokens plainly.

## What Changes

- Keep a single "Add theme" control, in the theme management modal header, rendered as an icon button with the shared `add` icon (the same control used for "Add item" and "Add tag"). Remove the second text button at the bottom of the theme list.
- Activating "Add theme" opens a base-theme step that asks the administrator to choose one existing theme. The new theme is then created from that choice: colors, item kind colors, fonts, font sizes, page backdrop, icon assets, tag color palette, and the image-backdrop mode preference start with the chosen theme's values.
- Prefill the new theme's internal name and label with an editable copy-derived identity (for example `light-copy` / `Light copy`) so the name field is valid and unique by default; the server keeps enforcing name uniqueness.
- Do not copy the stored background image: images belong to a theme and are uploaded per theme, so a new theme starts in pattern mode and can receive its own image after it is saved.
- Make the theme form modal wider than the current `wide` size by introducing an extra-wide modal variant and using it for the theme form.
- Show a square color swatch immediately left of the color value inside the same bordered container for every color token in the form (theme colors, item kind colors, backdrop glow color, and palette entries). The composite `shadow` value keeps no swatch because it is not a single color.
- No API, database, contract, permission, or theme selector changes.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `theme-editor`: the "Add theme" control becomes a single icon button, adding a theme starts from a chosen base theme, the form modal is wider, and color fields show a swatch beside the value.

## Impact

- `src/web/pages/CollectionPage.tsx`: single add control, base-theme step, extra-wide theme form modal.
- `src/web/components/ThemeListView.tsx`: remove the duplicate Add theme button and its `onAdd` prop.
- `src/web/components/ThemeForm.tsx`: accept a base theme, derive a unique copy identity, and render color swatches.
- `src/web/components/Modal.tsx`, `src/web/index.css`: extra-wide modal size, color input container and swatch styles.
- New `src/web/components/ColorInput.tsx` (shared color field) and `src/web/components/ThemeBasePicker.tsx` (base-theme step).
- `src/web/pages/__tests__/CollectionPage.themes.test.tsx`, plus new component tests for the color input and base-theme prefill.
- No server, contract, migration, or storage changes.
