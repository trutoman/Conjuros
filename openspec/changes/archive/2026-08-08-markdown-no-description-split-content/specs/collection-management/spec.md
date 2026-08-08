## MODIFIED Requirements

### Requirement: Markdown items store extensive content

Users SHALL be able to create and edit items of kind `markdown`. A `markdown` item SHALL store its body in a `content` field holding the raw Markdown source as a single string with no enforced upper length limit. A `markdown` item MAY carry a `description`, but it is optional: when none is provided, the API SHALL return `description` as `null`. When an item is `markdown`, the API SHALL return `command` and `url` as `null`; when an item is `spell` or `web-link`, `content` SHALL be returned as `null`.

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

- **WHEN** a user creates or edits a `markdown` item with content much longer than the spell `command` limit
- **THEN** the full content is stored and returned without truncation

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the kind-specific field and before the action buttons. The visible field order SHALL be: item type selector, Title, Description, kind-specific field (Command for `spell`, URL for `web-link`, Content for `markdown`), tag selector, action buttons. For a `markdown` item the form SHALL NOT render a Description field, so Content follows Title directly.

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
- **AND** the Content field renders directly below Title

## ADDED Requirements

### Requirement: Markdown form splits content into editor and viewer panes

The item form for a `markdown` item SHALL render the Content field as a 50/50 vertical split of two textareas without a standalone "Content" label row: the left textarea SHALL be labeled "Content - Edit" and the right textarea SHALL be labeled "Content - View", both bound to the same content value so that editing either pane updates the other. Both textareas SHALL start at twice the default form field height and SHALL grow taller as more lines are added. No Markdown rendering is performed in the viewer pane yet.

#### Scenario: Markdown form shows labeled editor and viewer panes

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the Content field renders as two side-by-side textareas of equal width
- **AND** the left textarea is labeled "Content - Edit" and the right textarea is labeled "Content - View"
- **AND** no separate "Content" label row is rendered above the panes

#### Scenario: Editing one pane updates the other

- **WHEN** a user types into the "Content - Edit" pane of the markdown Content field
- **THEN** the "Content - View" pane updates to the same text

#### Scenario: Content panes render at double the default height

- **WHEN** a user opens the Add or Edit item form for a `markdown` item
- **THEN** the two Content textareas render at twice the height of a default form field

#### Scenario: Content textareas grow with added lines

- **WHEN** a user adds more lines to a "Content - Edit" or "Content - View" textarea
- **THEN** the textareas grow taller to fit the additional lines
