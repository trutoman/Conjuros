## ADDED Requirements

### Requirement: Items expose the stored file MIME type

Every collection item representation returned by the API SHALL include a `mimeType` field. For an attachment item with a stored file, it SHALL be the MIME type recorded for that file. For every other item, and for an attachment item without a stored file, it SHALL be `null`. The field SHALL be updated by the same operations that store or remove a file, so a response after an upload reports the uploaded type and a response after a removal reports `null`.

#### Scenario: Stored image reports its MIME type

- **WHEN** an attachment item has a stored PNG file
- **THEN** the item representation returned by the API has `mimeType` equal to `image/png`

#### Scenario: Metadata-only attachment reports no MIME type

- **WHEN** an attachment item has no stored file
- **THEN** its item representation has `mimeType` equal to `null`

#### Scenario: Non-attachment items report no MIME type

- **WHEN** a command, web-link, markdown, or file item is returned
- **THEN** its `mimeType` is `null`

#### Scenario: Upload and removal keep the field current

- **WHEN** a file is uploaded to an attachment item and later removed
- **THEN** the upload response reports the uploaded file's MIME type
- **AND** the removal response reports `mimeType` equal to `null`

### Requirement: Image attachments offer an inline preview URL

`GET /api/items/:id/attachment/preview` SHALL verify that the authenticated user owns the item and that the item has a stored file whose MIME type is an image type, then return a short-lived signed URL together with its lifetime. The signed URL SHALL serve the object with its stored content type and SHALL render it inline in the browser instead of forcing a file download. The response SHALL NOT contain the Storage object path, bucket credentials, or any other Storage detail.

#### Scenario: Owner receives an inline preview URL

- **WHEN** the owner requests the preview of an attachment that stores a `image/jpeg` file
- **THEN** the response contains a signed URL and an expiry of 300 seconds
- **AND** opening the URL in the browser displays the image instead of saving a file

#### Scenario: Non-image files have no inline preview

- **WHEN** the owner requests the preview of an attachment that stores a PDF or another non-image file
- **THEN** the response is a `415 UNSUPPORTED_FILE_TYPE` error
- **AND** no signed URL is created

#### Scenario: Attachment without a file has no preview

- **WHEN** the owner requests the preview of an attachment item that has no stored file
- **THEN** the response is a not-found error

#### Scenario: Another user cannot obtain a preview

- **WHEN** a user requests the preview of an attachment owned by someone else
- **THEN** the response is a not-found error
- **AND** no signed URL is created

#### Scenario: Preview requires the same access rules as download

- **WHEN** the preview endpoint is called without a valid session
- **THEN** the response is unauthorized
- **AND** when Storage is not configured the response is `503 STORAGE_NOT_CONFIGURED`
