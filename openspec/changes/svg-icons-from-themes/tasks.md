## 1. Contracts

- [x] 1.1 In `packages/contracts/src/theme.ts`, add the `sun`, `moon`, and `add` keys to `iconAssetKeys`, define an `iconAssetDefinitionSchema` (`{ path: string; viewBox: string }`), and change `iconAssets` from `z.array(iconAssetKeySchema)` to `z.record(iconAssetKeySchema, iconAssetDefinitionSchema)`
- [x] 1.2 Update the shared contract types and any validation tests (`src/tests/shared/themeValidation.test.ts`) for the new keyed definition shape

## 2. Seed and backend

- [x] 2.1 In `src/web/lib/iconAssets.ts`, add `sun`, `moon`, and `add` entries as Lucide-style outline paths with `0 0 24 24` viewBox, consistent with the other outline keys already in the file
- [x] 2.2 In `src/api/repositories/themeSeed.ts`, seed the light and dark themes with the full icon record (path + viewBox per key) sourced from `ICON_ASSETS`
- [x] 2.3 Update theme API tests (`src/tests/api/themes.test.ts`) for the new icon definition shape and validation

## 3. Frontend rendering

- [x] 3.1 In `src/web/hooks/useSiteTheme.ts`, expose the active theme's icon record merged with the `ICON_ASSETS` fallback per key
- [x] 3.2 Add a `ThemeIcon` component that renders an inline `<svg class="icon">` (accessible `aria-label`, `<title>`) from the active theme's icon record with fallback
- [x] 3.3 Replace `☀`/`☾` in `ThemeToggle.tsx` with `<ThemeIcon name="sun"|"moon" />` (the last remaining glyph file after `outline-icons-only`)
- [x] 3.4 Replace `+` in the add-item button in `CollectionPage.tsx` with `<ThemeIcon name="add" />`, preserving the button's size
- [x] 3.5 Replace `✕` in all close buttons (`ItemForm.tsx`, `ItemCardViewer.tsx`, `TagForm.tsx`, `Sidebar.tsx`, `TagsPage.tsx`, `CollectionPage.tsx`) with `<ThemeIcon name="close" />`
- [x] 3.6 Update `ItemCard.tsx` to source its icon paths from the active theme via `ThemeIcon` instead of the hardcoded `ICON_ASSETS` map
- [x] 3.7 Update `ThemeForm.tsx` to manage the per-key icon definitions (path + viewBox text inputs) and the new `sun`/`moon`/`add` keys

## 4. CSS

- [x] 4.1 Drop the `font-family: var(--font-display, 'Cinzel', serif)` pin on `.add-item-button` (the SVG swap supersedes it); ensure the `.icon` class sizes the new icons correctly

## 5. Tests and validation

- [x] 5.1 Update component tests that assert glyph text or hardcoded paths for the affected components (the prior `outline-icons-only` change already covered close buttons; this change adds assertions for the new `ThemeIcon` wiring)
- [x] 5.2 Add a test asserting every interactive icon is rendered via `ThemeIcon` with a `path` from the active theme, and that a theme omitting a key falls back to the bundled `ICON_ASSETS`
- [x] 5.3 Run `npm run check` and confirm lint, tests, and build pass