## Context

See `proposal.md` for motivation and `specs/` for the behavior contract. The current attachment storage already records `mime_type` in the `attachments` table, uploads use that value as the Storage content type, and downloads are served only through short-lived signed URLs created by the API. The public collection item does not expose the MIME type, and the only signing method always asks Storage for an attachment-disposition download.

The item viewer is a `Modal` that already closes on backdrop click and Escape. Cards are single-row articles with an inline content box; the attachment viewer is opened from the card eye action and currently renders metadata only.

## Goals / Non-Goals

**Goals:**

- Make the stored file type observable on items so the client can decide between an image preview and the metadata view.
- Add inline signing without weakening owner checks, the private bucket, or the existing download behavior.
- Show the image at the largest size the screen allows for image attachments while keeping the existing viewer chrome.
- Reuse one preview URL between the card thumbnail and the viewer to avoid duplicate signing calls.
- Keep every existing attachment behavior for non-image and empty attachments unchanged.

**Non-Goals:**

- Generating server-side resized thumbnails or storing derivative images.
- Previewing inline content for non-image types (PDF, Office, archives, text).
- Changing upload validation, allowed MIME types, file size limits, or download disposition.
- Introducing a database migration or a new storage bucket.

## Decisions

### 1. Surface `mimeType` on the item through a join, not a duplicated column

`StoredCollectionItem` gains `mimeType: string | null`, and `collectionItemSchema` in `packages/contracts` gains the same nullable field. The Postgres repository reads it with a `LEFT JOIN` from `collection_items` to `attachments` on item id and owner id; `toStoredItem` accepts the joined value. Write paths keep the source of truth in `attachments`:

- create returns `mimeType: null`;
- `PostgresAttachmentsRepository.replaceForItem` returns the updated item with the attachment's MIME type;
- `deleteForItem` returns it with `null`;
- `PostgresItemsRepository.replace` returns the in-memory argument unchanged, so an edit keeps the value read with the item.

The in-memory repositories mirror this by storing `mimeType` on `StoredCollectionItem` and setting or clearing it in `InMemoryAttachmentsRepository`.

Alternatives considered:

- **Duplicate `mime_type` on `collection_items`:** simpler reads, but requires a migration, creates two sources of truth, and can drift from the `attachments` row.
- **Load attachments per item in the service:** keeps the items table untouched but adds an N+1 lookup to every list and get call.
- **Derive image-ness from the filename extension on the client:** cheap, but user-editable filenames are not reliable and the Storage path extension is an internal detail.

### 2. Sign inline previews through the existing storage seam

`AttachmentStorage.createSignedUrl` becomes `createSignedUrl(path, expiresInSeconds, downloadName?)`. When `downloadName` is omitted, the Supabase implementation omits the `download` option so the signed URL serves the object inline with its stored content type. The in-memory implementation mirrors this by omitting the `download` query parameter.

`AttachmentsService` gains `previewUrl(ownerId, itemId)`: it asserts Storage is configured, loads the attachment after the owner check, rejects non-image MIME types with `415 UNSUPPORTED_FILE_TYPE`, and returns `{ url, expiresInSeconds }` using the same five-minute lifetime as downloads. The controller exposes `GET /api/items/:id/attachment/preview`; the route uses the same auth middleware and `ensureConfigured` guard as the download route. A new `attachmentPreviewSchema` mirrors the download response shape so the client parses a distinct contract.

Alternatives considered:

- **Reuse the download endpoint with an `inline` flag:** fewer routes, but overloads a download contract and makes caching and error handling ambiguous.
- **Stream the object through the API:** avoids exposing signed URLs but requires a new Storage read path, streaming, and memory handling for 50 MiB files.
- **Preview every allowed type inline:** browsers render PDFs inconsistently and the requirement targets image attachments only; rejecting non-images keeps the contract explicit.

### 3. Expand the modal for images only

`Modal` gains a third `size` value, `full`, rendered as `modal-panel-full` with `width: min(calc(100vw - 2rem), 100%)`. `CollectionPage` uses `size="full"` only when the viewer item is an attachment with a stored image MIME type; every other viewer keeps `wide`. This gives the image the largest on-screen area without changing the look of other viewers.

### 4. Viewer image frame and sizing

`ItemCardViewer` detects an image attachment from `item.mimeType?.startsWith('image/')` and a non-null `storagePath`. On open it requests the preview URL through a shared helper and renders a `<figure className="attachment-image-frame">` with an `<img>` whose accessible name references the item title or filename. The frame reuses the pane surface (`border`, `background`, `border-radius`, padding) already used by viewer content, and the image uses `width: auto; height: auto; max-width: 100%; max-height: calc(100dvh - 16rem); object-fit: contain` so it fits both axes, preserves aspect ratio, is never cropped, and cannot push the page horizontally. The panel keeps the header, filename, status, download, and edit actions. Loading and failure states render text in place of the image; a failure keeps the metadata and download usable.

### 5. Card thumbnail, capped at 100 px

`ItemCard` renders the thumbnail only for image attachments with a stored file. The image sits below the header row, above the optional description, with `max-width: 100px; max-height: 100px; width: auto; height: auto; object-fit: contain`. It is not a link and does not replace the eye action. The effect catches failures and renders nothing, so a card never breaks on a denied preview; an `onError` handler also hides an image whose signed URL has gone stale.

### 6. Share and cache preview URLs on the client

A new `src/web/lib/attachmentPreview.ts` exports `isImageAttachment(item)` and `getAttachmentPreviewUrl(item)`. The helper keeps an in-memory map keyed by item id plus `storagePath`, stores the URL with its expiry (response lifetime minus a 30-second safety margin), and deduplicates in-flight requests. Cards and the viewer share it, so opening a viewer right after the card thumbnail renders reuses the signed URL instead of signing twice. When the entry is expired or the item's file path changed, it requests a fresh URL.

## Risks / Trade-offs

- **One preview request per image attachment on a page (up to 50)** → Requests are lazy per card, deduplicated, and cached for their lifetime; a future optimization can gate them with an intersection observer without changing the contract.
- **Signed URLs expire while a page stays open** → The cache stores the expiry and re-signs before reusing an expired URL; already rendered images remain valid until their own URL expires.
- **Storage object missing or preview signing fails** → The card hides the thumbnail and the viewer shows an error while keeping download and metadata available.
- **Join changes touch several item queries** → A single mapping helper and repository tests against both in-memory and PGlite-backed repositories keep list, get, reorder, and attachment write paths consistent.
- **Full-screen image panel on small screens** → The panel keeps the `100vw - 2rem` inset and the existing backdrop padding, and the image height accounts for header and actions, so nothing leaves the viewport.

## Migration Plan

No database migration. Ship the API and web together: the web relies on `mimeType` and the preview endpoint. Rolling back means reverting the code; stored files, attachment rows, and item data are unaffected because the change only reads existing metadata and signs URLs.

## Open Questions

None.
