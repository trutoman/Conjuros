# Collection Management

## Purpose

This capability covers the core private collection experience for authenticated users, including creating, reading, updating, deleting, searching, and ordering items.
## Requirements

- Users must be able to manage a private collection of commands and web links owned by their account.
- Item ownership must be enforced for all read, update, reorder, and delete operations.
- Users must be able to search and filter collection contents by relevant dimensions.
- Users must be able to persist and retrieve item ordering.

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

### Requirement: Item form tag selector uses a single label

The item form's tag selector SHALL present exactly one visible "Tags" label, provided by the fieldset legend. It SHALL NOT render a separate label row above the fieldset.

#### Scenario: Single visible Tags label

- **WHEN** a user opens the Add or Edit item form
- **THEN** the tag selector shows a single "Tags" label as the fieldset legend
- **AND** there is no duplicate "Tags" label row above the fieldset

### Requirement: Item form tags render as color-coded pills

Each available tag in the item form SHALL render as a pill using the tag's color for its text and border, with a `color-mix` tinted background, consistent with the sidebar tag filters. Selected tags SHALL use a stronger tint than unselected tags.

#### Scenario: Unselected tag renders as a colored pill

- **WHEN** a user opens the Add or Edit item form with available tags
- **AND** a tag is not selected
- **THEN** that tag renders as a pill with its tag color on text and border
- **AND** the pill background uses the lighter tint

#### Scenario: Selected tag renders with emphasis

- **WHEN** a user selects a tag in the item form
- **THEN** that tag remains a pill using its tag color
- **AND** the pill background uses the stronger tint

#### Scenario: Tag checkboxes remain operable

- **WHEN** a user toggles a tag pill's checkbox in the item form
- **THEN** the tag is added to or removed from the item's selected tags
- **AND** each pill remains accessible by its tag name

### Requirement: Item form has a floating close button

The item form (Add item and Edit item) SHALL display a borderless, floating close button in the top-right corner of the form. Activating the button SHALL dismiss the form and return to the previous view, equivalent to activating the `Cancel` button. The button SHALL expose an accessible name describing its action.

#### Scenario: Add item form closes via floating close button

- **WHEN** a user opens the Add item form
- **THEN** a floating close button appears in the top-right corner of the form
- **AND** activating the close button dismisses the form and returns to the previous view

#### Scenario: Edit item form closes via floating close button

- **WHEN** a user opens the Edit item form
- **THEN** a floating close button appears in the top-right corner of the form
- **AND** activating the close button dismisses the form and returns to the previous view

### Requirement: Markdown items store extensive content

Users SHALL be able to create and edit items of kind `markdown`. A `markdown` item SHALL store its body in a `content` field holding the raw Markdown source as a single string with no enforced upper length limit. A `markdown` item MAY carry a `description`, but it is optional: when none is provided, the API SHALL return `description` as `null`. When an item is `markdown`, the API SHALL return `command` and `url` as `null`; when an item is `command` or `web-link`, `content` SHALL be returned as `null`.

#### Scenario: Create a markdown item with content

- **WHEN** a user submits a new item with kind `markdown`, a title, and a `content` value containing extensive Markdown text
- **THEN** the item is stored with kind `markdown`
- **AND** the response includes the full `content` text exactly as submitted
- **AND** the item has `command` and `url` as `null`

#### Scenario: Create a markdown item without a description

- **WHEN** a user submits a new item with kind `markdown`, a title, and a `content` value but no `description`
- **THEN** the item is stored with kind `markdown`
- **AND** the response returns `description` as `null`

#### Scenario: Existing items without a content field remain readable

- **WHEN** an item was stored before the `content` field existed (no `content` in the document)
- **THEN** the item loads without validation errors
- **AND** the item is returned with `content` as `null`

#### Scenario: Edit a markdown item updates its content

- **WHEN** a user edits a `markdown` item and changes its `content`
- **THEN** the item's stored `content` is replaced by the new value
- **AND** the item remains of kind `markdown`

#### Scenario: Reject switching kind to a mismatched field

- **WHEN** a user updates an item to kind `markdown` while also sending `command` or `url`
- **THEN** the update is rejected with a validation error
- **AND** the item is not changed

#### Scenario: Long markdown content is preserved

- **WHEN** a user creates or edits a `markdown` item with content much longer than the command text limit
- **THEN** the full content is stored and returned without truncation

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

### Requirement: Search covers markdown content

Collection search SHALL match `markdown` items by their `content` text in addition to title, description, and tags.

#### Scenario: Search finds markdown content

- **WHEN** a user searches for text that appears inside a markdown item's `content`
- **THEN** that markdown item is included in the search results

#### Scenario: Search result respects the type filter

- **WHEN** a user searches while the `Markdown` type filter is active
- **THEN** results include only markdown items matching the search text

### Requirement: Markdown form splits content into editor and viewer panes

