## Why

Users who filter the collection by multiple tags have no one-click way to reset the tag selection from the left sidebar; they must uncheck each tag pill individually. A always-visible "clear" control in the tags frame header removes that friction and makes the active filter state obvious.

## What Changes

- Add a `clear` button to the left-column tags frame header, placed in the same row between the `Tags` toggle button and the `Match` (any/all) selector, without changing the column layout.
- The button shows the text "clear" plus a clear-filter icon; it is rendered disabled while no tag is selected and enabled as soon as one or more tags are selected.
- Activating the enabled button deselects all selected filter tags (`filters.tags` becomes empty); afterwards the button returns to the disabled state while no tag is selected.
- Add a `clear` entry to the theme-owned icon set (`IconAssetKey`, defaults, seeds, validation, forms) using an outline stroke-style redrawing of the requested artwork, rendered via `<ThemeIcon name="clear" />` with no hardcoded color.

## Capabilities

### New Capabilities

- None — this change extends existing behaviors only.

### Modified Capabilities

- `tag-management`: tag-filter selection gains a one-click "deselect all" action with disabled-until-selection semantics.
- `collection-layout-and-navigation`: sidebar tags-frame header gains the clear control in the Tags → clear → Match row with unchanged column distribution.
- `theme-icon-storage`: theme `iconAssets` record gains the `clear` key (path + viewBox) with read normalization and edit support.

## Impact

- Frontend: `Sidebar.tsx` header row, `ThemeIcon` usage, `ICON_ASSETS` defaults, `ThemeForm` icon editing, related CSS for the clear button disabled/enabled states.
- Contracts: `packages/contracts/src/theme.ts` (`iconAssetKeys`, schemas, types).
- Backend/seeds: theme seed documents, icon backfill/normalization in `themes.service.ts`, theme API validation (new key required on write, backfilled on read).
- Tests: sidebar/filter tests, theme API/service tests, icon rendering tests.
