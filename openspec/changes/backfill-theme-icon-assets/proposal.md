## Why

After `svg-icons-from-themes` and the subsequent `theme-svg-sprite-icons` change, the theme contract requires `Theme.iconAssets` to be a flat `string[]` of symbol ids (`IconAssetKey[]`). Stored theme documents predate `theme-svg-sprite-icons` and still carry the legacy `string[]` shape from earlier runs — typically 16 entries instead of the 20 keys the contract now expects (the contract adds `sun`, `moon`, `add`). The runtime path normalizes the legacy array on every read (`normalizeStoredTheme`), and the frontend further overlays the bundled sprite on top, so the rendered icons always come from the bundled sprite regardless of which theme is active. The database does not own which symbols the theme exposes.

## What Changes

- A boot-time backfill upserts every stored theme document so its `iconAssets` is a `string[]` covering every `IconAssetKey` (20 keys).
- The backfill preserves any per-theme customization already in the array: only the missing keys are added; the existing keys are left alone.
- The backfill is idempotent: re-running it produces the same final state.
- `ICON_ASSETS` is no longer consulted at runtime for icon artwork — the bundled SVG sprite (`src/web/components/Sprite.tsx`) carries every symbol's `path` and `viewBox`. The backfill service still imports `ICON_ASSETS` only to validate known keys during the canonical-list computation.
- A stored theme whose `iconAssets` is still a per-key `{path, viewBox}` record (a transient state from before `theme-svg-sprite-icons` migrated the schema) is normalized on read by `normalizeStoredTheme` to its id list, then upserted by the backfill on the next boot.

## Capabilities

### New Capabilities
- `theme-icon-backfill`: Stored theme documents are upserted at startup so every theme carries a `string[]` `iconAssets` covering every `IconAssetKey`, without losing any per-theme customization.

### Modified Capabilities
<!-- None: this is a storage-shape migration; the API contract (`string[]`) is unchanged. -->

## Impact

- `src/api/services/themes.service.ts` — `backfillIconAssets()` already exists; rewrite its merge logic so it produces the canonical id list (`iconAssetKeys`) instead of the previously-keyed record. `normalizeStoredTheme` already normalizes the legacy keyed record to its id list on read.
- `src/api/repositories/themes.repository.ts` — reuse the existing `replace` contract (no change needed; full-document replace from the merged theme is acceptable).
- `src/api/server.ts` — already invokes `backfillThemeIcons(themesService)` after `ensureThemesSeeded()` via `src/api/bootstrap.ts` (`backfillThemeIcons`); no further wiring needed.
- `src/tests/api/themes.service.test.ts` and `src/tests/api/themes.test.ts` — assert the id-list shape (`Array.isArray`) and the canonical 20-key coverage after backfill, instead of the previous keyed-record assertions.
- No frontend change (the sprite-rendering path already handles the id list).