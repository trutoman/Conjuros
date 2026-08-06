## ADDED Requirements

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
