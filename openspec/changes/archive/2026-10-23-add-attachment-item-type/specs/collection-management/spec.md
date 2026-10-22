## MODIFIED Requirements

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the kind-specific field and before the action buttons. The visible field order SHALL be: item type selector, Title, then the kind-specific fields, tag selector, action buttons. For a `command` item the kind-specific fields are Description then Command; for a `web-link` item they are Description then URL; for a `markdown` item they are an optional Filename input then the Content panes; for a `file` item they are an optional Filename input then a single Content textarea; for an `attachment` item they are Description, an optional Filename input, and an attachment drop area, with no Content field. The form SHALL NOT render a Description field for `markdown` or `file` items.

#### Scenario: Add form shows kind-specific field above tags

- **WHEN** a user opens the Add item form
- **THEN** the kind-specific field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons

#### Scenario: Edit form shows kind-specific field above tags

- **WHEN** a user opens the Edit item form
- **THEN** the kind-specific field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons

#### Scenario: Markdown form omits the Description field

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** no Description field is rendered
- **AND** the Filename input renders below Title and the Content panes render below it

#### Scenario: Markdown form shows the Filename field before Content

- **WHEN** a user opens the Add item form for a `markdown` item
- **THEN** a Filename input renders below Title
- **AND** the Content panes render below the Filename input

#### Scenario: Filename input is editable and bound to the item value

- **WHEN** a user opens the Edit item form for a `markdown` item that has a `filename`
- **THEN** the Filename input is pre-filled with that `filename`
- **AND** the user can edit and save it

#### Scenario: File form shows its fields without a Description

- **WHEN** a user opens the Add or Edit item form for a `file` item
- **THEN** no Description field is rendered
- **AND** the Filename input renders below Title and the single Content textarea renders below it

#### Scenario: Attachment form shows its fields without Content

- **WHEN** a user opens the Add item form for an `attachment` item
- **THEN** the Description and Filename fields render below Title
- **AND** the attachment drop area renders below them
- **AND** no Content field is rendered

### Requirement: Type filter includes markdown items

The collection "Type" filter SHALL offer `Commands`, `Web links`, `Markdown`, `Files`, and `Attachments` options. Selecting an option SHALL show only items of that kind.

#### Scenario: Filter the collection by markdown

- **WHEN** a user selects the `Markdown` type filter
- **THEN** the collection shows only items of kind `markdown`
- **AND** command, web-link, file, and attachment items are hidden

#### Scenario: Filter the collection by attachment

- **WHEN** a user selects the `Attachments` type filter
- **THEN** the collection shows only items of kind `attachment`
- **AND** command, web-link, markdown, and file items are hidden

#### Scenario: Clear the type filter shows all types

- **WHEN** a user clears the type filter
- **THEN** items of all kinds are shown again

### Requirement: Item form shows friendly field validation messages

When a user saves an item from the item form and validation fails, the form SHALL display a friendly, field-specific error message instead of the raw validation library message. For a `markdown` item, an empty or whitespace-only title SHALL report "Title is required", an empty or whitespace-only content SHALL report "Content is required for a markdown note", a missing `filename` SHALL report "Filename is required for a markdown note", and an invalid `filename` SHALL report "Filename must be a name of at most 64 characters ending in .md, with no path separators". For a `command` item, an empty or whitespace-only command SHALL report "Command is required". For a `web-link` item, a URL that is not an absolute `http` or `https` URL SHALL report "URL must use the http or https protocol". For an `attachment` item, an empty or whitespace-only title SHALL report "Title is required" and an invalid non-empty `filename` SHALL report "Filename must be a name of at most 128 characters with no path separators"; an absent or blank `filename` SHALL NOT report an error. Any other validation failure SHALL display a generic message rather than the raw validation library text.

#### Scenario: Markdown form reports an empty title

- **WHEN** a user saves a `markdown` item with an empty title and valid content
- **THEN** the form shows the message "Title is required"
- **AND** the item is not submitted

#### Scenario: Markdown form reports a whitespace-only title

- **WHEN** a user saves a `markdown` item with a title containing only spaces and valid content
- **THEN** the form shows the message "Title is required"
- **AND** the item is not submitted

#### Scenario: Markdown form reports whitespace-only content

- **WHEN** a user saves a `markdown` item with a valid title and content containing only spaces
- **THEN** the form shows the message "Content is required for a markdown note"
- **AND** the item is not submitted

#### Scenario: Markdown form reports empty content

- **WHEN** a user saves a `markdown` item with a valid title and empty content
- **THEN** the form shows the message "Content is required for a markdown note"
- **AND** the item is not submitted

