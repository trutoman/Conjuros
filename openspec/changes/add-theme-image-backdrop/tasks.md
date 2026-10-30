## 1. Contracts and data model

- [x] 1.1 Add `useImageBackdrop` (boolean, default `false`) and `imageBackdrop` (nullable `{ storagePath, mimeType, sizeBytes }`) to `themeSchema` in `packages/contracts/src/theme.ts`
- [x] 1.2 Add the conditional rule: `useImageBackdrop: true` requires `imageBackdrop`
- [x] 1.3 Add the output-only `imageBackdropUrl` field to the theme response and omit it from `themeInputSchema`
- [x] 1.4 Add `use_image_backdrop` and `image_backdrop` columns to `themes` in `src/api/db/schema.ts`
- [x] 1.5 Generate migration `0009` with `npm run db:generate` and verify it adds the columns with `DEFAULT false` and `NULL`
- [x] 1.6 Map the new columns in `toStoredTheme` and `toThemeColumns` in `src/api/repositories/themes.repository.ts`
- [x] 1.7 Set `useImageBackdrop: false` and `imageBackdrop: null` in the seed themes in `src/api/repositories/themeSeed.ts`

## 2. Theme image storage (API)

- [x] 2.1 Add `THEME_ASSET_BUCKET` to `parseApiEnvironment()` with default `assets`, and expose it through the app dependencies
- [x] 2.2 Add a storage method that writes a theme object at `themes/{theme_id}/{uuid}.{ext}` and returns its public URL, with no delete operation
- [x] 2.3 Restrict the accepted MIME types to `png`, `jpeg`, `webp` and the size to 5 MB, reusing `fileSignature.ts` for content checks
- [x] 2.4 Translate storage failures into `AppError` codes (413, 415, 503, 404) and log raw details server-side
- [x] 2.5 Add `POST /api/themes/:id/image-backdrop` (admin only, multipart) that validates, uploads, and updates the theme reference in that order
- [x] 2.6 Ensure a failed validation, upload, or update leaves the previous reference unchanged
- [x] 2.7 Compute `imageBackdropUrl` in the theme service from the bucket public URL when `imageBackdrop` is set

## 3. Rendering (web)

- [x] 3.1 Add image-mode CSS in `src/web/index.css`: `:root[data-backdrop-mode='image'] body` with `var(--texture)`, `repeat`, `auto`, `scroll`, and `background-color` fallback; remove the `html` background in this mode
- [x] 3.2 Extend `applyTheme` to set `--texture` and `data-backdrop-mode` only when called with image mode, and to clear both in the `null` branch and in backdrop mode
- [x] 3.3 Add the image probe in `useSiteTheme`: apply image mode on `load`, keep backdrop mode on `error`, and keep backdrop mode while loading
- [x] 3.4 Ensure the probe is cancelled when the theme or preference changes before it finishes

## 4. Theme form

- [x] 4.1 Add a "Use image backdrop" checkbox to `ThemeForm` that sets `useImageBackdrop`, disabled until the theme has a stored image reference
- [x] 4.2 Show the image picker always on saved themes, restricted to `png`, `jpeg`, `webp`, with a 5 MB client-side check; the picker uploads immediately on selection
- [x] 4.3 Keep the form open on the saved theme when an upload fails; for a new theme, save it with the mode off first, then offer the picker
- [x] 4.4 Keep the `backdrop` fields editable while image mode is on

## 5. Tests

- [x] 5.1 Contract tests: image mode without reference is rejected; backdrop mode keeps a reference; default is `false`
- [x] 5.2 Repository tests (PGlite): migration `0009` applies and existing rows read as `false` and `null`
- [x] 5.3 Upload endpoint tests: admin success, non-admin 403, unsupported type 415, oversized 413, content mismatch 415, no object or row change on failure
- [x] 5.4 Storage tests: object path ignores the client file name; no delete call is made on replacement or theme deletion
- [x] 5.5 `applyTheme` tests: image mode sets `--texture` and the attribute; backdrop mode and `null` clear them
- [x] 5.6 Probe tests: `load` switches to image mode, `error` stays in backdrop mode, and a superseded probe is ignored

## 6. Verification

- [x] 6.1 Run `npm run check` and resolve all failures
- [ ] 6.2 Verify in the browser: a valid image tiles over the page; a missing image and a corrupt file both fall back to the backdrop
