## Why

The sidebar `clear` button shipped with the wrong aesthetics: lowercase "clear" text beside a redrawn outline icon, while the requested design is a capitalized "Clear" label stacked above the exact supplied artwork and styled like the neighboring `Tags` toggle button.

## What Changes

- The clear button label becomes "Clear" with a capital C, rendered above the icon (stacked vertically: text on top, icon below).
- The `clear` icon artwork becomes the exact supplied SVG (verbatim `path` and `viewBox="0 -960 960 960"`), stored in the theme-owned icon set in the database like every other icon, with no hardcoded fill color.
- The clear button styling becomes practically identical to `tags-toggle-btn` (same column layout, spacing, and text size).
- Disabled-until-selection semantics, placement (Tags → Clear → Match, same header row), and one-click deselect behavior are unchanged.

## Capabilities

### New Capabilities

- None — this change refines existing behaviors only.

### Modified Capabilities

- `tag-management`: clear button label becomes "Clear" (capital C) stacked above the icon; selection and deselect semantics unchanged.
- `collection-layout-and-navigation`: clear button adopts the `tags-toggle-btn` stacked style in the same header position.
- `theme-icon-storage`: `iconAssets.clear` artwork becomes the verbatim supplied SVG path and viewBox (superseding the outline redrawing), still theme-owned with read backfill and edit support.

## Impact

- Frontend: `Sidebar.tsx` button content order and classes, `ICON_ASSETS.clear` defaults, possibly `index.css` if a dedicated rule is still needed.
- Contracts: no key-set change (`clear` key already exists); no schema change expected.
- Backend/seeds: stored `clear` artwork changes via code defaults plus existing read-normalization/backfill; existing custom `clear` artwork is preserved per the fill-missing-keys rule.
- Tests: sidebar label/layout tests, icon artwork assertions, theme backfill expectations for the new `clear` path/viewBox.