The item form for a `markdown` item SHALL render the Content field as a 50/50 vertical split of two panes without a standalone "Content" label row: the left pane SHALL be labeled "Content - Edit" and SHALL be an editable textarea bound to the content value; the right pane SHALL be labeled "Content - View" and SHALL render the Markdown from the edit pane as sanitized HTML. The preview SHALL update in real time as the user types in the edit pane. Both panes SHALL start at twice the default form field height and SHALL grow taller as more lines are added. The rendered preview SHALL be sanitized before display; no script or active content embedded in the Markdown SHALL execute.

#### Scenario: Markdown form shows labeled editor and preview panes

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the Content field renders as two side-by-side panes of equal width
- **AND** the left pane is labeled "Content - Edit" and is an editable textarea
- **AND** the right pane is labeled "Content - View" and shows rendered Markdown
- **AND** no separate "Content" label row is rendered above the panes

#### Scenario: Preview renders markdown as the user types

- **WHEN** a user types Markdown into the "Content - Edit" pane
- **THEN** the "Content - View" pane renders the text as formatted HTML (for example, `# Heading` renders as a heading)
- **AND** the preview updates as the user continues typing

#### Scenario: Rendered preview does not execute embedded scripts

- **WHEN** the content value contains a script or other active HTML element
- **THEN** the preview shows the element as inert text or markup
- **AND** no script embedded in the content executes

#### Scenario: Content panes render at double the default height

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the edit textarea and the preview pane render at twice the height of a default form field

#### Scenario: Content panes grow with added lines

- **WHEN** a user adds more lines to the "Content - Edit" textarea
- **THEN** the edit textarea and the preview pane grow taller to fit the additional content

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

### Requirement: Markdown items require a filename on creation

