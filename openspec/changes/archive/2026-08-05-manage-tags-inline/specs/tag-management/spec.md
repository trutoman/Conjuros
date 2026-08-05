## ADDED Requirements

### Requirement: Inline tag management view reuses the tag form frame style

The inline tag management view displayed in the main content frame SHALL use the same frame styling as the tag add/edit form (the shared `.item-form` frame style: surface panel with border and rounded corners, full frame height with scrollable content). Reordering, editing, deleting, and adding tags from this view SHALL remain functional exactly as on the standalone tags page.

#### Scenario: Tag management view renders with form frame styling

- **WHEN** the tag management view is open in the main content frame
- **THEN** it is presented as a surface panel with the same border, rounded corners, full-height, and scroll behavior as the tag add/edit form frame

#### Scenario: Manage, add, edit, reorder, and delete remain available inline

- **WHEN** the tag management view is open
- **THEN** the user can add a tag, edit a tag, reorder tags, and delete a tag entirely within the main content frame
- **AND** no navigation away from the collection shell is required to perform these actions