## MODIFIED Requirements

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the kind-specific field and before the action buttons. The visible field order SHALL be: item type selector, Title, kind-specific fields, tag selector, action buttons. For a `spell` item the kind-specific fields are Description then Command; for a `web-link` item they are Description then URL; for a `markdown` item they are an optional Filename input then the Content panes; for a `file` item they are an optional Filename input then a single Content textarea. For both `markdown` and `file` items the form SHALL NOT render a Description field.

## ADDED Requirements

### Requirement: File items store plain text content and a user-chosen filename

Users SHALL be able to create and edit items of kind `file`. A `file` item SHALL store its body in a `content` field holding plain text as a single string with no enforced upper length limit, and SHALL carry a `filename` field. A `file` item MAY carry a `description`, but it is optional: when none is provided, the API SHALL return `description` as `null`. When an item is `file`, the API SHALL return `command` and `url` as `null`.

#### Scenario: Create a file item with content

- **WHEN** a user submits a new item with kind `file`, a title, a `content` value, and a `filename`
- **THEN** the item is stored with kind `file`
- **AND** the response includes the full `content` text exactly as submitted
- **AND** the item has `command` and `url` as `null`

#### Scenario: Edit a file item updates its content

- **WHEN** a user edits a `file` item and changes its `content`
- **THEN** the item's stored `content` is replaced by the new value
- **AND** the item remains of kind `file`

#### Scenario: Reject switching kind to a mismatched field

- **WHEN** a user updates an item to kind `file` while also sending `command` or `url`
- **THEN** the update is rejected with a validation error
- **AND** the item is not changed

### Requirement: File items require a filename with a user-chosen name

A new `file` item SHALL include a `filename` field holding a plain file name for the document. `filename` SHALL be a trimmed, non-empty string of at most 128 characters, SHALL contain no path separators (`/` or `\`), and SHALL NOT be required to carry any particular extension. Submitting a `file` item without a `filename` SHALL be rejected; a `filename` that violates the rules SHALL also be rejected. Once created, a `file` item's `filename` MAY be updated and MAY be cleared, in which case the item remains readable and its `filename` is returned as `null`. Items of every other kind SHALL NOT carry a `filename`; it SHALL be returned as `null` for them, and submitting a `filename` on such an item SHALL be rejected.

#### Scenario: Create a file item with a filename

- **WHEN** a user submits a new item with kind `file`, a title, content, and the filename `"notes.txt"`
- **THEN** the new file item is stored with its `filename` set to `"notes.txt"`

#### Scenario: Create a file item without a filename

- **WHEN** a user submits a new item with kind `file`, a title, and content, but no `filename`
- **THEN** the item is rejected with a validation error
- **AND** no file item is stored

#### Scenario: Accept a filename with no extension

- **WHEN** a user submits a `file` item whose `filename` is `"notes"` (no extension)
- **THEN** the item is accepted with its `filename` set to `"notes"`

#### Scenario: Edit a file item updates its filename

- **WHEN** a user edits a file item and changes its existing `filename` from `"draft.txt"` to `"final-notes"`
- **THEN** the item's `filename` is updated to `"final-notes"`

#### Scenario: Empty filename clears the field

- **WHEN** a user edits a file item and submits an empty `filename` (for example, `""`)
- **THEN** the item's `filename` is `null`
- **AND** the item remains readable with no `filename` set

#### Scenario: Reject an invalid filename

- **WHEN** a user submits a file item whose `filename` exceeds 128 characters, is empty or whitespace-only, or contains a slash (`/`)
- **THEN** the submission is rejected with a validation error

#### Scenario: Reject a filename on a kind that does not carry one

- **WHEN** a user submits a `spell` or `web-link` item carrying a `filename` field
- **THEN** the submission is rejected with a validation error
- **AND** no item is stored

### Requirement: Type filter includes file items

The collection "Type" filter SHALL offer a `File` option alongside `Spells`, `Web links`, and `Markdown`. Selecting it SHALL show only items of kind `file`.

#### Scenario: Filter the collection by file

- **WHEN** a user selects the `File` type filter
- **THEN** the collection shows only items of kind `file`
- **AND** spell, web-link, and markdown items are hidden

#### Scenario: Clear the type filter shows all types

- **WHEN** a user clears the `File` type filter
- **THEN** items of all kinds are shown again

### Requirement: Search covers file content

Collection search SHALL match `file` items by their `content` text in addition to title, description, and tags.

#### Scenario: Search finds file content

- **WHEN** a user searches for text that appears inside a file item's `content`
- **THEN** that file item is included in the search results

#### Scenario: Search result respects the type filter

- **WHEN** a user searches while the `File` type filter is active
- **THEN** results include only file items matching the search text

### Requirement: File form renders a single plain Content textarea

The item form for a `file` item SHALL render the Filename input below Title and a single Content textarea below it, labeled exactly "Content". The Content field SHALL be one plain, unlabeled-pane textarea bound to the content value of the form; there SHALL NOT be a second "Content - View" pane, a preview, or a split of any kind, and no separate "Content - Edit" header SHALL be rendered. The textarea SHALL behave as a standard textarea: no Tab indentation, no list or quote continuation on Enter, no auto-closing of marker pairs, and no local draft autosave. The form SHALL NOT render a Description field for `file` items.

#### Scenario: File form shows a single Content textarea

- **WHEN** a user opens the Add or Edit item form for a `file` item
- **THEN** the form shows a Filename input below Title
- **AND** below it shows a single content textarea labeled "Content"
- **AND** the form shows no second "Content - View" pane and no preview

#### Scenario: File form omits the Description field

- **WHEN** a user opens the Add or Edit item form for a `file` item
- **THEN** no Description field is rendered

#### Scenario: File content textarea is bound to the item value

- **WHEN** a user opens the Edit item form for a `file` item that has `content`
- **THEN** the Content textarea is pre-filled with that `content`
- **AND** the user can edit and save it

#### Scenario: File textarea requires no extra key handling

- **WHEN** a user types into the `file` Content textarea, including pressing Tab or Enter
- **THEN** the textarea behaves like a standard multi-line input with no indentation, list, or marker behavior applied

### Requirement: Item form shows friendly file validation messages

When a user saves a `file` item and validation fails, the form SHALL display a friendly, field-specific error message instead of a raw validation library message. An empty or whitespace-only title SHALL report "Title is required", an empty or whitespace-only `content` SHALL report "Content is required for a file", a missing `filename` on creation SHALL report "Filename is required for a file", and an invalid `filename` (empty or whitespace-only on creation, more than 128 characters, or containing a path separator) SHALL report "Filename must be a name of at most 128 characters with no path separators". Any other validation failure SHALL display a generic message.

#### Scenario: File form reports a required content

- **WHEN** a user saves a `file` item with a valid title and empty or whitespace-only content
- **THEN** the form shows the message "Content is required for a file"
- **AND** the item is not submitted

#### Scenario: File form reports a missing filename

- **WHEN** a user saves a new `file` item with valid content but a blank `filename`
- **THEN** the form shows the message "Filename is required for a file"
- **AND** the item is not submitted

#### Scenario: File form reports an invalid filename

- **WHEN** a user saves a `file` item whose `filename` exceeds 128 characters or contains a slash (`/`)
- **THEN** the form shows the message "Filename must be a name of at most 128 characters with no path separators"
- **AND** the item is not submitted

#### Scenario: Raw validation message is never shown for a file item

- **WHEN** a user saves a `file` item and validation fails for any field
- **THEN** the form never displays the raw validation library message
- **AND** the error is always a friendly, field-specific or generic message