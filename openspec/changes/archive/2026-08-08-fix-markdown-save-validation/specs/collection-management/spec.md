## ADDED Requirements

### Requirement: Item form shows friendly field validation messages

When a user saves an item from the item form and validation fails, the form SHALL display a friendly, field-specific error message instead of the raw validation library message. For a `markdown` item, an empty or whitespace-only title SHALL report "Title is required", and an empty or whitespace-only content SHALL report "Content is required for a markdown note". For a `spell` item, an empty or whitespace-only command SHALL report "Command is required for a spell". For a `web-link` item, a URL that is not an absolute `http` or `https` URL SHALL report "URL must use the http or https protocol". Any other validation failure SHALL display a generic message rather than the raw validation library text.

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
