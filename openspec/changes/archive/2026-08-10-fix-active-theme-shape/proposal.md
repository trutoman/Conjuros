## Why

After the `svg-icons-from-themes` change, `Theme.iconAssets` in the contract changed from `string[]` of keys to `Record<IconAssetKey, { path, viewBox }>`. Theme documents already stored in MongoDB from previous versions still carry the old array shape (`['spell', 'web-link', …]`). When `getActiveTheme` reads a stored theme and runs it through `themeSchema.parse`, Zod rejects the array shape and the controller returns HTTP 400. As a result, `useSiteTheme` falls into its catch branch and calls `applyTheme(document.documentElement, null)`, clearing every CSS custom property from the root. The user can still toggle their preference and the PATCH persists, but the visual theme never changes because the stylesheet's `:root` defaults always win and the `data-theme`/`color-scheme` attributes are reset on every effect run. The toggle appears to do nothing.

## What Changes

- The themes service normalizes stored theme documents on read: an `iconAssets` array (legacy shape) is converted to the new keyed record, with each known key merged from the bundled `ICON_ASSETS` defaults and any stored `path`/`viewBox` preserved when present.
- The normalization is applied in the single read path (`publicTheme`) so every API response (list, get, create, update, activate, active) returns a valid `Theme` regardless of the stored shape.
- A one-shot migration upserts normalized `iconAssets` back into stored documents so repeated reads no longer hit the legacy branch.
- No breaking change to the API contract; the response shape (keyed record) is unchanged.

## Capabilities

### New Capabilities
- `theme-storage-migration`: The themes API tolerates theme documents stored with the legacy `iconAssets: string[]` shape and normalizes them to the keyed `Record<IconAssetKey, { path, viewBox }>` shape on read, so previously stored themes continue to work without a forced re-seed.

### Modified Capabilities
<!-- None at the API-contract level. The `theme-system` capability from `add-theme-system` is still pending archive; the normalization is contained here and does not change its requirements. -->

## Impact

- `src/api/services/themes.service.ts` — `publicTheme` normalizes legacy shapes; one-shot migration on service construction (or first read)
- `src/api/repositories/themes.repository.ts` — no contract change; the repo already stores arbitrary documents
- `src/web/hooks/useSiteTheme.ts` — no change; the catch branch is now unreachable for the legacy-shape case
- `src/tests/api/themes.test.ts`, `src/tests/api/themes.service.test.ts` — add a regression test for the legacy stored shape