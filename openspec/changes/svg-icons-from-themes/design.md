## Context

Text glyphs remain in five places: `ThemeToggle` (`☀`/`☾`), the add-item button (`+`), and `✕` in close buttons (`ItemForm`, `ItemCardViewer`, `TagForm`, `ThemeForm`, `Sidebar`, `TagsPage`, `CollectionPage`). Item-card action icons already render inline SVGs from `src/web/lib/iconAssets.ts` (`ICON_ASSETS`), keyed by `IconAssetKey`. The theme's `iconAssets` in the DB is currently only `string[]` of keys, and `applyTheme`/`useSiteTheme` expose colors/fonts/palette but not icons to the UI. The reported bug motivation: the `+` glyph inherits the body font (`Cormorant Garamond`) and appears off-center; an SVG with a stable viewBox avoids font-metric alignment entirely.

## Goals / Non-Goals

**Goals:**
- Replace all glyph characters with inline SVGs rendered from theme-driven definitions.
- Store real icon definitions (path + viewBox) in themes so the theme controls rendering.
- Keep existing icon assets/keys working, adding `sun`, `moon`, `add`.
- Preserve the current visual size of every replaced icon.

**Non-Goals:**
- No new icon *rendering* library or `<symbol>`/sprite system — single-path inline SVGs, consistent with `ICON_ASSETS`.
- No redesign of icon artwork beyond hand-editing the three new keys and reusing existing paths where sensible.
- No backend auth/role changes.

## Decisions

**Represent icon definitions as a keyed map in the theme, keeping it in contracts.**
Change `iconAssets` in `themeSchema` from `z.array(iconAssetKeySchema)` to `z.record(iconAssetKeySchema, z.object({ path: z.string(), viewBox: z.string() }))` (or a `Record<IconAssetKey, IconDefinition>`). This keeps the invariants (valid keys only, path+viewBox present) at the boundary like the rest of the theme shape.
- Alternative: separate `icons` collection/table. Rejected — icons belong to the theme identity and change atomically with it; the theme already owns kind colors, fonts, and sizes.

**Make `ICON_ASSETS` the canonical seed and fallback, and reuse it to seed themes.**
`ICON_ASSETS` in `src/web/lib/iconAssets.ts` already holds `path`+`viewBox` per key. Keep it as: (1) the fallback map the renderer uses when a theme omits a key, and (2) the source for seeding `themeSeed.ts` icon definitions (light/dark). This avoids duplicating path data in two files.
- Alternative: move paths into a shared JSON consumed by both server seed and client. Rejected — introduces a new module boundary for little gain; one TS module imported by both is sufficient, and `iconAssets.ts` is already isomorphic (pure data).

**Expose the active theme's icons through `useSiteTheme` and a small `ThemeIcon` component.**
`useSiteTheme` already resolves the active `Theme`; add `icons` to its return (the theme's icon record, or `{}` when none). Introduce `ThemeIcon({ name, size?, label? })` that looks up the active theme's definition, falls back to `ICON_ASSETS[name]`, and renders an `<svg class="icon">` with `<title>`/`aria-label`. Components replace literal glyphs with `<ThemeIcon>`.
- Alternative: thread icons via React context. Rejected — `useSiteTheme` already provides the resolved theme at the top level; a single hook + component keeps the change small.

**Store viewBox per icon and keep a 1:1 "size preserved" rule via current CSS.**
The `.icon` class already sizes SVGs (`.icon-filled`, `icon`) and buttons define their box (`font-size: 2rem` replaced by explicit width/height on the add button). Keep the existing CSS classes; for the add button, remove reliance on `font-size` and set explicit `width`/`height` so the SVG scales to the previous `+` size.
- Alternative: CSS `mask-image`. Rejected — breaks the "inline SVG" accessibility requirement (aria-label/title) and the existing `<path>` model.

## Risks / Trade-offs

- **Existing stored themes lack icon definitions** → Normalize at load/resolve time: `useSiteTheme` merges `ICON_ASSETS` as fallback per key; optionally a migration backfills `iconAssets` on read of each theme. Low risk since the shape read by the UI is always defensively merged.
- **Contract change breaks API tests / theme form** → Update `themeValidation.test.ts`, `themes.test.ts`, and `ThemeForm` icon section in the same change; `npm run check` is the gate.
- **ViewBox mismatch changes apparent size** → All new icons reuse the `0 -960 960 960` viewBox where paths are Material-style, and the add/`+` icon uses the same viewBox, preserving scale.