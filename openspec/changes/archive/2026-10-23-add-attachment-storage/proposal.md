## Why

Attachment items exist (title, description, filename, reserved `storagePath`) but cannot hold a file yet: the drop area only records a name and the viewer reports “No file stored yet”. The private `attachments` bucket is now provisioned in Supabase, so this change wires real file storage end to end: upload, metadata in PostgreSQL, authenticated download, replacement, and cleanup.

## What Changes

- Add an `attachments` metadata table (id, owner, item, bucket, object path, original filename, MIME type, size, created at) with row level security enabled, one row per stored file and a unique link to its attachment item.
- Store files in the single private Supabase Storage bucket `attachments` under `{user_id}/{attachment_id}.{ext}`. The extension comes from the validated MIME type, never from the client file name, and the original name is kept only in PostgreSQL.
- Add API endpoints to upload or replace (`PUT /api/items/:id/attachment`), download through a short-lived signed URL (`GET /api/items/:id/attachment/download`), and remove (`DELETE /api/items/:id/attachment`) the file of an attachment item. Every call is authenticated and owner-checked by the API.
- Validate every upload on the server: the 17 allowed MIME types (mirrored from the bucket filter), a maximum file size (default 50 MiB), and the real file signature against the declared type.
- Populate the existing `storagePath` read field from the stored file; deleting an item or removing/replacing its file also removes the storage object.
- Keep the browser away from Storage: the app does not use Supabase Auth, so the API talks to Storage with a server-side service role key (new optional `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`) and no `storage.objects` policies are granted to `anon`/`authenticated`. When these variables are missing, the file endpoints answer `503` and metadata-only attachments keep working.
- Change the attachment drop area to stage the selected file and upload it when the form is saved (add and edit), with client-side size/type pre-checks, an uploading state, upload errors, and a “Remove file” option when editing.
- Add a “Download attachment” action to the attachment card and viewer when a file is stored; the viewer shows the stored state instead of “No file stored yet”.
- Add the `multer` and `@supabase/supabase-js` dependencies, raise the Nginx upload limit for `/api/`, and update docs and environment examples.

## Capabilities

### New Capabilities

- `attachment-storage`: private Supabase Storage bucket usage, the `attachments` metadata table, upload/replace/download/remove endpoints, server-side file validation, ownership and secret-handling rules, and storage cleanup.

### Modified Capabilities

- `collection-management`: attachment items now reference a stored file (`storagePath` populated server-side, item type change blocked while a file is stored) and the attachment drop zone uploads on save in the add and edit forms.
- `item-card-experience`: attachment cards offer a “Download attachment” action when a file is stored.
- `attachment-item-viewer`: the viewer shows the stored-file state and offers a download action instead of the permanent “No file stored yet” status.

## Impact

- `src/api/db/schema.ts` and `drizzle/`: new `attachments` table, indexes, check constraints, RLS; one new migration and snapshot.
- `src/api/storage/` (new): storage seam with Supabase and in-memory implementations, plus file signature detection.
- `src/api/repositories/attachments.repository.ts`, `services/attachments.service.ts`, controller and route (new); `items.service.ts` (cleanup on delete and kind change); `app.ts`, `server.ts`, `config/environment.ts`.
- `packages/contracts/src/attachments.ts` (new): allowed MIME types, size limit, download response schema.
- `src/web/`: `DropZone`, `AttachmentDropZone`, `ItemForm`, `CollectionPage`, `ItemCard`, `ItemCardViewer`, `services/items.ts`, `hooks/useCollection.ts`.
- `nginx.conf.template`, `docker-compose.yml`, `.env.example`, `README.md`, `AGENTS.md`.
- Tests: contracts, storage seam, repositories (PGlite), API endpoints, migration, and frontend.
- **Prerequisite:** the `add-attachment-item-type` change must be archived first because this change modifies requirements it introduces.
- **Non-goals:** no per-user storage quota, antivirus scanning, image resizing/thumbnails, direct browser-to-Storage uploads, multiple files per item, or Supabase Auth adoption.
