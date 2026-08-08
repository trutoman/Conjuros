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
