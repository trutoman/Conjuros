## ADDED Requirements

### Requirement: Category blocks follow their persisted order

The tag management view SHALL list category blocks sorted by the category `order` ascending (lowest value first), the same criterion used for collection items. Tags without a persisted category SHALL appear after ordered categories.

#### Scenario: Categories render by order

- **WHEN** a user has categories with orders 1, 2 and 3
- **THEN** the tag management view shows them in that sequence, regardless of their names

### Requirement: Tag category ordering via drag and drop

Users SHALL be able to reorder category blocks in the tag management view by dragging a block's title and dropping it above or below another block. The new position SHALL be persisted through the existing tag category reorder API, and the other categories SHALL be renumbered consistently. Keyboard reordering equivalent to the tag list SHALL also be available on the category title.

#### Scenario: Drag a category block down

- **WHEN** a user drags the title of a category block and drops it onto a lower block
- **THEN** the category takes the dropped position
- **AND** the new order is persisted and the other categories are renumbered

#### Scenario: Drag a category block up

- **WHEN** a user drags the title of a category block and drops it onto a higher block
- **THEN** the category is placed at that position and the new order is persisted

#### Scenario: Reorder failure

- **WHEN** persisting a category move fails
- **THEN** the view shows an error and the previous order is restored

#### Scenario: Cross-user access

- **WHEN** a user attempts to reorder a category owned by another user
- **THEN** the API responds 404 and nothing changes

### Requirement: Tag management typography

In the tag management view, category titles SHALL use a font size of `1rem` and tag pills SHALL use a font size of `0.7rem`.

#### Scenario: Font sizes

- **WHEN** the tag management view is rendered
- **THEN** category titles compute to `1rem` and tag pills to `0.7rem`
