# Collection Management

## Summary

This capability covers the core private collection experience for authenticated users, including creating, reading, updating, deleting, searching, and ordering items.

## Requirements

- Users must be able to manage a private collection of spells and web links owned by their account.
- Item ownership must be enforced for all read, update, reorder, and delete operations.
- Users must be able to search and filter collection contents by relevant dimensions.
- Users must be able to persist and retrieve item ordering.

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
