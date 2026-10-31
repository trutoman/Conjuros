## Context

See `proposal.md` for motivation and `specs/theme-editor/spec.md` for required behavior. The theme editor today is a `Modal` opened from the user menu that contains `ThemeListView` and, on top of it, a `ThemeForm` modal. `ThemeForm` initializes every token from an optional `theme` prop and otherwise leaves fields empty. `Modal` supports `default`, `wide`, and `full` sizes; the theme form currently uses `default` (34rem). Color values are plain text inputs, and the palette rows already use a native `type="color"` input beside the hex text. The Add theme control is duplicated: a text button in the management header and another inside `ThemeListView`.

## Goals / Non-Goals

**Goals:**
- One Add theme entry point, in the management header, reusing the existing icon button styling.
- A base-theme step that seeds every editable token without retyping.
- A form modal wide enough for the token grids.
- A shared color field that pairs a swatch with the value it describes.

**Non-Goals:**
- Server-side "clone theme" endpoint, theme versioning, or bulk token import.
- Copying a stored background image between themes.
- Changing theme validation rules, permissions, the theme selector, or the theme list row content.
- Making the management modal itself extra-wide.

## Decisions

**Base-theme step as its own modal, not a select inside the form.**
A `ThemeBasePicker` modal opens from the Add theme button, listing existing themes as an accessible radio group (reusing `.theme-selector-list` / `.theme-selector-option`) with the site default preselected. Confirming sets a `formBaseTheme` state and opens `ThemeForm`; cancelling closes the picker and opens nothing. Alternative: a "Based on" select inside the form. Rejected because changing it after edits would either silently discard work or need merge rules; the step keeps the copy operation one-shot and explicit.

**Seed inside `ThemeForm`, not by mutating the themes list.**
`ThemeForm` receives `baseTheme?: Theme` plus `existingNames: string[]`. Its state initializers fall back from `theme` to `baseTheme` to blanks, so editing keeps prioritizing the edited theme. A `key` derived from the edited theme id or the base theme id forces a fresh instance when the source changes, preventing stale state from a previously open form. Alternative: build a draft object in `CollectionPage`. Rejected because the form owns field initialization today and it keeps one source of truth.

**Copy identity derived by a small pure helper.**
`deriveThemeCopyIdentity(base, existingNames)` returns an editable name `<base.name>-copy`, truncated to 54 characters before the suffix and suffixed `-2`, `-3`, … until it is not in the existing names (case-insensitive), never exceeding 60 characters. Label becomes `<base.label> copy` truncated to 120. This keeps the form valid on open and avoids the server's `409 CONFLICT` for duplicate names, while the user can still choose any unique name. Alternative: leave name blank. Rejected because the name is required and the user would hit a validation error on the first save.

**Image backdrop mode is copied as off.**
`useImageBackdrop` is reset to `false` and `storedImage` to `null` for new themes. The stored image belongs to the source theme's storage path, and only the per-theme upload endpoint may write a path. Copying the flag would fail validation (`imageBackdropRequiresImageMessage`). The form already tells the administrator to save first and then upload an image.

**Extra-wide modal variant.**
Add `'extra-wide'` to `Modal`'s size union, mapping to `.modal-panel-extra-wide { width: min(72rem, 100%); }`, and use `size="extra-wide"` for the theme form only. Alternative: widen the existing `wide` size. Rejected because `wide` is shared by item forms, viewers, and the tag manager; changing it would resize unrelated dialogs.

**Shared `ColorInput` component.**
`ColorInput` renders a bordered `.color-input` container holding a square swatch (`span[aria-hidden]` with `style.background = value`) and the text input. Palette rows use the same container in `picker` mode, where a native `type="color"` input replaces the static swatch, preserving color picking while satisfying the same layout. Static swatches rely on the browser ignoring invalid `background` values, so `rgba()`, `color-mix()`, and `var()` tokens render or stay transparent without extra parsing. The `shadow` token is a composite box-shadow, so it keeps a plain input.

**Single add control in the management header.**
`CollectionPage` renders one `<button className="add-item-button" aria-label="Add theme" title="Add theme">` with `ThemeIcon name="add"`, placed before the heading, mirroring the Manage tags header. The existing `.tag-management-header .add-item-button` rule already sizes it. `ThemeListView` loses its `onAdd` prop and trailing button.

## Risks / Trade-offs

- **Nested modals gain one more level (manage → base picker → form).** → Reuse `Modal`'s existing stack for Escape and backdrop dismissal; the picker closes before the form opens so at most two levels are open at once.
- **Copy-derived names can still collide under concurrency or case differences.** → Helper checks case-insensitively against the loaded list; the server remains the authority and returns `409`, which the existing error banner already shows.
- **72rem may overflow narrow viewports.** → `min(72rem, 100%)` with the existing panel `max-height`/scroll behavior keeps it usable on mobile.
- **Swatches on values like `color-mix()` or `var()` may render transparent.** → Acceptable: the swatch is informative, never authoritative, and the text value stays visible.
- **Theme duplication may produce near-identical themes.** → The prefilled `-copy` name and copy label make duplicates obvious, and the administrator must still save explicitly.

## Migration Plan

No data or API migration. Deploy the frontend build only; the server, contracts, schema, and storage are untouched. Rollback is a frontend revert.

## Open Questions

None.
