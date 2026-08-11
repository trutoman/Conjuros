## 1. Contracts

- [x] 1.1 In `packages/contracts/src/theme.ts`, restore `iconAssetDefinitionSchema = z.object({ path: z.string().trim().min(1).max(8_000), viewBox: z.string().trim().min(1).max(64) })` and change `iconAssetsSchema` from `z.array(iconAssetKeySchema).min(1)` back to `z.record(iconAssetKeySchema, iconAssetDefinitionSchema).refine(record => Object.keys(record).length > 0, 'A theme must define at least one icon asset')`. Restore the `IconAssetDefinition` and `IconAssets` types.
- [x] 1.2 Update `src/tests/shared/themeValidation.test.ts`: change `iconAssets: ['spell', 'copy', 'view']` back to a keyed record; re-add the legacy-array regression test that asserts the contract rejects a `string[]` for `iconAssets` (and accepts the keyed shape).
- [x] 1.3 Update `src/tests/api/themes.test.ts`: payloads that pass `iconAssets: ['spell', 'copy']` go back to keyed records.

## 2. Server

- [x] 2.1 In `src/api/repositories/themeSeed.ts`, change `iconAssetsFromDefaults()` to return a keyed record drawing every key's `path`/`viewBox` from `ICON_ASSETS`.
- [x] 2.2 In `src/api/services/themes.service.ts`, update `normalizeStoredTheme`: a stored `string[]` is converted to a keyed record by merging each entry's `{path, viewBox}` from `ICON_ASSETS`; a stored keyed record passes through unchanged.
- [x] 2.3 Update `backfillIconAssets` to compute the canonical 20-key keyed record (merging `ICON_ASSETS` with any stored keys, so existing customizations win) and upsert it via `themes.replace` when the merged record differs from the current one.

## 3. Frontend rendering

- [x] 3.1 Delete `src/web/components/Sprite.tsx`.
- [x] 3.2 In `src/web/components/ThemeIcon.tsx`, render `<svg className="icon" viewBox={definition.viewBox}><title>{title}</title><path d={definition.path} /></svg>` from the active theme's stored record, with the bundled `ICON_ASSETS` as the defensive fallback.
- [x] 3.3 In `src/web/components/ThemeIconsContext.ts`, expose the keyed record again (merging `ICON_ASSETS` as a fallback) so `<ThemeIcon>` reads `path`/`viewBox` directly from the context.
- [x] 3.4 In `src/web/hooks/useSiteTheme.ts`, return the theme's `iconAssets` keyed record directly under the `icons` field (no array overlay).
- [x] 3.5 Remove `<Sprite />` from `src/web/App.tsx`.

## 4. Theme form

- [x] 4.1 In `src/web/components/ThemeForm.tsx`, restore the icon section as per-key `path`/`viewBox` editors (one row per `IconAssetKey` with a path textarea and a viewBox input, both prefilled from `theme?.iconAssets` and falling back to `ICON_ASSETS` defaults). The form state and submit payload use the keyed record.

## 5. Tests and validation

- [x] 5.1 Update `src/tests/api/themes.service.test.ts` test fixtures and assertions for the keyed-record shape (the previous keyed-record regression tests come back into scope).
- [x] 5.2 Update `src/tests/api/themes.test.ts` test fixtures and HTTP-level assertions for the keyed-record shape.
- [x] 5.3 Update `src/web/components/__tests__/Sprite.test.tsx` (delete it) and `src/web/components/__tests__/ItemCard.test.tsx` to assert inline `<path d="...">` rendering instead of `<use href="#..."/>`.
- [x] 5.4 Update `src/web/lib/__tests__/applyTheme.test.ts` fixture to use the keyed-record shape.
- [x] 5.5 Update `src/web/hooks/__tests__/useThemePreference.test.tsx` fixture to use the keyed-record shape.
- [x] 5.6 Run `npm run check` and confirm lint, tests, and build pass.
- [x] 5.7 Live-verify against the running API: stored themes carry `iconAssets` as a keyed record with `path`/`viewBox` for every `IconAssetKey`; `GET /api/themes/active` returns the keyed record; toggling the preference fetches and renders the new theme's icons.