# Attachment Storage

## Purpose

Stores the files of attachment items in a private Supabase Storage bucket, records their metadata in PostgreSQL, and serves them only through authenticated, owner-checked API calls.

## Requirements

### Requirement: Attachment files live in a private owner-scoped bucket

Attachment files SHALL be stored in the single private Supabase Storage bucket `attachments`. Each object path SHALL be `{user_id}/{attachment_id}.{ext}`, where `user_id` is the owning user's application id, `attachment_id` is a random unique id, and `ext` is derived from the validated MIME type rather than from the client file name. The original client file name SHALL NOT appear in the object path. The bucket SHALL NOT be public, and the application SHALL NOT grant `anon` or `authenticated` Storage policies on it; the browser SHALL NOT talk to Storage directly.

#### Scenario: Object path is owner-scoped and name-independent

- **WHEN** a user uploads `Factura 2026 (final).pdf` as a PDF
- **THEN** the object is stored as `{user_id}/{attachment_id}.pdf`
- **AND** the original name does not appear in the object path

#### Scenario: Extension follows the validated type

- **WHEN** a user uploads a PNG image named `photo.jpg`
- **THEN** the object path ends in `.png`

### Requirement: Attachment metadata is recorded in PostgreSQL

Every stored file SHALL have exactly one row in the `attachments` table with its id, owner (`user_id`), linked attachment item (`item_id`), `bucket_id`, `object_path`, `original_filename`, `mime_type`, `size_bytes`, and `created_at`. Each attachment item SHALL have at most one stored file, `object_path` SHALL be unique and SHALL start with the owner's id, and the row SHALL be removed when its item or owner is deleted. The table SHALL have row level security enabled like every other application table.

#### Scenario: Upload records metadata

- **WHEN** a user uploads a 120 KB PDF named `contract.pdf` to an attachment item
- **THEN** one `attachments` row exists for that item
- **AND** it records the owner, bucket, object path, original filename `contract.pdf`, MIME type `application/pdf`, and size 122880 bytes

#### Scenario: One file per attachment item

- **WHEN** a second file is stored for the same attachment item
- **THEN** the item still has exactly one `attachments` row
- **AND** the row describes the newest file

#### Scenario: Metadata follows the item

- **WHEN** an attachment item with a stored file is deleted
- **THEN** its `attachments` row no longer exists

### Requirement: Uploads are validated on the server

