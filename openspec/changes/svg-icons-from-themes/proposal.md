## Why

The interface mixes text glyphs with SVG icons: `☀`/`☾` in the theme toggle, `+` in the add-item button, and `✕` in close buttons are raw text characters subject to font metrics (causing the vertical off-center `+` already reported), while item-card actions already use proper SVGs. Additionally, the active theme's `iconAssets` is stored only as a key list, while the actual icon definitions live hardcoded in `src/web/lib/iconAssets.ts` — so a theme cannot customize the icons it declares.

## What Changes

- Replace every remaining text glyph (`☀`, `☾`, `+`, `✕`) with inline SVG icons, preserving the current rendered sizes.
- Add `sun`, `moon`, and `add` icon asset keys; keep `close` and the existing `ICON_ASSETS` set.
- Make icon definitions part of the theme: a theme SHALL store the actual SVG path + viewBox for each icon asset it declares, and the active theme's icons SHALL drive the SVG paths rendered across the UI (with safe fallback when a declared icon is missing).
- The theme form SHALL manage the new keys and the icon glyph definitions; seeded themes reproduce the current icons.
- **BREAKING** for existing themes in storage: `iconAssets` shape changes from a key list to keyed definitions.

## Capabilities

### New Capabilities
- `svg-icon-rendering`: Every interactive glyph in the UI is rendered as an inline SVG icon whose path and viewBox come from the active theme, with per-icon fallback; glyph characters are no longer used.

### Modified Capabilities
- `theme-system`: Theme icon assets change from a list of keys to keyed icon definitions (SVG path + viewBox), validated and editable through the theme form, seeded for light/dark, and consumed by the UI to render icons.

## Impact

- `packages/contracts/src/theme.ts` — `iconAssetKeys`, `iconAssetKeySchema`, `iconAssets` field shape (keyed definitions), new keys (`sun`, `moon`, `add`)
- `src/web/lib/iconAssets.ts` — becomes the seed/source of default SVG paths; consumed by seeds and as fallback
- `src/api/repositories/themeSeed.ts` — seed themes now carry icon definitions
- `src/web/components/ThemeToggle.tsx`, `ItemForm.tsx`, `ItemCardViewer.tsx`, `TagForm.tsx`, `ThemeForm.tsx`, `Sidebar.tsx`, `TagsPage.tsx`, `CollectionPage.tsx` — replace glyphs with SVG icons sourced from the active theme
- `src/web/components/ItemCard.tsx` — switch from hardcoded `ICON_ASSETS` to the active theme's icon definitions
- `src/web/components/ThemeForm.tsx` — manage icon definitions and new keys
- `src/web/hooks/useSiteTheme.ts` / `src/web/services/themes.ts` — expose the active theme's icon map
- `src/tests/shared/themeValidation.test.ts`, `src/tests/api/themes.test.ts`, affected component tests — shape and glyph assertions
- Theme documents already stored in MongoDB (shape migration for `iconAssets`)