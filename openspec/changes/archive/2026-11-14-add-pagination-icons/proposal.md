# Proposal

## Why

The pagination row currently sits above the item list, so the range counter interrupts the flow before the user reaches the items, and the controls are text buttons that do not match the icon-driven interface. Users also cannot jump straight to the end of a long collection.

## What Changes

- Move the whole pagination row (range counter plus controls) below the item list, directly after the last item card.
- Replace the `Previous`/`Next` text buttons with icon-only buttons that render the new `previous-page` and `next-page` theme icons, and add a `last-page` button that jumps to the final page.
- Keep accessible names (`Previous page`, `Next page`, `Last page`) and the existing disabled boundaries; `Last page` is disabled when the user is already on the last page.
- Add three icon asset keys (`previous-page`, `next-page`, `last-page`) to the icon catalogue, drawn as outline strokes in the existing icon style, available to every theme: seeded themes get them, stored themes gain them on read and through the startup backfill, and admins can edit them like any other icon.
- Update the collection-pagination and theme-icon-storage specs to describe the new placement, the third control, and the enlarged icon key set.

## Capabilities

### New Capabilities

<!-- None: both capabilities already exist. -->

### Modified Capabilities

- `collection-pagination`: the navigation controls gain a Last-page jump and the counter/controls row moves below the list.
- `theme-icon-storage`: the icon key catalogue grows from twenty-four to twenty-seven keys, and every theme must carry the three pagination navigation icons.

## Impact

- Contracts: `iconAssetKeys` in `packages/contracts/src/theme.ts` gains `previous-page`, `next-page`, and `last-page`.
- Web defaults: `ICON_ASSETS` in `src/web/lib/iconAssets.ts` gains the three outline paths (reached by the seed builder and by `buildIconAssetsRecord`).
- Existing data: no migration file is needed; the API fills missing keys on read and `backfillIconAssets` persists them at startup.
- Frontend: `CollectionPagination` renders three icon buttons and moves below the list; `CollectionPage` renders it after `CollectionList`; `index.css` adjusts the row spacing.
- Tests: icon-catalogue/backfill expectations, pagination component and page tests (placement, last-page jump, icon names), and theme form coverage.
