## ADDED Requirements

### Requirement: Manage tags groups tags by category

The Manage tags view SHALL render tags grouped by category, mirroring the sidebar category grouping, instead of a flat tag list. Each group SHALL show the category name with exactly the tags belonging to that category. Categories SHALL be ordered alphabetically (lowercase comparison) and tags within each group SHALL follow the persisted tag order.

#### Scenario: Tags are grouped under their category

- **WHEN** a user opens Manage tags with tags in categories `work` and `hobby`
- **THEN** a `work` group lists exactly the `work` tags
- **AND** a `hobby` group lists exactly the `hobby` tags
- **AND** no flat ungrouped tag list is rendered

#### Scenario: Groups follow sidebar ordering

- **WHEN** a user opens Manage tags with several categories
- **THEN** the groups appear in the same alphabetical category order used by the sidebar

#### Scenario: Tag rows keep their existing behavior inside groups

- **WHEN** a user views a tag inside a category group
- **THEN** the tag renders as the same pill with inline description truncation as before
- **AND** its three-dot Edit/Delete menu keeps working
- **AND** drag-and-drop plus keyboard reorder keep persisting through the existing tag reorder API

### Requirement: Category group header layout

Each category group SHALL render the category name left-aligned as the group header, with the group's tags stacked vertically beneath it and aligned to the right, mirroring the sidebar's group presentation.

#### Scenario: Group name is left-aligned with tags below

- **WHEN** a user opens Manage tags
- **THEN** each group shows its category name aligned to the left
- **AND** its tags are stacked vertically below the name, aligned to the right

#### Scenario: Category names render lowercase

- **WHEN** a user opens Manage tags
- **THEN** every group name is displayed in lowercase, consistent with the sidebar and existing tag views

### Requirement: Search filters category groups

Searching in Manage tags SHALL narrow the visible category groups: a group remains visible only when its category name matches the query or when at least one of its tags matches by name or category. Groups with no match SHALL be hidden.

#### Scenario: Search matches a category name

- **WHEN** a user types text matching a category name in the Manage tags search box
- **THEN** that category group remains visible with its matching tags

#### Scenario: Search hides non-matching groups

- **WHEN** a user types text matching neither a category name nor any of its tags
- **THEN** that category group is hidden

#### Scenario: Clearing the search restores all groups

- **WHEN** a user clears the Manage tags search box
- **THEN** all category groups are visible again

## MODIFIED Requirements

### Requirement: Empty categories are visible in tag views

The tag management view and the sidebar category grouping SHALL include categories with zero tags. In the tag management view an empty category SHALL render as a category group showing its name with zero tags beneath it, in the same grouped list as non-empty categories, rather than in a separate section. An empty category SHALL never be hidden for having no tags. Search filtering SHALL still match empty categories by name.

#### Scenario: Management view shows an empty category

- **WHEN** a user opens tag management while category `hobby` has no tags
- **THEN** `hobby` is displayed as a group with zero tags in the same grouped list

#### Scenario: Sidebar shows an empty category group

- **WHEN** a user views the sidebar while category `hobby` has no tags
- **THEN** a `hobby` group is rendered with no tag pills inside

#### Scenario: Search matches an empty category

- **WHEN** a user types text matching only an empty category name in tag search
- **THEN** that empty category remains visible
