## Why

Themes can only style the page background with generated CSS gradients (the `backdrop` settings). Designers want a theme to use a tiled image texture as the page background instead, stored with the theme itself so each environment (DEV or PROD) serves its own assets.

## What Changes

- Add a second background mode, `image-backdrop`, selected per theme by a boolean flag `useImageBackdrop`. When `false`, the theme keeps the current `backdrop` mode.
- When `useImageBackdrop` is `true`, the theme references a tiled background image (`imageBackdrop`) stored in a public Supabase Storage bucket configured per environment.
- Image files are uploaded by administrators from the theme form and validated for type (`png`, `jpeg`, `webp`) and size (5 MB maximum).
- The image-backdrop body style uses the image as a repeated mosaic tile over the `--page-bg` color fallback, with no vignette layer.
- If the image cannot be loaded or decoded, the page falls back to the `backdrop` mode for that theme.
- Stored image objects are never deleted by the application: replacing the image or deleting the theme leaves the object in Storage.
- The `backdrop` settings remain editable while `useImageBackdrop` is `true`; they are ignored in that mode.

**BREAKING**: none. Existing themes default to `useImageBackdrop = false`, so their appearance does not change.

## Capabilities

### New Capabilities
- `theme-image-backdrop`: boolean mode selection, image reference on the theme document, CSS rendering of the tiled texture, and runtime fallback to the `backdrop` mode.
- `theme-image-storage`: admin upload of theme background images to a public per-environment bucket, with type and size validation, owner-independent object paths, and a no-delete retention rule.

### Modified Capabilities
<!-- None: the existing theme-icon-storage and theme-storage-migration requirements are unchanged. -->

## Impact

- **Contracts** (`packages/contracts/src/theme.ts`): new `useImageBackdrop` boolean and `imageBackdrop` reference schema, with a conditional rule that requires the reference when the flag is `true`.
- **Database** (`src/api/db/schema.ts`, new migration after `0008`): `use_image_backdrop boolean NOT NULL DEFAULT false` and `image_backdrop jsonb NULL`. Existing rows are set explicitly in the migration.
- **API**: a new admin-only upload endpoint for theme images, and a new environment variable `THEME_ASSET_BUCKET` (per environment, parallel to `ATTACHMENT_BUCKET`).
- **Storage**: reuse of the existing Storage seam and `fileSignature.ts` validation; a second, public bucket.
- **Frontend**: `applyTheme` sets the texture variable and the mode attribute; `index.css` gets the image-backdrop body rule; `ThemeForm` gets a mode toggle and an image picker.
- **Tests**: contract, migration, upload endpoint, `applyTheme`, and fallback behavior.
