## 1. Service-side normalization

- [x] 1.1 In `src/api/services/themes.service.ts`, add a `normalizeStoredTheme` helper that, given a stored theme with `iconAssets` as a `string[]`, returns a copy with `iconAssets` replaced by a keyed record (each listed key merged with the bundled `ICON_ASSETS` default for that key); themes already in the keyed shape pass through unchanged
- [x] 1.2 Apply `normalizeStoredTheme` inside `publicTheme` so every read path (list, get, create, update, activate, getActiveForUser, getActivePaletteForUser) returns a valid `Theme`
- [x] 1.3 Import `ICON_ASSETS` from `src/web/lib/iconAssets` (already done by `themeSeed.ts`) and use it as the canonical fallback for legacy keys

## 2. Tests

- [x] 2.1 Add a regression test in `src/tests/api/themes.service.test.ts` that seeds a theme document directly with the legacy `iconAssets: ['spell', 'copy']` shape and asserts `getActiveForUser` returns a valid `Theme` whose `iconAssets` is a keyed record with `path`/`viewBox` for `spell` and `copy`
- [x] 2.2 Add a regression test in `src/tests/api/themes.test.ts` covering the legacy shape via `GET /api/themes/active` and `GET /api/themes` (HTTP 200, response carries a keyed `iconAssets`)
- [x] 2.3 Confirm that a stored theme with the keyed shape still passes through unchanged (no double normalization)

## 3. Validation

- [x] 3.1 Run `npm run check` and confirm lint, tests, and build pass
- [x] 3.2 Live-verify against the running API: `GET /api/themes/active` returns HTTP 200 for a user whose stored themes still carry the legacy `iconAssets` array, and toggling the preference via `PATCH /api/auth/me/theme` is followed by an `/api/themes/active` response whose `theme.name` matches the new preference