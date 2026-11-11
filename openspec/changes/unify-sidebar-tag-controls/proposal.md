## Why

The tag sidebar spreads its controls across the header and footer and uses inconsistent labels and button shapes. A compact, consistent toolbar makes the actions easier to scan while retaining accessible names.

## What Changes

- Add a theme-editable `settings` icon using the supplied SVG artwork, with compatibility for existing themes.
- Move the manage-tags action from the sidebar footer into the header, immediately after the match-mode controls, as an icon-only button.
- Remove the visible Tags, Clear, and Match labels and place the controls in one flex container.
- Give the non-match buttons identical square icon-only styling; preserve the existing match toggle's appearance and behavior.
- Preserve filtering, sidebar expand/collapse, tag management, keyboard access, and responsive behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-layout-and-navigation`: Consolidate the tag sidebar actions into an accessible icon-only toolbar.
- `theme-icon-storage`: Add the `settings` icon to theme assets, editing, and existing-theme normalization.

## Impact

- Sidebar and match-toggle components, shared styles, theme contracts, bundled artwork, theme normalization/backfill, and relevant tests.
- No new dependency or endpoint is required; the shared theme icon key set and returned theme assets gain `settings`.
