# Collection Management

## Summary

This capability covers the core private collection experience for authenticated users, including creating, reading, updating, deleting, searching, and ordering items.

## Requirements

- Users must be able to manage a private collection of spells and web links owned by their account.
- Item ownership must be enforced for all read, update, reorder, and delete operations.
- Users must be able to search and filter collection contents by relevant dimensions.
- Users must be able to persist and retrieve item ordering.

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the Command/URL field and before the action buttons. The visible field order SHALL be: item type selector, Title, Description, Command/URL, tag selector, action buttons.

#### Scenario: Add form shows command field above tags

- **WHEN** a user opens the Add item form
- **THEN** the Command/URL field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons

#### Scenario: Edit form shows command field above tags

- **WHEN** a user opens the Edit item form
- **THEN** the Command/URL field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons

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