The API SHALL accept an upload only when the file is non-empty, does not exceed the maximum size (default 50 MiB), has a declared MIME type in the allowed list, and has file content whose signature matches the declared type. The allowed MIME types SHALL be `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `text/plain`, `text/csv`, `application/zip`, `application/x-7z-compressed`, `application/gzip`, and `application/x-tar`. A rejected upload SHALL NOT create a Storage object or an `attachments` row, and SHALL answer with a friendly error code.

#### Scenario: Valid PDF is accepted

- **WHEN** a user uploads a real PDF declared as `application/pdf`
- **THEN** the upload succeeds

#### Scenario: Unsupported type is rejected

- **WHEN** a user uploads a file declared as `application/x-msdownload`
- **THEN** the upload is rejected with the `UNSUPPORTED_FILE_TYPE` error code
- **AND** nothing is stored

#### Scenario: Declared type must match the content

- **WHEN** a user uploads an executable file declared as `application/pdf`
- **THEN** the upload is rejected with the `UNSUPPORTED_FILE_TYPE` error code
- **AND** nothing is stored

#### Scenario: Oversized file is rejected

- **WHEN** a user uploads a file larger than the maximum size
- **THEN** the upload is rejected with the `FILE_TOO_LARGE` error code
- **AND** nothing is stored

#### Scenario: Empty file is rejected

- **WHEN** a user uploads a zero-byte file
- **THEN** the upload is rejected with a validation error
- **AND** nothing is stored

### Requirement: Uploading replaces the item's file

`PUT /api/items/:id/attachment` SHALL store the uploaded file for the authenticated user's attachment item and return the updated item with `storagePath` set to the new object path. If the item already had a stored file, the previous object SHALL be removed after the new file and its metadata are saved. If the item has no filename, its `filename` SHALL be set to the uploaded file's original name; an existing filename SHALL be kept. If saving the metadata fails after the object was uploaded, the new object SHALL be removed.

#### Scenario: First upload stores the file

- **WHEN** a user uploads `report.pdf` to an attachment item that has no stored file
- **THEN** the response is the updated item with a non-null `storagePath`
- **AND** the item filename is `report.pdf` when it had none

#### Scenario: Replacing removes the previous object

- **WHEN** a user uploads a new file to an attachment item that already has a stored file
- **THEN** the item's `storagePath` points to the new object
- **AND** the previous object no longer exists in Storage

#### Scenario: Only attachment items accept files

- **WHEN** a user uploads a file to an item whose kind is not `attachment`
- **THEN** the request is rejected with a conflict error
- **AND** nothing is stored

### Requirement: Downloads use short-lived signed URLs after an owner check

`GET /api/items/:id/attachment/download` SHALL verify that the authenticated user owns the item and that the item has a stored file, then return a signed URL valid for five minutes together with its lifetime. The signed URL SHALL cause the browser to save the file under its original file name. An item without a stored file SHALL answer not found.

#### Scenario: Owner receives a signed URL

- **WHEN** the owner requests the download of an attachment that has a stored file
- **THEN** the response contains a signed URL and an expiry of 300 seconds

#### Scenario: Download keeps the original name

- **WHEN** the signed URL is opened by the browser
- **THEN** the file is saved under its original file name

#### Scenario: Attachment without a file has no download

- **WHEN** the owner requests the download of an attachment item that has no stored file
- **THEN** the response is a not-found error

### Requirement: Files and metadata are owner-isolated

Upload, download, and removal SHALL be available only to the authenticated owner of the item. A request for another user's item SHALL answer not found, SHALL NOT reveal whether a file exists, and SHALL NOT sign, upload, or delete any object. An unauthenticated request SHALL answer unauthorized.

#### Scenario: Another user cannot download

- **WHEN** a user requests the download of an attachment owned by someone else
- **THEN** the response is a not-found error
- **AND** no signed URL is created

#### Scenario: Another user cannot overwrite or remove

- **WHEN** a user uploads to or removes the file of an attachment owned by someone else
- **THEN** the response is a not-found error
- **AND** the stored file is unchanged

#### Scenario: Unauthenticated access is rejected

- **WHEN** a request without a valid session calls any attachment file endpoint
- **THEN** the response is unauthorized

### Requirement: Removing files and items cleans up storage

`DELETE /api/items/:id/attachment` SHALL delete the stored object and its `attachments` row, return the updated item with `storagePath` set to `null`, and keep the item itself. Deleting an attachment item SHALL also delete its stored object. A failure to delete an object after the database change SHALL be logged and SHALL NOT fail the user's request.

#### Scenario: Remove keeps the item

- **WHEN** the owner removes the file of an attachment item
- **THEN** the object and metadata row are gone
- **AND** the item remains with `storagePath` equal to `null`

#### Scenario: Deleting the item deletes the object

- **WHEN** the owner deletes an attachment item that has a stored file
- **THEN** the item, its metadata row, and its Storage object no longer exist

### Requirement: Storage failures answer actionable errors

The API SHALL translate Storage rejections into its own error codes instead of a generic server error, SHALL log the raw Storage detail server-side, and SHALL NOT return Storage messages, bucket credentials, or object paths to the client. A rejection known to be a type or size problem SHALL answer `415 UNSUPPORTED_FILE_TYPE` or `413 FILE_TOO_LARGE`; an unknown or unreachable Storage failure SHALL answer `503 STORAGE_UNAVAILABLE`; a missing bucket SHALL answer `503 STORAGE_NOT_CONFIGURED`; a metadata row whose object is gone SHALL answer `404 NOT_FOUND`. A rejected upload or replacement SHALL leave the item, its `attachments` row, and its previously stored object unchanged, and that file SHALL remain downloadable and removable.

#### Scenario: The bucket rejects a type the API allowed
- **WHEN** a user uploads a PDF that passes API validation and the bucket's MIME filter rejects it
- **THEN** the response is `415 UNSUPPORTED_FILE_TYPE`
- **AND** the Storage message is logged server-side and not returned
- **AND** a previously stored file, its metadata, and the item are unchanged

#### Scenario: The bucket rejects the size
- **WHEN** the bucket's file size limit is lower than the uploaded file
- **THEN** the response is `413 FILE_TOO_LARGE`

#### Scenario: Storage is unreachable
- **WHEN** Storage cannot be reached or answers an unexpected error
- **THEN** the response is `503 STORAGE_UNAVAILABLE`
- **AND** the item keeps the file it already had

#### Scenario: The stored object is missing
- **WHEN** the `attachments` row exists but its object no longer does
- **THEN** the download answers `404 NOT_FOUND`

### Requirement: Storage is server-side and optional by configuration

The API SHALL reach Storage only with a server-side service role key supplied through environment configuration (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`), which SHALL NOT be sent to the browser, logged, or committed. The bucket name SHALL default to `attachments` and the maximum file size SHALL default to 50 MiB, both overridable by configuration. When the Storage configuration is absent, the upload, download, and removal endpoints SHALL answer service unavailable while all other item operations, including metadata-only attachments, continue to work.

#### Scenario: Missing configuration disables file endpoints only

- **WHEN** the API runs without `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`
- **THEN** the attachment file endpoints answer with the `STORAGE_NOT_CONFIGURED` error code
- **AND** creating, listing, and editing attachment items still works

#### Scenario: The service key never reaches the client

- **WHEN** the web application runs
- **THEN** no response or bundled asset contains the service role key
