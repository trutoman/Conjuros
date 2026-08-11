## Why

Icons are currently rendered via an SVG `<symbol>` sprite mounted at the document root and referenced with `<use href="#key" />`. The artwork lives in the frontend bundle (`src/web/lib/iconAssets.ts`), and the theme document carries only a `string[]` of `IconAssetKey`s — the database does not own the icon paths. The user wants the icon artwork to travel with each theme in the database (under `Theme.iconAssets`), so every theme carries its own `path` and `viewBox` for every icon it exposes (including `sun`, `moon`, `add`, `close`, and the rest). On every theme load — initial mount and every preference change — the app fetches the active theme's icon record and renders the icons from those stored paths.

## What Changes

- `iconAssetsSchema` in the contract changes from `z.array(iconAssetKeySchema).min(1)` to `z.record(iconAssetKeySchema, iconAssetDefinitionSchema).refine(...)` — a keyed record `{ path, viewBox }` per `IconAssetKey`.
- Seed themes (and the boot-time backfill) carry the full 20-key record drawn from the bundled outline `ICON_ASSETS`. Stored themes whose `iconAssets` is the legacy `string[]` (from `theme-svg-sprite-icons`) are normalized on read to a keyed record whose keys are the array's entries; the backfill then upserts the canonical 20-key record.
- The frontend removes the SVG sprite (`src/web/components/Sprite.tsx` is deleted). `<ThemeIcon>` renders the active theme's stored icon directly as an inline `<svg><path d={stored.path} /></svg>`, sized by the active theme's stored `viewBox`.
- The hook and context expose the active theme's `path`/`viewBox` for every key; the fallback to the bundled `ICON_ASSETS` becomes a defensive safety net only (never the render source when a theme is loaded).
- The theme form reverts to per-key `path` and `viewBox` text inputs so admins can edit the artwork per theme.

## Capabilities

### New Capabilities
- `theme-icon-storage`: Each theme document stores every icon's `path` and `viewBox` directly in `Theme.iconAssets` as a `Record<IconAssetKey, { path, viewBox }>`. The frontend loads those values from the active theme on initial mount and on every theme preference change, and renders each icon as an inline `<svg><path/></svg>` from the stored data.

### Modified Capabilities
- `theme-storage-migration`: Theme `iconAssets` shape reverts to the keyed record (the contract that `svg-icons-from-themes` introduced and `theme-svg-sprite-icons` replaced with an id list). Stored documents whose `iconAssets` is still the legacy `string[]` from `theme-svg-sprite-icons` are normalized on read to a keyed record whose keys are the array's entries.

## Impact

- `packages/contracts/src/theme.ts` — restore `iconAssetDefinitionSchema = z.object({ path: z.string().trim().min(1).max(8_000), viewBox: z.string().trim().min(1).max(64) })` and `iconAssetsSchema = z.record(iconAssetKeySchema, iconAssetDefinitionSchema).refine(record => Object.keys(record).length > 0, ...)`. Restore the `IconAssetDefinition`/`IconAssets` types.
- `src/api/repositories/themeSeed.ts` — `iconAssetsFromDefaults()` writes the full 20-key keyed record sourced from `ICON_ASSETS`.
- `src/api/services/themes.service.ts` — `normalizeStoredTheme` reads as a keyed record (passes through for the new shape, converts the legacy array to a keyed record by merging each entry's `{path, viewBox}` from `ICON_ASSETS`). `backfillIconAssets` upserts the canonical 20-key record.
- `src/web/components/Sprite.tsx` — deleted.
- `src/web/components/ThemeIcon.tsx` — renders an inline `<svg><path d={stored.path} /></svg>` from the theme's stored icon definition, falling back to the bundled `ICON_ASSETS` only when the theme's record doesn't have the key.
- `src/web/components/ThemeIconsContext.ts` — exposes the active theme's keyed record merged with the bundled fallback.
- `src/web/hooks/useSiteTheme.ts` — exposes the theme's keyed `iconAssets` (no array overlay).
- `src/web/components/ThemeForm.tsx` — restores per-key `path` and `viewBox` text inputs (checklist removed; the form sends the keyed record).
- `src/web/App.tsx` — `<Sprite />` mount removed.
- `src/tests/api/themes.test.ts`, `src/tests/api/themes.service.test.ts`, `src/tests/shared/themeValidation.test.ts` — payload and assertion updates for the keyed-record shape.
- Theme documents in MongoDB: stored `iconAssets: string[]` is migrated on read; the boot-time backfill writes the keyed record.