#### Scenario: Markdown form reports a missing filename

- **WHEN** a user saves a `markdown` item with a valid title and content but a blank `filename`
- **THEN** the form shows the message "Filename is required for a markdown note"
- **AND** the item is not submitted

#### Scenario: Markdown form reports an invalid filename

- **WHEN** a user saves a `markdown` item whose `filename` exceeds 64 characters, contains a slash (`/`), or does not end in `.md`
- **THEN** the form shows the message "Filename must be a name of at most 64 characters ending in .md, with no path separators"
- **AND** the item is not submitted

#### Scenario: Command form reports a whitespace-only command

- **WHEN** a user saves a `command` item with a command containing only spaces
- **THEN** the form shows the message "Command is required"
- **AND** the item is not submitted

#### Scenario: Web-link form reports an invalid URL

- **WHEN** a user saves a `web-link` item with a URL that does not use the `http` or `https` protocol
- **THEN** the form shows the message "URL must use the http or https protocol"
- **AND** the item is not submitted

#### Scenario: Attachment form reports an empty title

- **WHEN** a user saves an `attachment` item with an empty title
- **THEN** the form shows the message "Title is required"
- **AND** the item is not submitted

#### Scenario: Attachment form reports an invalid filename

- **WHEN** a user saves an `attachment` item whose non-empty `filename` exceeds 128 characters or contains a slash (`/`)
- **THEN** the form shows the message "Filename must be a name of at most 128 characters with no path separators"
- **AND** the item is not submitted

#### Scenario: Attachment form accepts an absent filename

- **WHEN** a user saves an `attachment` item with a valid title and no `filename`
- **THEN** the form does not report a filename error
- **AND** the item is submitted

#### Scenario: Raw validation message is never shown

- **WHEN** a user saves an item and validation fails for any field
- **THEN** the form never displays the raw validation library message (for example, "String must contain at least 1 character(s)")
- **AND** the error is always a friendly field-specific or generic message

## ADDED Requirements

### Requirement: Attachment items store a file reference

Users SHALL be able to create and edit items of kind `attachment`. An attachment item SHALL carry a `title`, optional `description`, tags, related items, and an optional `filename` naming the attached file. It SHALL expose a nullable `storagePath` read field reserved for the future Supabase Storage object reference; in this phase the API SHALL return `storagePath` as `null` and SHALL reject a client-provided storage path. An attachment item SHALL return `command`, `url`, and `content` as `null`; content SHALL remain hidden and disabled until a later change enables it. An attachment item MAY be created without a filename while storage is not implemented.

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

### Requirement: Add item form offers an attachment drop zone

When the Add item form has kind `attachment`, it SHALL render an attachment drop zone beside the tag selector using the same visual surface and interaction model as the file drop zone. The zone SHALL accept a single file dragged from the operating system or chosen through the native picker, and SHALL set the form's `filename` field to the file's full name including its extension. It SHALL NOT read the file body, upload the file, or persist a storage reference. The zone SHALL NOT render in the Edit item form or for any other item kind. Dropping more than one file SHALL show the shared single-file error and leave the current filename unchanged.

#### Scenario: Attachment drop zone appears for a new attachment

- **WHEN** a user opens the Add item form and selects the `Attachment` item type
- **THEN** an attachment drop zone renders beside the tag selector
- **AND** the zone uses the same visual surface as the file drop zone

#### Scenario: Attachment drop zone is hidden for other kinds and in edit mode

- **WHEN** a user selects `Command`, `Web link`, `Markdown`, or `File`, or opens an existing attachment for editing
- **THEN** no attachment drop zone is rendered

#### Scenario: Dropping a file fills only the filename

- **WHEN** a user drops a file named `report.pdf` on the attachment drop zone
- **THEN** the Filename field contains `report.pdf`
- **AND** no file body is read or uploaded
- **AND** the Content field remains absent

#### Scenario: Attachment can be saved without a file

- **WHEN** a user saves an attachment with a title but does not drop or choose a file
- **THEN** the item is saved with no filename
- **AND** no storage reference is created

#### Scenario: Multiple files are rejected by the attachment drop zone

- **WHEN** a user drops more than one file on the attachment drop zone
- **THEN** the zone shows the shared single-file message
- **AND** the Filename field keeps its previous value

### Requirement: Search covers attachment filenames

Collection search SHALL match `attachment` items by their `filename` in addition to title, description, and tags.

#### Scenario: Search finds an attachment by filename

- **WHEN** a user searches for text that appears inside an attachment's `filename`
- **THEN** that attachment item is included in the search results
