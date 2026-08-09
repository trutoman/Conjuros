## RENAMED Requirements

- FROM: ### Requirement: Markdown items carry an optional filename
- TO: ### Requirement: Markdown items require a filename on creation

## MODIFIED Requirements

### Requirement: Markdown items require a filename on creation

A new `markdown` item SHALL include a `filename` field holding a plain file name for the note. `filename` SHALL be a trimmed, non-empty string of at most 64 characters, SHALL contain no path separators (`/` or `\`), and SHALL end with the `.md` extension (case-insensitive). Submitting a `markdown` item without a `filename` SHALL be rejected. A `filename` that violates the rules SHALL also be rejected. Once created, a `markdown` item's `filename` MAY be updated and MAY be cleared, in which case the item remains readable and its `filename` is returned as `null`; items whose documents predate the requirement are likewise returned with a `null` `filename`. Items of kind `spell` or `web-link` SHALL NOT carry a `filename`; it SHALL be returned as `null` for them, and submitting a `filename` on such an item SHALL be rejected.

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

- **WHEN** a user submits a `spell` or `web-link` item carrying a `filename` field
- **THEN** the submission is rejected with a validation error
- **AND** no item is stored

### Requirement: Item form shows friendly field validation messages

When a user saves an item from the item form and validation fails, the form SHALL display a friendly, field-specific error message instead of the raw validation library message. For a `markdown` item, an empty or whitespace-only title SHALL report "Title is required", an empty or whitespace-only content SHALL report "Content is required for a markdown note", a missing `filename` SHALL report "Filename is required for a markdown note", and an invalid `filename` SHALL report "Filename must be a name of at most 64 characters ending in .md, with no path separators". For a `spell` item, an empty or whitespace-only command SHALL report "Command is required for a spell". For a `web-link` item, a URL that is not an absolute `http` or `https` URL SHALL report "URL must use the http or https protocol". Any other validation failure SHALL display a generic message rather than the raw validation library text.

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