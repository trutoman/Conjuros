## 1. Service backfill method

- [x] 1.1 In `src/api/services/themes.service.ts`, `backfillIconAssets()` walks every stored theme, builds the canonical id list from `iconAssetKeys`, and upserts via `themes.replace` when the merged set differs from the current `string[]`
- [x] 1.2 Skip the write when the merged id set is identical to the existing array (set equality), so a second run is a true no-op
- [x] 1.3 Use the existing repository contract (`replace`) to persist the merged theme document without losing `updatedAt` or other fields unexpectedly

## 2. Repository support

- [x] 2.1 In `src/api/repositories/themes.repository.ts`, confirm the existing `replace` works for the full-document replacement the backfill performs (`MongoThemesRepository` does `replaceOne`; `InMemoryThemesRepository` does `Map.set`). No repo change needed.

## 3. Wire into boot

- [x] 3.1 In `src/api/server.ts`, call `await backfillThemeIcons(themesService)` immediately after `ensureThemesSeeded()` so every theme carries the full id list before any request is served
- [x] 3.2 The service method tolerates no-themes-yet (a freshly empty collection) by no-opping when `themes.count() === 0`

## 4. Tests

- [x] 4.1 In `src/tests/api/themes.service.test.ts`, regression test that seeds a 1-entry partial id list and asserts `backfillIconAssets()` upserts it to the canonical 20-entry `string[]` covering every `IconAssetKey`
- [x] 4.2 Regression test that asserts only the missing keys are added while existing entries are preserved exactly (no reordering, no duplicates)
- [x] 4.3 Idempotency test: running `backfillIconAssets()` twice produces zero writes on the second run (the `updatedAt` stays the same)
- [x] 4.4 In `src/tests/api/themes.test.ts`, regression test that seeds a stored keyed-record document and asserts `GET /api/themes/active` returns a `string[]` of length 20

## 5. Validation

- [x] 5.1 Run `npm run check` and confirm lint, tests, and build pass (404 tests)
- [x] 5.2 Live-verify against the running API: boot the app once, then inspect MongoDB to confirm every stored theme's `iconAssets` is a `string[]` of length 20 covering every `IconAssetKey`; a second boot produces no further changes