A new `markdown` item SHALL include a `filename` field holding a plain file name for the note. `filename` SHALL be a trimmed, non-empty string of at most 64 characters, SHALL contain no path separators (`/` or `\`), and SHALL end with the `.md` extension (case-insensitive). Submitting a `markdown` item without a `filename` SHALL be rejected. A `filename` that violates the rules SHALL also be rejected. Once created, a `markdown` item's `filename` MAY be updated and MAY be cleared, in which case the item remains readable and its `filename` is returned as `null`; items whose documents predate the requirement are likewise returned with a `null` `filename`. Items of kind `command` or `web-link` SHALL NOT carry a `filename`; it SHALL be returned as `null` for them, and submitting a `filename` on such an item SHALL be rejected.

#### Scenario: Create a markdown item with a filename

- **WHEN** a user submits a new item with kind `markdown`, a title, content, and the filename `"notes.md"`
- **THEN** the new markdown item is stored with its `filename` set to `"notes.md"`
- **AND** the stored item's `url` is `null`

#### Scenario: Create a markdown item without a filename

- **WHEN** a user submits a new item with kind `markdown`, a title, and content, but no `filename`
- **THEN** the item is rejected with a validation error
- **AND** no markdown item is stored

#### Scenario: Existing items without a filename field remain readable

- **WHEN** a stored markdown item's document has no `filename` field
- **THEN** the item is returned with `filename` set to `null`
- **AND** the item's `content` is readable in the viewer

#### Scenario: Edit a markdown item updates its filename

- **WHEN** a user edits a markdown item and changes its existing `filename` from `"notes.md"` to `"ideas.md"`
- **THEN** the item's `filename` is updated to `"ideas.md"`

#### Scenario: Empty filename clears the field

- **WHEN** a user edits a markdown item and submits an empty `filename` (for example, `""`)
- **THEN** the item's `filename` is `null`
- **AND** the item remains readable with no `filename` set

#### Scenario: Reject an invalid filename

- **WHEN** a user submits a markdown item whose `filename` exceeds 64 characters, is empty or whitespace-only, contains a slash (`/`), or does not end in `.md`
- **THEN** the submission is rejected with a validation error

#### Scenario: Reject a filename on a non-markdown item

- **WHEN** a user submits a `command` or `web-link` item carrying a `filename` field
- **THEN** the submission is rejected with a validation error
- **AND** no item is stored

### Requirement: Add item form offers a file drop zone for file items

When the Add item form has kind `file`, it SHALL render a file drop zone beside the tag selector, using the space to the right of the tag pills. The drop zone SHALL accept a single file dragged from the operating system and SHALL also be operable by pointer and keyboard to open a native file picker. It SHALL NOT render for any other item kind, and it SHALL NOT render in the Edit item form.

On receiving a file, the drop zone SHALL set the form's `filename` field to the file's full name including its extension and SHALL set the form's `content` field to the file's text decoded as UTF-8. Both fields SHALL remain editable after loading, and a later drop SHALL replace the previously loaded name and content.

While a file is dragged over the drop zone, the drop zone SHALL show a visible drag-over state. After a successful load, it SHALL expose an accessible status message naming the loaded file. If the file cannot be read, or if more than one file is dropped, it SHALL show a friendly error message and SHALL leave the current filename and content unchanged. File name validation SHALL continue to use the existing `file` item rules when the form is saved.

#### Scenario: Drop zone appears for a new file item

- **WHEN** a user opens the Add item form and selects the `File` item type
- **THEN** a file drop zone renders beside the tag selector
- **AND** the drop zone is visible without opening any additional view

#### Scenario: Drop zone is hidden for other kinds

- **WHEN** a user opens the Add item form and selects `Command`, `Web link`, or `Markdown`
- **THEN** no file drop zone is rendered

#### Scenario: Drop zone is hidden in the edit form

- **WHEN** a user opens the Edit item form for a `file` item
- **THEN** no file drop zone is rendered
- **AND** the Filename and Content fields show the stored values

#### Scenario: Dropping a text file fills the fields

- **WHEN** a user drags a file named `deploy.log` containing `Started at 09:00\nFinished ok` over the drop zone and drops it
- **THEN** the Filename field contains `deploy.log`
- **AND** the Content field contains `Started at 09:00\nFinished ok`
- **AND** the text is preserved exactly, including line breaks

#### Scenario: The full file name with its extension is used

- **WHEN** a user drops a file named `Release.Notes.TXT`
- **THEN** the Filename field contains `Release.Notes.TXT`
- **AND** the name is neither shortened nor stripped of its extension

#### Scenario: A loaded file can be replaced by another drop

- **WHEN** a file has already populated the Filename and Content fields
- **AND** the user drops a second file
- **THEN** the Filename field contains the second file's name
- **AND** the Content field contains the second file's text

#### Scenario: Choosing a file through the picker fills the fields

- **WHEN** a user activates the drop zone and chooses a file in the native picker
- **THEN** the Filename field contains the chosen file's full name
- **AND** the Content field contains the chosen file's text

#### Scenario: Drop zone is keyboard operable

- **WHEN** a keyboard user focuses the drop zone and activates it
- **THEN** the native file picker opens
- **AND** the drop zone exposes an accessible name describing that it loads a file

#### Scenario: Drag-over state is visible

- **WHEN** a user drags a file over the drop zone
- **THEN** the drop zone shows a visible drag-over state
- **AND** the state clears when the file is dropped or the drag leaves the drop zone

#### Scenario: Loaded file is announced

- **WHEN** a file is successfully loaded into the form
- **THEN** the drop zone exposes a status message containing the file's name
- **AND** the status message is available to assistive technology

#### Scenario: Multiple files are rejected

- **WHEN** a user drops more than one file on the drop zone
- **THEN** the drop zone shows a friendly message explaining that only one file can be loaded
- **AND** the Filename and Content fields keep their previous values

#### Scenario: Unreadable file shows an error

- **WHEN** a dropped or chosen file cannot be read as text
- **THEN** the drop zone shows a friendly error message
- **AND** the Filename and Content fields keep their previous values

#### Scenario: Dropped file name still follows file item rules

- **WHEN** a dropped file name exceeds 128 characters or is otherwise not a valid `file` item filename
- **THEN** the name is placed in the Filename field
- **AND** saving the item reports the existing friendly file filename validation message

### Requirement: Collection item kind uses command

The collection SHALL identify command items with the item kind `command`. Creating or updating an item of kind `command` SHALL store its executable text in the `command` field, and the API SHALL return `url`, `content`, and `filename` as `null` for that kind. Requests that use the former `spell` kind SHALL be rejected with a validation error, and existing items stored with the former `spell` kind SHALL be returned as kind `command` after the database migration.

#### Scenario: Create a command item

- **WHEN** a user submits a new item with kind `command`, a title, and command text
- **THEN** the item is stored with kind `command`
- **AND** the response contains the command text exactly as submitted
- **AND** the response returns `url`, `content`, and `filename` as `null`

#### Scenario: Reject the former spell kind

- **WHEN** a client submits a new item with kind `spell`
- **THEN** the request is rejected with a validation error
- **AND** no item is stored

#### Scenario: Stored spell items become command items

- **WHEN** the database is upgraded and contains an item whose stored kind was `spell`
- **THEN** the item is returned with kind `command`
- **AND** its command text is unchanged

#### Scenario: Filter the collection by command

- **WHEN** a user selects the `Command` type filter
- **THEN** the collection shows only items of kind `command`
- **AND** web-link, markdown, and file items are hidden

#### Scenario: Command form chooses the command kind

- **WHEN** a user opens the Add item form and selects the `Command` item type
- **THEN** the form submits the item with kind `command`
- **AND** the Command field supplies the stored command text

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

### Requirement: Search covers attachment filenames

Collection search SHALL match `attachment` items by their `filename` in addition to title, description, and tags.

#### Scenario: Search finds an attachment by filename

- **WHEN** a user searches for text that appears inside an attachment's `filename`
- **THEN** that attachment item is included in the search results
