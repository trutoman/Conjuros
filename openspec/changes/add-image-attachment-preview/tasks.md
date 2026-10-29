## 1. Contracts and stored types

- [x] 1.1 Add a nullable `mimeType` field to `collectionItemSchema` in `packages/contracts/src/items.ts`.
- [x] 1.2 Add an `attachmentPreviewSchema` (`url`, `expiresInSeconds`) in `packages/contracts/src/attachments.ts` and export it.
- [x] 1.3 Add `mimeType` to `StoredCollectionItem` and initialize it to `null` in the in-memory and Postgres item creation paths.

## 2. API MIME exposure

- [x] 2.1 Read `mimeType` through a left join to `attachments` in the Postgres item list, find, tag, and reorder queries, mapping it through `toStoredItem`.
- [x] 2.2 Set `mimeType` to the stored attachment type in `PostgresAttachmentsRepository.replaceForItem` and `InMemoryAttachmentsRepository.replaceForItem`, and clear it in both `deleteForItem` implementations.
- [x] 2.3 Ensure item edits preserve the current `mimeType` and public responses include it for list, get, create, update, upload, and removal.
- [x] 2.4 Add repository and API tests covering image MIME exposure, null without a file, null for non-attachment kinds, and upload/removal updates.

## 3. Inline preview endpoint

- [x] 3.1 Make the storage seam's `createSignedUrl` download name optional and omit the download disposition when absent in both Supabase and in-memory implementations.
- [x] 3.2 Add `AttachmentsService.previewUrl` that checks ownership, requires a stored file with an image MIME type (`415` otherwise), and returns a signed URL with the standard five-minute lifetime.
- [x] 3.3 Add the `GET /api/items/:id/attachment/preview` controller handler and route behind authentication and the storage-configured guard.
- [x] 3.4 Add API tests for the inline signed URL, the non-image `415`, missing file `404`, cross-user `404`, unauthenticated `401`, and unconfigured storage `503`.

## 4. Client preview helper

- [x] 4.1 Create `src/web/lib/attachmentPreview.ts` with `isImageAttachment` and `getAttachmentPreviewUrl`, caching by item id plus `storagePath`, honoring the URL expiry with a safety margin, and deduplicating in-flight requests.
- [x] 4.2 Add unit tests for image detection, cache reuse, expiry re-signing, and in-flight deduplication.

## 5. Attachment card thumbnail

- [x] 5.1 Render a thumbnail only for stored image attachments in `ItemCard`, placed below the header row and above the description, with an accessible name and a silent failure fallback.
- [x] 5.2 Add card styles capping the thumbnail at 100 px on its longest edge with `object-fit: contain`, preserving aspect ratio and card readability.
- [x] 5.3 Add card tests for image thumbnails, no thumbnail for non-images or empty attachments, and a failed preview leaving the card usable.

## 6. Attachment viewer image preview

- [x] 6.1 Extend `Modal` with a `full` size and use it from `CollectionPage` only when the viewer item is a stored image attachment.
- [x] 6.2 Fetch the preview URL in `ItemCardViewer` for image attachments and render the image inside a frame styled like the other viewer panes, with loading and error states while keeping download and edit usable.
- [x] 6.3 Add styles that bound the image by viewport width and height, preserve aspect ratio without cropping, and prevent horizontal overflow.
- [x] 6.4 Add viewer tests for image rendering, loading and failure states, non-image behavior, backdrop dismissal, and Escape dismissal.

## 7. Validation

- [x] 7.1 Run `npm run check` and fix any lint, test, or build failures.
- [x] 7.2 Run `openspec validate add-image-attachment-preview` and confirm the change artifacts stay consistent with the implementation.
