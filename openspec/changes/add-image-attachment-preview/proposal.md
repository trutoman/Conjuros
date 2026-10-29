## Why

Image attachments are currently opaque: the viewer only shows metadata and a download action, so users must download a picture to know what it is. Showing a small preview on the card and a full image in the viewer makes image attachments usable at a glance without leaving the collection.

## What Changes

- Expose the stored file's MIME type on the public collection item representation so clients can tell image attachments apart from other files.
- Add an authenticated inline preview URL endpoint for attachment files: a short-lived signed URL that renders in the browser instead of forcing a download.
- Render image attachments inside the existing floating attachment viewer: the picture fills a frame styled like the other viewer panes, scaled to fit the available screen area without ever overflowing it, preserving its aspect ratio.
- Keep the viewer dismissible by clicking the backdrop, pressing Escape, or the close control.
- Show a thumbnail preview on attachment cards for stored image files before the user opens the viewer, capped at 100 px on its longest edge.
- Keep non-image attachments and attachments without a stored file unchanged.
- Extend the shared contracts, API, storage seam, and tests to cover the new field and endpoint.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-storage`: expose the stored file MIME type on items and add an owner-checked inline preview URL that does not force a download.
- `attachment-item-viewer`: image attachments render a viewport-fitted image preview inside the floating viewer.
- `item-card-experience`: attachment cards show a thumbnail preview (max 100 px on the longest edge) for stored image files.

## Impact

- `packages/contracts`: `collectionItemSchema` gains `mimeType`; new preview response contract.
- `src/api`: item queries surface the attachment MIME type, the attachments service and storage seam gain inline signing, and a new preview route/controller handler is added.
- `src/web`: `ItemCard`, `ItemCardViewer`, a shared preview-URL helper, and `index.css` gain thumbnail and image-frame behavior.
- No database migration: `attachments.mime_type` already exists.
- Tests in `src/tests` and `src/web/**/__tests__` cover the new API and UI behavior.
- No change to upload validation, allowed file types, download behavior, or ownership rules.
