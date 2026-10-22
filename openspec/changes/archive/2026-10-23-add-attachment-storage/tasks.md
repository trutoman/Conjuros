## 1. Contracts and Configuration

- [x] 1.1 Add `packages/contracts/src/attachments.ts` with `attachmentMimeTypes` (the 17 allowed types), `attachmentMaxBytes` (52 428 800), the MIME→extension map, and `attachmentDownloadSchema`; export it from the contracts index
- [x] 1.2 Extend `parseApiEnvironment` with optional `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ATTACHMENT_BUCKET` (default `attachments`), and `ATTACHMENT_MAX_BYTES`; fail on a half-configured Storage pair
- [x] 1.3 Add `multer`, `@types/multer`, and `@supabase/supabase-js` dependencies

## 2. Database

- [x] 2.1 Add the `attachments` table to `src/api/db/schema.ts` (columns, unique `item_id` and `object_path`, `user_id` index, size and path checks, `.enableRLS()`)
- [x] 2.2 Generate the Drizzle migration and snapshot; verify `npm run db:generate` reports no further changes
- [x] 2.3 Update the RLS test to include the `attachments` table
- [x] 2.4 Add a PGlite test for the table: one row per item, unique object path, path-must-start-with-owner check, positive size, and cascade on item and user delete

## 3. Storage Seam and File Validation

- [x] 3.1 Add the `AttachmentStorage` interface with `SupabaseAttachmentStorage` (service role client, `upsert: false`, signed URL with `download` name, remove) and `InMemoryAttachmentStorage`
- [x] 3.2 Add `src/api/storage/fileSignature.ts` detecting JPEG, PNG, GIF, WebP, PDF, OLE, ZIP, 7z, gzip, tar, and UTF-8 text, plus the MIME→accepted-family table
- [x] 3.3 Unit-test signature detection and MIME mismatch (valid files, spoofed PDF, empty file, binary declared as text)

## 4. API

- [x] 4.1 Add `AttachmentsRepository` (Postgres and in-memory): find by item, replace for item (delete old row, insert new, set `collection_items.storage_path` and empty `filename`, one transaction), delete for item
- [x] 4.2 Add `AttachmentsService` with store, download URL, and remove, including ownership/kind checks, validation, compensation on failure, and best-effort cleanup logging
- [x] 4.3 Add the controller and routes `PUT`, `GET .../download`, and `DELETE` under `/api/items/:id/attachment` behind `requireAuth`, with `multer` memory storage and size-limit mapping to `FILE_TOO_LARGE`
- [x] 4.4 Wire storage, repository, and service in `createApp` and `server.ts`; return `503 STORAGE_NOT_CONFIGURED` from the file endpoints when Storage is not configured
- [x] 4.5 Update `ItemsService.delete` to remove the stored object and `ItemsService.update` to reject changing the kind of an item with a stored file with a conflict error
- [x] 4.6 Add API tests: upload/replace/download/remove, owner isolation (404 for others, 401 unauthenticated), unsupported type, spoofed type, oversize, empty file, non-attachment item, kind-change conflict, item delete cleanup, and the 503 path without configuration
- [x] 4.7 Map Storage rejections onto `AppError` in the storage seam (`415` unsupported type, `413` too large, `503` unconfigured/unavailable, `404` missing object), log the raw detail, and test both the mapping and that a rejected replacement keeps the previous object and row

## 5. Frontend

- [x] 5.1 Change `DropZone` attachment mode to report the `File`, refuse unsupported types and oversized files with friendly messages, and keep leaving the body unread
- [x] 5.2 Update `AttachmentDropZone` to `onFileSelected(file)` and `ItemForm` to stage the file, render the zone in add and edit, show `Remove file` when a file is stored, and pass `{ attachmentFile, removeStoredFile }` to `onSubmit`
- [x] 5.3 Add `uploadAttachment`, `removeAttachment`, and `getAttachmentDownload` to `services/items.ts` and expose them from `useCollection`
- [x] 5.4 Update `CollectionPage.save` to save the item first and then upload or remove the file, keeping the form open with the error when the upload fails
- [x] 5.5 Add the `Download attachment` action to `ItemCard` and `ItemCardViewer` when `storagePath` is set, and switch the viewer status between `File stored` and `No file stored yet`
- [x] 5.6 Add frontend tests for staging, refusals, upload-on-save, upload failure, remove file, card/viewer download visibility, and the download call

## 6. Operations and Documentation

- [x] 6.1 Set `client_max_body_size 60m` in the `/api/` location of `nginx.conf.template`
- [x] 6.2 Pass the new variables through `docker-compose.yml` and document them (placeholders only) in `.env.example`
- [x] 6.3 Update `README.md` and `AGENTS.md` with the Storage setup, the service key warning, the bucket limit and MIME filter matching the app constants, and the new endpoints

## 7. Verification

- [x] 7.1 Run `npm run check` and resolve lint, test, and build failures
- [x] 7.2 Verify `docker compose up --build` starts with and without Storage credentials
- [ ] 7.3 Smoke test against the real bucket: upload a PDF, download through the signed URL, replace it, remove it, delete the item, and confirm the bucket is empty
