## Why

The active theme's `iconAssets` is stored in the database as a list of key names (`['spell', 'copy', ...]`), while the actual icon definitions — the SVG `path` and `viewBox` — live hardcoded in `src/web/lib/iconAssets.ts` in the frontend bundle. As a result, a theme cannot customize the icons it declares: toggling the per-icon checkboxes in the theme form only changes which *keys* the theme lists, never the artwork. The icons must travel with the theme document so each theme owns its visual identity end-to-end.

## What Changes

- `iconAssets` in the theme schema changes from `string[]` of keys to a `Record<IconAssetKey, { path, viewBox }>` of icon definitions, validated at the contract boundary.
- Add `sun`, `moon`, and `add` to the `IconAssetKey` enum (the remaining glyph characters that don't yet have keys).
- Seeded `light` and `dark` themes carry a complete icon record, sourced from `ICON_ASSETS`.
- A new `ThemeIcon` component renders an inline `<svg class="icon">` from the active theme's icon record, falling back to the bundled `ICON_ASSETS` when a key is missing (covers pre-migration stored themes and per-key fallbacks).
- `useSiteTheme` exposes the active theme's icon record.
- `ThemeToggle` and the add/close buttons consume `ThemeIcon` so every icon's artwork flows from the active theme (with fallback).
- **BREAKING** for existing themes in storage: `iconAssets` shape changes from a key list to keyed definitions.

## Capabilities

### New Capabilities
- `svg-icon-rendering`: Interactive icons in the UI render as inline SVGs whose path and viewBox come from the active theme, with per-icon fallback to a bundled default; the theme owns the icon artwork.

### Modified Capabilities
- `theme-system`: Theme icon assets change from a list of keys to keyed icon definitions (SVG path + viewBox), validated on save, editable through the theme form, seeded for light/dark, and consumed by the UI.

## Coordination with archived `outline-icons-only`

The visual style (line/outline) is governed by the `icon-style` capability in the archived `outline-icons-only` change. `ICON_ASSETS` in `src/web/lib/iconAssets.ts` already holds Lucide-style stroke paths with viewBox `0 0 24 24`; this change uses those same outline paths when seeding themes and as the per-key fallback, so themes inherit the outline style without re-encoding it.

## Impact

- `packages/contracts/src/theme.ts` — `iconAssetKeys` (add `sun`, `moon`, `add`), `iconAssetDefinitionSchema`, `iconAssets` field shape (keyed record)
- `src/web/lib/iconAssets.ts` — add `sun`/`moon`/`add` outline entries; remains the canonical fallback/seed map
- `src/api/repositories/themeSeed.ts` — seed themes carry the full icon record
- `src/web/hooks/useSiteTheme.ts` — expose the active theme's icon record (with fallback)
- `src/web/components/ThemeIcon.tsx` (new) — inline SVG renderer
- `src/web/components/ThemeToggle.tsx` — sun/moon via `ThemeIcon` (last remaining glyph component after `outline-icons-only`)
- `src/web/pages/CollectionPage.tsx` — add-item `+` and close `✕` via `ThemeIcon`
- `src/web/components/ItemForm.tsx`, `ItemCardViewer.tsx`, `TagForm.tsx`, `ThemeForm.tsx`, `Sidebar.tsx`, `TagsPage.tsx` — close `✕` via `ThemeIcon`
- `src/web/components/ItemCard.tsx` — use `ThemeIcon` for action icons
- `src/web/components/ThemeForm.tsx` — manage per-key icon definitions (path + viewBox text inputs)
- `src/web/index.css` — drop the now-unnecessary `font-family` pin on `.add-item-button`; ensure `.icon` sizing carries the new icons
- `src/tests/shared/themeValidation.test.ts`, `src/tests/api/themes.test.ts`, affected component tests — shape and icon-rendering assertions
- Theme documents in MongoDB (shape migration: `iconAssets` array → keyed record, normalized at load via fallback)