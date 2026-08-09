## 1. Contracts

- [ ] 1.1 In `packages/contracts/src/theme.ts`, add the `sun`, `moon`, and `add` keys to `iconAssetKeys`, define an `iconAssetDefinitionSchema` (`{ path: string; viewBox: string }`), and change `iconAssets` from `z.array(iconAssetKeySchema)` to `z.record(iconAssetKeySchema, iconAssetDefinitionSchema)`
- [ ] 1.2 Update the shared contract types and any validation tests (`src/tests/shared/themeValidation.test.ts`) for the new keyed definition shape

## 2. Seed and backend

- [ ] 2.1 In `src/web/lib/iconAssets.ts`, add `sun`, `moon`, and `add` entries (Material-style paths, `0 -960 960 960` viewBox), keeping `ICON_ASSETS` as the canonical fallback/seed map
- [ ] 2.2 In `src/api/repositories/themeSeed.ts`, seed the light and dark themes with icon definitions sourced from `ICON_ASSETS` for all keys
- [ ] 2.3 Update theme API tests (`src/tests/api/themes.test.ts`) for the new icon definition shape and validation

## 3. Frontend rendering

- [ ] 3.1 In `src/web/hooks/useSiteTheme.ts`, expose the active theme's icon definitions (falling back to `ICON_ASSETS` per key)
- [ ] 3.2 Add a `ThemeIcon` component that renders an inline `<svg class="icon">` (accessible `aria-label`, hidden decorative markup) from the active theme's definitions with fallback
- [ ] 3.3 Replace `☀`/`☾` in `ThemeToggle.tsx` with the `sun`/`moon` icons at the same rendered size
- [ ] 3.4 Replace `+` in the add-item button in `CollectionPage.tsx` with the `add` icon, preserving the button's size (explicit width/height instead of font sizing)
- [ ] 3.5 Replace `✕` in all close buttons (`ItemForm.tsx`, `ItemCardViewer.tsx`, `TagForm.tsx`, `ThemeForm.tsx`, `Sidebar.tsx`, `TagsPage.tsx`, `CollectionPage.tsx`) with the `close` icon at the same rendered size
- [ ] 3.6 Update `ItemCard.tsx` to source its icon paths from the active theme via `ThemeIcon` instead of the hardcoded `ICON_ASSETS` map
- [ ] 3.7 Update `ThemeForm.tsx` to manage the new keys and icon definitions

## 4. CSS

- [ ] 4.1 Adjust `.add-item-button` and close-button styles so the SVG fills the previous glyph dimensions (width/height, `display: flex`, no `font-size` dependence); remove any font-metric centering workaround for the `+` if superseded

## 5. Tests and validation

- [ ] 5.1 Update component tests that assert glyph text (`TagForm.test.tsx`, `ItemForm.test.tsx`, `ThemeToggle.test.tsx`, affected page tests) to assert accessible icon buttons instead
- [ ] 5.2 Add a test asserting every interactive glyph renders an inline SVG driven by the active theme and falls back when a theme omits an icon
- [ ] 5.3 Run `npm run check` and confirm lint, tests, and build pass