## Context

The app does not use Supabase Auth: users live in the application `users` table, sessions are a JWT cookie checked by `requireAuth`, and the API reaches PostgreSQL through a direct connection (RLS is enabled on every table with no policies, so only the API role can read or write). Attachment items already exist with `filename` and a reserved `storagePath` (always `null`). The private bucket `attachments` and its MIME filter are already configured in Supabase. See `proposal.md` for motivation.

Consequence: the commonly suggested `storage.objects` policies based on `auth.uid()` cannot authorize anything here, because the browser has no Supabase identity. Authorization has to live in the API.

## Goals / Non-Goals

**Goals:**
- Real upload, replace, download, and removal of an attachment item's file, with metadata in PostgreSQL.
- Ownership enforced by the API on every file operation; no direct browser access to Storage.
- Server-side validation of size, MIME type, and file signature.
- Keep metadata-only attachments and local development working without Storage credentials.

**Non-Goals:**
- Per-user quotas, antivirus, thumbnails, multiple files per item, resumable or direct-to-Storage uploads, Supabase Auth.

## Decisions

### D1 — The API is the only Storage client (service role key)

A `AttachmentStorage` seam (like `EmailSender`) exposes `upload(path, bytes, contentType)`, `createSignedUrl(path, ttl, downloadName)`, and `remove(paths)`. `SupabaseAttachmentStorage` implements it with `@supabase/supabase-js` created from `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (`auth: { persistSession: false }`); `InMemoryAttachmentStorage` serves tests. The bucket stays private and no policies are added for `anon`/`authenticated`, so the default is deny for everything except the service role, which bypasses RLS by design.

When the two variables are absent, `createApp` receives no storage and the file endpoints throw `AppError(503, 'STORAGE_NOT_CONFIGURED', …)`. Both variables are optional in `parseApiEnvironment`, with `ATTACHMENT_BUCKET` (default `attachments`) and `ATTACHMENT_MAX_BYTES` (default `52428800`). The service key is read once at startup, never logged, and never exposed to the web build.

Rationale: matches how the app authenticates today and gives one auditable authorization point. Alternatives rejected: adopting Supabase Auth only for Storage (two identity systems), per-user RLS policies (cannot work without `auth.uid()`), and a public bucket with unguessable paths (any leaked URL is permanent).

### D2 — `attachments` table, one row per attachment item

```
attachments(
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  item_id text not null unique references collection_items(id) on delete cascade,
  bucket_id text not null,
  object_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null,
  check (object_path like user_id || '/%')
)
```

with an index on `user_id`, RLS enabled (`.enableRLS()`), and a `rls.test.ts` update. A relation to the specific table (`item_id`) is used instead of `entity_type`/`entity_id` because the only owner of files is `collection_items`. `bigint` is mapped with `{ mode: 'number' }` (files are capped far below 2^53).

`collection_items.storage_path` stays as the denormalized pointer the read model already exposes. It is written only by the attachments repository, in the same transaction as the `attachments` row, so the two cannot diverge. The existing check already requires `storage_path IS NULL` for non-attachment kinds.

Rationale: a unique `item_id` encodes “one file per item”, cascades handle cleanup, and the path check makes it impossible to record another user's folder. Alternative rejected: dropping `storage_path` from items (would change a shipped read field and require a join on every list).

### D3 — Upload goes through the API with `multer` memory storage

`PUT /api/items/:id/attachment` is multipart (`file` field) parsed with `multer.memoryStorage()` and `limits.fileSize = maxBytes`; oversize maps to `AppError(413, 'FILE_TOO_LARGE')`. The route sits behind `requireAuth`. Flow in `AttachmentsService.store(ownerId, itemId, file)`:

1. Load the owned item (404 otherwise) and require kind `attachment` (409 otherwise).
2. Validate: non-empty, MIME in the allowlist, signature matches the declared type (D4); else `AppError(415, 'UNSUPPORTED_FILE_TYPE')`.
3. Build `object_path = {ownerId}/{randomUUID()}.{ext}`, extension taken from a MIME→extension map.
4. Upload to Storage (`upsert: false`).
5. Repository transaction: delete the item's previous row (returning its path), insert the new row, set `collection_items.storage_path`, and set `filename` to the original name only when it was empty.
6. Best-effort removal of the previous object; on step 5 failure, remove the new object (compensation) and rethrow.

Buffering up to 50 MiB per request is acceptable at this scale and keeps validation simple (we need the first bytes anyway). Alternatives rejected: signed direct-to-Storage upload (validation and ownership would happen after the fact), streaming with busboy (more code for no gain under a 50 MiB cap).

### D3b — Removal, item deletion, and kind changes

- `DELETE /api/items/:id/attachment`: delete the row and clear `storage_path` in a transaction, then remove the object (best effort, logged on failure), and return the item.
- `ItemsService.delete`: read the attachment row first, delete the item (cascade removes the row), then remove the object best effort.
- `ItemsService.update`: when the current item has `storagePath` and the requested kind differs from `attachment`, throw `AppError(409, 'CONFLICT', 'Remove the attached file before changing the item type')`, avoiding a check-constraint violation.
- A failed best-effort removal leaves an orphan object; accepted and logged (see Risks).

### D3c — Storage failures become API errors

Supabase's error messages and status codes never reach the client. `SupabaseAttachmentStorage` logs the detail server-side (object path, content type, Storage message) and throws the `AppError` returned by `toStorageError` in `src/api/storage/storageErrors.ts`:

| Storage message | API response |
| --- | --- |
| `mime type … is not supported` | `415 UNSUPPORTED_FILE_TYPE` |
| `… maximum allowed size`, `Payload too large` | `413 FILE_TOO_LARGE` |
| `Bucket not found` | `503 STORAGE_NOT_CONFIGURED` |
| `Object not found` | `404 NOT_FOUND` |
| anything else | `503 STORAGE_UNAVAILABLE` |

Rationale: the bucket's MIME filter is configured outside this repository, so it can disagree with `attachmentMimeTypes`. A typo there (`aplication/pdf`) rejected every PDF while images passed (`image/*`), and the user only saw `500 An unexpected error occurred`. Since the object upload happens before the metadata transaction (D3 step 4), a rejection leaves the item, its previous `attachments` row, and its previous object untouched; tests replace a stored file while Storage rejects or is down to keep that guarantee from regressing.

### D4 — Signature detection without a new dependency

`src/api/storage/fileSignature.ts` reads the leading bytes and returns a family: JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), GIF (`GIF87a`/`GIF89a`), WebP (`RIFF`…`WEBP`), PDF (`%PDF-`), OLE (`D0 CF 11 E0 A1 B1 1A E1`, for doc/xls/ppt), ZIP (`PK\x03\x04`, for zip and OOXML), 7z (`37 7A BC AF 27 1C`), gzip (`1F 8B`), tar (`ustar` at offset 257), and `text` (valid UTF-8 with no NUL bytes within the first 8 KiB, for `text/plain`/`text/csv`). A shared table maps each allowed MIME type to its accepted families (OOXML types accept ZIP, legacy Office types accept OLE). The declared type is `file.mimetype` from the multipart part.

Rationale: 17 fixed types and a stable set of magic numbers make a ~60-line table safer than a dependency. This is a first filter, not malware detection; ZIP/7z/gzip/tar contents are not inspected (see Risks).

### D5 — Download returns a signed URL as JSON

`GET /api/items/:id/attachment/download` loads the owned item and its attachment row (404 when none), asks Storage for a 300-second signed URL with `download: original_filename`, and returns `{ url, expiresInSeconds: 300 }`. JSON (not a redirect) lets the cookie-authenticated frontend `fetch` the endpoint and then navigate to the Storage URL, which carries its own token.

### D6 — Shared contracts

`packages/contracts/src/attachments.ts` exports `attachmentMimeTypes` (the 17 types, `as const`), `attachmentMaxBytes` (52 428 800), a MIME→extension map, and `attachmentDownloadSchema`. The server uses them for validation and the web uses them for the picker `accept` hint and pre-checks, so the lists cannot drift. The API remains authoritative; `ATTACHMENT_MAX_BYTES` can lower or raise the server limit independently of the web pre-check.

### D7 — Frontend: stage, save, then upload

- `DropZone` in attachment mode reports the `File` (not just its name) and rejects unsupported types or oversized files with friendly messages before staging; it still never reads the body.
- `AttachmentDropZone` exposes `onFileSelected(file)`. `ItemForm` keeps `attachmentFile` and a `removeStoredFile` flag, shows the drop zone in add and edit for attachments, and shows `Remove file` when `item.storagePath` exists. `onSubmit(input, extras)` passes `{ attachmentFile, removeStoredFile }`.
- `CollectionPage.save` saves the item, then calls `uploadAttachment(item.id, file)` or `removeAttachment(item.id)`; an upload error keeps the modal open and shows the message, with the item already saved.
- `services/items.ts` gains `uploadAttachment` (`FormData`, no JSON content type), `removeAttachment`, and `getAttachmentDownload`; `useCollection` invalidates the list after each.
- `ItemCard` and `ItemCardViewer` show `Download attachment` (download icon) when `storagePath` is non-null; the viewer status switches between `File stored` and `No file stored yet`.

### D8 — Operational wiring

- `nginx.conf.template`: `client_max_body_size 60m;` inside `location /api/` (the default 1 MB would break every real upload with a 413 from Nginx).
- `docker-compose.yml` and `.env.example`: pass `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ATTACHMENT_BUCKET`, `ATTACHMENT_MAX_BYTES` (all optional, no real values).
- Docs state that the bucket's own file-size limit and MIME filter must be configured to match the application constants (the bucket limit is the backstop, not the only check).

## Risks / Trade-offs

- **Service role key is highly privileged** → read only on the server, optional, never logged or sent to the client, documented as a secret; the API is the sole caller and always owner-checks first.
- **Orphan objects when a best-effort delete fails** (or a user is deleted by cascade) → logged; accepted for now; a reconciliation job can compare `attachments` with the bucket later.
- **Declared MIME can be spoofed within a family** (for example an `.exe` inside a ZIP) → signature check blocks type confusion, but archives are not inspected; no antivirus in this phase; downloads use `download` disposition so files are never rendered inline from the app origin.
- **Memory use** from 50 MiB in-memory uploads under concurrency → low expected concurrency; the cap is configurable and multer rejects oversize early.
- **Upload after save is not atomic** (item saved, upload fails) → intentional: the item stays editable and the form shows a retry path; the API replace is idempotent.
- **Free plan limits** (1 GB total, 50 MB per file) → the default cap equals the Free per-file ceiling; no per-user quota yet, so one user could consume the project quota.
- **Two writers of `storage_path`** → only the attachments repository writes it, inside the same transaction as the row.
- **New dependencies** (`multer`, `@supabase/supabase-js`) → both are widely used and narrowly scoped (multipart parsing and the Storage client).

## Migration Plan

1. One Drizzle migration creates `attachments`, its indexes and checks, and enables RLS (no data backfill: no attachment has a file yet).
2. Deploy code and migration together; the API runs migrations at startup. Storage endpoints stay `503` until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured, so the deploy is safe before secrets are set.
3. Configure the secrets in the environment (never in the repo) and confirm the bucket's size limit and MIME filter in Supabase.
4. Smoke test: create an attachment, upload a PDF, download through the signed URL, replace, remove, delete the item, and confirm the bucket is empty.
5. Rollback: revert the code; `attachments` rows and objects are harmless to older code. To fully undo, drop the table and delete the bucket contents manually.

## Open Questions

None.
