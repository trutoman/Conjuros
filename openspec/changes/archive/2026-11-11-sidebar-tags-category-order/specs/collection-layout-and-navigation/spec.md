## ADDED Requirements

### Requirement: Sidebar tag categories follow the persisted category order

The tags sidebar SHALL list category groups in the persisted tag category `order` ascending (lowest first), the same order shown in the tag management view. Groups for categories that have no category record SHALL follow the ordered ones, sorted alphabetically. Tags within a group SHALL remain sorted alphabetically by name.

#### Scenario: Sidebar mirrors the manage tags order

- **WHEN** the user has categories ordered `work`, `personal`, `hobby`
- **THEN** the sidebar shows the groups in that sequence, not alphabetically

#### Scenario: Reordering is reflected in the sidebar

- **WHEN** the user moves a category in the tag management view
- **THEN** the sidebar shows the groups in the new order

#### Scenario: Tag-only categories come last

- **WHEN** a tag references a category with no category record
- **THEN** its group appears after all ordered categories
