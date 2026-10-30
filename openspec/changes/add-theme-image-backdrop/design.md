## Context

Themes are documents in the `themes` table and are applied in the browser by `applyTheme`, which writes CSS custom properties on `<html>`. The page background is generated in `src/web/index.css` from those properties (see the backdrop change). Attachment files already live in a private Supabase Storage bucket, reached only by the API through the storage seam in `src/api/storage/` and validated by `fileSignature.ts`. See proposal.md for motivation.

Theme images differ from attachments in two ways: they must be loadable by any visitor without a session (so the bucket is public), and the browser needs a URL it can put into CSS.

## Goals / Non-Goals

**Goals:**
- A per-theme boolean that selects `backdrop` or `image-backdrop` rendering.
- Images stored per environment, uploaded by administrators, validated like attachments.
- A page that never breaks when the image is missing or corrupt: it falls back to `backdrop`.

**Non-Goals:**
- Vignette or any additional gradient in image mode.
- Image editing, resizing, or format conversion.
- SVG or GIF support.
- Garbage collection of Storage objects (explicitly excluded by the retention rule).
- Cache tuning beyond the Storage defaults.

## Decisions

**Boolean mode flag `useImageBackdrop` plus `imageBackdrop` reference.** The flag is the single switch the user asked for. The reference is a nullable jsonb value `{ storagePath, mimeType, sizeBytes }`, mirroring how attachments record their stored object. Alternative considered: a mode enum (`backdrop` | `image`). Rejected because the user chose a boolean, and the enum would only add a third value later if needed.

**Public bucket `assets`, configured by `THEME_ASSET_BUCKET`.** The bucket already exists in DEV and PROD; the change does not create it. Matches the existing `ATTACHMENT_BUCKET` pattern, so DEV and PROD buckets are separate by configuration. Object reads are public, so the browser can use the URL directly in CSS without signing. Alternative: signed URLs resolved per request. Rejected because a background fetched on every theme load would need a short-lived signature, and signed URLs expire in the middle of a session. Consequence accepted: anyone holding the URL can view the image; theme images are not private data.

**Public URL derived by the API, not stored.** The stored reference holds only the object path; the API adds `imageBackdropUrl` to the theme response, computed from the Supabase project URL and the bucket. Storing the full URL would break when the project URL or bucket changes between environments. The field is output-only and is omitted from the input schema.

**Upload endpoint and save order.** The image is uploaded to `POST /api/themes/:id/image-backdrop` (admin only, multipart), which needs an existing theme id. The form therefore never saves `useImageBackdrop: true` without a reference:
1. The admin saves the theme with the mode off (`backdrop`). A new theme is created this way.
2. The admin picks the image, which uploads immediately through the endpoint. The reference is stored on the theme while the mode stays off.
3. The "Use image backdrop" checkbox is enabled only when the theme has a stored reference. The admin turns it on and saves again. The server validation passes because the reference exists.

Turning the mode off never removes the reference. Order inside the endpoint: validate type, signature and size → upload object to `themes/{theme_id}/{uuid}.{ext}` → update the theme's reference. If validation or upload fails, the reference is not changed. If the update fails after upload, the new object is orphaned, which is acceptable under the no-delete rule.

**Client-side fallback by probing the image.** `useSiteTheme` creates an `Image` element for the URL before switching to image mode. On `load`, it sets `data-backdrop-mode="image"` and the texture variable. On `error` (404, network, or undecodable data), it stays in backdrop mode. This is the only reliable way to detect corrupt files, since CSS gives no error signal. The probe runs once per theme activation; the stored flag is never changed by the client.

**CSS for image mode.** A separate rule scoped by `:root[data-backdrop-mode='image']`:
- `body`: `background-color: var(--page-bg)`, `background-image: var(--texture)`, `background-repeat: repeat`, `background-size: auto`, `background-attachment: scroll`.
- `html`: background removed in this mode, so the body background shows across the viewport.
The texture layer uses `scroll` (not `fixed`) because `fixed` in the reference example belonged to the vignette, which is dropped.

**Migration `0009`.** Adds `use_image_backdrop boolean NOT NULL DEFAULT false` and `image_backdrop jsonb NULL`. No row updates are needed because the defaults equal the current behavior.

## Risks / Trade-offs

- **Public images are visible to anyone with the URL** → accepted by the user's choice; theme assets are not sensitive. Mitigation: only administrators can upload.
- **Never-delete rule grows the bucket over time** → accepted by the user's choice; replacements and deleted themes leave objects. Mitigation: low upload volume (admin-only, 5 MB cap); a future cleanup change can be proposed separately.
- **Probe flash:** the backdrop shows briefly before the image appears on first load → acceptable; it is the fallback look.
- **Decoding large images on every page load** → 5 MB cap and public-bucket caching keep this bounded.
- **Orphaned object after a failed reference update** → acceptable under the no-delete rule; the reference remains valid.

## Migration Plan

1. Deploy migration `0009` (defaults keep all existing themes in backdrop mode).
2. Verify that the existing `assets` bucket is public for reads in DEV and PROD, and set `THEME_ASSET_BUCKET` only if a different name is used.
3. Deploy the API and web app together; the new response field is optional for old clients.
4. Rollback: revert the web and API deploy. The columns can stay; unused columns are harmless. Themes with `useImageBackdrop = true` render as backdrop on the old frontend.
