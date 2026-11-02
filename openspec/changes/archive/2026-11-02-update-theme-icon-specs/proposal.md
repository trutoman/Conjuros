## Why

The last icon releases changed behavior and added the `tags` icon key, but the OpenSpec main specs were not updated. `theme-icon-storage` still describes a twenty-two-key set, and the specs do not require the tags toggle or the item description accordion to render theme-owned artwork. That gap let the `collapse`/`expand` regression pass unnoticed.

## What Changes

- Add `tags` to the theme icon key set, making it twenty-three keys.
- Record that the tags sidebar toggle and the narrow-viewport topbar `Tags` button render `iconAssets.tags` from the active theme.
- Record that the item description accordion renders the `collapse` and `expand` chevrons from the active theme.
- Record that the bundled `attachment` artwork uses the shared 24-unit outline style, without an attachment-specific stroke override.
- Record the superseded-artwork migration behavior for `clear`, `attachment`, and the mistaken `collapse`/`expand` tags artwork, preserving custom values.
- Sync the affected main specs with the behavior already implemented by PRs #64, #65, #66, and #67.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theme-icon-storage`: key set and tags icon, collapse/expand usage, attachment grid/stroke behavior, and superseded-artwork migration.
- `item-card-experience`: description accordion trigger renders the theme's collapse/expand chevrons.
- `collection-layout-and-navigation`: tags sidebar toggle and topbar Tags button render the theme's tags icon.

## Impact

- `openspec/specs/theme-icon-storage/spec.md`
- `openspec/specs/item-card-experience/spec.md`
- `openspec/specs/collection-layout-and-navigation/spec.md`
- No application code changes; this is a retroactive specification sync for already-merged icon work.
