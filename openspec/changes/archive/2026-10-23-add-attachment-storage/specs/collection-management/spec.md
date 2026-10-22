## MODIFIED Requirements

### Requirement: Attachment items store a file reference

Users SHALL be able to create and edit items of kind `attachment`. An attachment item SHALL carry a `title`, optional `description`, tags, related items, and an optional `filename` naming the attached file. It SHALL expose a nullable `storagePath` read field that is `null` while the item has no stored file and holds the Storage object path of the file once one is stored through the attachment storage endpoints; the API SHALL reject a client-provided storage path in item create and update requests. An attachment item SHALL return `command`, `url`, and `content` as `null`; content SHALL remain hidden and disabled until a later change enables it. An attachment item MAY exist without a stored file. An attachment item that has a stored file SHALL NOT change to another kind until its file is removed; such an update SHALL be rejected with a conflict error.

#### Scenario: Create an attachment with metadata

- **WHEN** a user submits a new item with kind `attachment`, a title, a description, and the filename `"report.pdf"`
- **THEN** the item is stored with kind `attachment`
- **AND** the response includes the title, description, and filename
- **AND** the response returns `storagePath`, `command`, `url`, and `content` as `null`

#### Scenario: Create an attachment without a file

- **WHEN** a user submits a new item with kind `attachment` and a title but no filename
- **THEN** the item is stored with kind `attachment`
- **AND** the response returns `filename` as `null`

#### Scenario: Edit an attachment filename

- **WHEN** a user edits an attachment and changes its `filename` from `"draft.pdf"` to `"final.pdf"`
- **THEN** the stored `filename` becomes `"final.pdf"`
- **AND** the item remains of kind `attachment`

#### Scenario: Reject a client-provided storage path

- **WHEN** a client submits an attachment with a `storagePath` value
- **THEN** the request is rejected with a validation error
- **AND** no storage reference is stored

#### Scenario: Reject text fields on an attachment

- **WHEN** a client submits an attachment carrying `command`, `url`, or `content`
- **THEN** the request is rejected with a validation error
- **AND** the item is not stored or changed

#### Scenario: A stored file populates the storage path

- **WHEN** a file is stored for an attachment item
- **THEN** the item's `storagePath` is the non-null object path of that file
- **AND** an item list or read returns the same `storagePath`

#### Scenario: Changing the kind of an item with a stored file is rejected

- **WHEN** a user changes an attachment item that has a stored file to another kind
- **THEN** the update is rejected with a conflict error
- **AND** the item and its stored file are unchanged

### Requirement: Add item form offers an attachment drop zone

When the item form has kind `attachment`, it SHALL render an attachment drop zone beside the tag selector, in both the Add and Edit forms, using the same visual surface and interaction model as the file drop zone. The zone SHALL accept a single file dragged from the operating system or chosen through the native picker, SHALL set the form's `filename` field to the file's full name including its extension, and SHALL keep the selected file staged without reading its body. A file whose type is not allowed or whose size exceeds the maximum SHALL be refused by the zone with a friendly message and SHALL NOT replace the staged file. When the form is saved, the item SHALL be saved first and the staged file SHALL then be uploaded to that item; if the upload fails, the item SHALL remain saved and the form SHALL show the upload error. When editing an attachment that has a stored file, the form SHALL offer a `Remove file` option that, once saved, removes the stored file. The zone SHALL NOT render for any other item kind. Dropping more than one file SHALL show the shared single-file error and leave the staged file unchanged.

#### Scenario: Attachment drop zone appears in add and edit

- **WHEN** a user opens the Add item form and selects `Attachment`, or opens an existing attachment for editing
- **THEN** an attachment drop zone renders beside the tag selector
- **AND** the zone uses the same visual surface as the file drop zone

#### Scenario: Attachment drop zone is hidden for other kinds

- **WHEN** a user selects `Command`, `Web link`, `Markdown`, or `File`
- **THEN** no attachment drop zone is rendered

#### Scenario: Dropping a file stages it and fills the filename

- **WHEN** a user drops a file named `report.pdf` on the attachment drop zone
- **THEN** the Filename field contains `report.pdf`
- **AND** the file body is not read in the browser
- **AND** the Content field remains absent

#### Scenario: Saving uploads the staged file

- **WHEN** a user saves an attachment form that has a staged file
- **THEN** the item is saved and the staged file is uploaded to it
- **AND** the saved attachment shows a stored file

#### Scenario: Attachment can be saved without a file

- **WHEN** a user saves an attachment with a title but no staged file
- **THEN** the item is saved with no upload
- **AND** no storage reference is created

#### Scenario: Unsupported or oversized files are refused

- **WHEN** a user drops a file whose type is not allowed or whose size exceeds the maximum
- **THEN** the zone shows a friendly message naming the problem
- **AND** the previously staged file and filename are unchanged

#### Scenario: Upload failure keeps the saved item

- **WHEN** the item is saved but the upload of the staged file fails
- **THEN** the item remains saved
- **AND** the form shows the upload error so the user can retry

#### Scenario: Removing the stored file

- **WHEN** a user edits an attachment with a stored file, chooses `Remove file`, and saves
- **THEN** the stored file is removed
- **AND** the item remains with no stored file

#### Scenario: Multiple files are rejected by the attachment drop zone

- **WHEN** a user drops more than one file on the attachment drop zone
- **THEN** the zone shows the shared single-file message
- **AND** the staged file and Filename field keep their previous values
