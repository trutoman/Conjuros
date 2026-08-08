## ADDED Requirements

### Requirement: Markdown items store extensive content

Users SHALL be able to create and edit items of kind `markdown`. A `markdown` item SHALL store its body in a `content` field holding the raw Markdown source as a single string with no enforced upper length limit. When an item is `markdown`, the API SHALL persist `content` and return `command` and `url` as `null`; when an item is `spell` or `web-link`, `content` SHALL be returned as `null`.

#### Scenario: Create a markdown item with content

- **WHEN** a user submits a new item with kind `markdown`, a title, and a `content` value containing extensive Markdown text
- **THEN** the item is stored with kind `markdown`
- **AND** the response includes the full `content` text exactly as submitted
- **AND** the item has `command` and `url` as `null`

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

- **WHEN** a user creates or edits a `markdown` item with content much longer than the spell `command` limit
- **THEN** the full content is stored and returned without truncation

### Requirement: Type filter includes markdown items

The collection "Type" filter SHALL offer a `Markdown` option alongside `Spells` and `Web links`. Selecting it SHALL show only items of kind `markdown`.

#### Scenario: Filter the collection by markdown

- **WHEN** a user selects the `Markdown` type filter
- **THEN** the collection shows only items of kind `markdown`
- **AND** spell and web-link items are hidden

#### Scenario: Clear the type filter shows all types

- **WHEN** a user clears the `Markdown` type filter
- **THEN** items of all kinds are shown again

### Requirement: Search covers markdown content

Collection search SHALL match `markdown` items by their `content` text in addition to title, description, and tags.

#### Scenario: Search finds markdown content

- **WHEN** a user searches for text that appears inside a markdown item's `content`
- **THEN** that markdown item is included in the search results

#### Scenario: Search result respects the type filter

- **WHEN** a user searches while the `Markdown` type filter is active
- **THEN** results include only markdown items matching the search text
