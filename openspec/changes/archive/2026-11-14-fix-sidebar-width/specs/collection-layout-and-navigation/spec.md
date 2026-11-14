# Spec Delta

## ADDED Requirements

### Requirement: Expanded tags sidebar keeps a fixed width

On viewports above the mobile breakpoint the expanded tags sidebar SHALL occupy exactly its current maximum width (280px), regardless of how many tags, categories, or how long the tag text is. Collapsing it SHALL keep the existing 70px width, and the narrow-viewport drawer SHALL keep the same 280px width. Content SHALL fit or wrap inside that width without horizontal overflow.

#### Scenario: Width does not depend on the tag list

- **WHEN** a user compares the expanded sidebar with no tags, a few tags, and dozens of tags
- **THEN** the sidebar measures the same 280px in every case
- **AND** the collection column starts at the same horizontal position

#### Scenario: Long tag names wrap inside the fixed width

- **WHEN** a tag name is longer than the sidebar width
- **THEN** the tag content wraps within the sidebar
- **AND** no horizontal scrollbar appears inside the sidebar or the page

#### Scenario: Collapsing keeps the existing narrow width

- **WHEN** a user collapses the sidebar on a wide viewport
- **THEN** the sidebar occupies 70px as before
- **AND** expanding it returns to 280px

#### Scenario: Drawer keeps the same width on narrow viewports

- **WHEN** the tags drawer opens at or below the mobile breakpoint
- **THEN** the drawer is 280px wide
- **AND** its content fits or wraps inside that width
