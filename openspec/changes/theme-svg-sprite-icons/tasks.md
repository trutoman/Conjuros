## 1. Contracts

- [x] 1.1 In `packages/contracts/src/theme.ts`, change `iconAssetsSchema` from `z.record(iconAssetKeySchema, iconAssetDefinitionSchema).refine(...)` to `z.array(iconAssetKeySchema).min(1)`, drop `iconAssetDefinitionSchema` and the `IconAssetDefinition`/`IconAssets` types
- [x] 1.2 Update `src/tests/shared/themeValidation.test.ts` to use the new id-list shape (the existing `iconAssets: ['spell', 'copy', 'view']` payload already matches)
- [x] 1.3 Update `src/tests/api/themes.test.ts` payloads that pass `iconAssets: { spell: {...}, copy: {...} }` to the new array shape

## 2. Server

- [x] 2.1 In `src/api/repositories/themeSeed.ts`, change `iconAssetsFromDefaults()` to return the full canonical id list (`iconAssetKeys`) as `Theme['iconAssets']`
- [x] 2.2 In `src/api/services/themes.service.ts`, update `normalizeStoredTheme` to handle the new shape: an array passes through; a keyed record contributes its keys; everything else returns the theme unchanged
- [x] 2.3 Update `backfillIconAssets` to compute the missing-key set against `iconAssetKeys` and upsert the canonical id list when the current list differs

## 3. Frontend sprite

- [x] 3.1 Create `src/web/components/Sprite.tsx` that renders one `<svg aria-hidden focusable=false style={{display:'none'}}>` containing one `<symbol id={key} viewBox={viewBox}><path d={path} /></symbol>` per `IconAssetKey`, drawing `path`/`viewBox` from `ICON_ASSETS`
- [x] 3.2 Mount `<Sprite />` once in `src/web/App.tsx`, above the `ThemeIconsContext.Provider`

## 4. Frontend rendering

- [x] 4.1 Update `src/web/components/ThemeIcon.tsx` to render `<svg className="icon" viewBox={viewBox}><use href={`#${name}`} /></svg>` instead of an inline `<path>`
- [x] 4.2 Update `src/web/hooks/useSiteTheme.ts` to return the active theme's normalized id list (the `iconAssets` array) under a new name (e.g. `availableIcons`) and drop the `ICON_ASSETS` overlay
- [x] 4.3 Update `src/web/components/ThemeIconsContext.ts` to expose the available-icons list (no per-key artwork) and resolve `viewBox` for `<ThemeIcon>` from the bundled `ICON_ASSETS` (falling back to `0 0 24 24`)

## 5. Theme form

- [x] 5.1 In `src/web/components/ThemeForm.tsx`, change the icon section from per-key `path`/`viewBox` editors to a checklist of `IconAssetKey`s. Initial state reads from `theme?.iconAssets` (the array); the submit payload sends the array of selected keys

## 6. Tests and validation

- [x] 6.1 Update `src/tests/api/themes.service.test.ts` legacy-shape test fixtures to use the new array shape (or rely on `normalizeStoredTheme` for the legacy record → id list path)
- [x] 6.2 Add a sprite-rendering regression test asserting that `<ThemeIcon name="spell" />` renders `<svg class="icon"><use href="#spell" /></svg>` and that `<Sprite />` mounts one `<symbol>` per `IconAssetKey`
- [x] 6.3 Run `npm run check` and confirm lint, tests, and build pass
- [x] 6.4 Live-verify against the running API: stored themes carry `iconAssets` as a `string[]` of symbol ids; `GET /api/themes/active` returns the id list; the rendered DOM contains the sprite and icons render via `<use>`