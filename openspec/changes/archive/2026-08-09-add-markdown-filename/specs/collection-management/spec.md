## ADDED Requirements

### Requirement: Markdown items carry an optional filename

A `markdown` item MAY carry an optional `filename` field holding a plain file name for the note. When present, `filename` SHALL be a non-empty string of at most 64 characters, SHALL contain no path separators (`/` or `\`), and SHALL end with the `.md` extension (case-insensitive). When no `filename` is provided for a `markdown` item, and for every `spell` or `web-link` item, `filename` SHALL be returned as `null`. Submitting a `filename` on a non-`markdown` item SHALL be rejected, and a `filename` that violates the rules SHALL be rejected.

#### Scenario: Create a markdown item with a filename

- **WHEN** a user submits a new item with kind `markdown`, a title, `content`, and a `filename` of "notes.md"
- **THEN** the item is stored with kind `markdown`
- **AND** the response includes `filename` as "notes.md"
- **AND** the item has `command` and `url` as `null`

#### Scenario: Create a markdown item without a filename

- **WHEN** a user submits a new item with kind `markdown`, a title, and `content` but no `filename`
- **THEN** the item is stored with kind `markdown`
- **AND** the response returns `filename` as `null`

#### Scenario: Existing items without a filename field remain readable

- **WHEN** a markdown item was stored before the `filename` field existed (no `filename` in the document)
- **THEN** the item loads without validation errors
- **AND** the item is returned with `filename` as `null`

#### Scenario: Edit a markdown item updates its filename

- **WHEN** a user edits a `markdown` item and changes its `filename`
- **THEN** the item's stored `filename` is replaced by the new value
- **AND** the item remains of kind `markdown`

#### Scenario: Empty filename clears the field

- **WHEN** a user edits a `markdown` item and sets its `filename` to an empty value
- **THEN** the item's stored `filename` becomes `null`

#### Scenario: Reject an invalid filename

- **WHEN** a `filename` contains a path separator (`/` or `\`), exceeds 64 characters, or does not end with the `.md` extension (case-insensitive)
- **THEN** the item is rejected with a validation error
- **AND** the item is not changed

#### Scenario: Reject a filename on a non-markdown item

- **WHEN** a user submits or updates a `spell` or `web-link` item while also sending a `filename`
- **THEN** the request is rejected with a validation error
- **AND** the item is not changed

## MODIFIED Requirements

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the kind-specific field and before the action buttons. The visible field order SHALL be: item type selector, Title, then the kind-specific fields, tag selector, action buttons. For a `spell` item the kind-specific fields are Description then Command; for a `web-link` item they are Description then URL; for a `markdown` item they are an optional Filename input then the Content panes, and the form SHALL NOT render a Description field.

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

### Requirement: Item form shows friendly field validation messages

When a user saves an item from the item form and validation fails, the form SHALL display a friendly, field-specific error message instead of the raw validation library message. For a `markdown` item, an empty or whitespace-only title SHALL report "Title is required", an empty or whitespace-only content SHALL report "Content is required for a markdown note", and an invalid `filename` SHALL report "Filename must be a name of at most 64 characters ending in .md, with no path separators". For a `spell` item, an empty or whitespace-only command SHALL report "Command is required for a spell". For a `web-link` item, a URL that is not an absolute `http` or `https` URL SHALL report "URL must use the http or https protocol". Any other validation failure SHALL display a generic message rather than the raw validation library text.

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

#### Scenario: Markdown form reports an invalid filename

- **WHEN** a user saves a `markdown` item whose `filename` exceeds 64 characters, contains a slash (`/`), or does not end in `.md`
- **THEN** the form shows the message "Filename must be a name of at most 64 characters ending in .md, with no path separators"
- **AND** the item is not submitted

#### Scenario: Spell form reports a whitespace-only command

- **WHEN** a user saves a `spell` item with a command containing only spaces
- **THEN** the form shows the message "Command is required for a spell"
- **AND** the item is not submitted

#### Scenario: Web-link form reports an invalid URL

- **WHEN** a user saves a `web-link` item with a URL that does not use the `http` or `https` protocol
- **THEN** the form shows the message "URL must use the http or https protocol"
- **AND** the item is not submitted

#### Scenario: Raw validation message is never shown

- **WHEN** a user saves an item and validation fails for any field
- **THEN** the form never displays the raw validation library message (for example, "String must contain at least 1 character(s)")
- **AND** the error is always a friendly field-specific or generic message