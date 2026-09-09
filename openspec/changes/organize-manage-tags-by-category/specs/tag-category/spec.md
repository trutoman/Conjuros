## ADDED Requirements

### Requirement: Category groups expose an actions menu

Each category group in the Manage tags view SHALL provide a three-dot dropdown menu following the same interaction and accessibility pattern as the per-tag menu. The menu SHALL expose Rename and Delete actions for the category.

#### Scenario: Opening a category actions menu

- **WHEN** a user activates the three-dot control on a category group
- **THEN** a dropdown menu opens offering Rename and Delete actions for that category

#### Scenario: Renaming a category from the menu

- **WHEN** a user activates the Rename action on a category group
- **THEN** a rename form opens for that category
- **AND** saving moves all member tags to the new name per the existing category lifecycle rules

#### Scenario: Deleting a category from the menu

- **WHEN** a user activates the Delete action on a category group
- **THEN** the existing delete confirmation flow starts for that category
- **AND** confirming deletes it per the existing category lifecycle rules

#### Scenario: Menu follows the tag menu accessibility pattern

- **WHEN** a user using assistive technology reaches a category three-dot control
- **THEN** the control is announced with an accessible label identifying it as the category actions menu
- **AND** its Rename and Delete items are operable by keyboard exactly like the tag menu items

### Requirement: Category menu respects lifecycle protections

The category actions menu SHALL respect the existing `TagCategory` lifecycle rules: the `general` category SHALL NOT offer Rename or Delete actions, and deleting a non-empty category SHALL be rejected with a validation error identifying the category as non-empty. Backend validation failures SHALL be surfaced to the user as an error message without closing the Manage tags view.

#### Scenario: General category offers no destructive actions

- **WHEN** a user opens the actions menu on the `general` category group
- **THEN** no Rename or Delete action is offered

#### Scenario: Deleting a non-empty category is rejected

- **WHEN** a user confirms deletion of a category that contains at least one tag
- **THEN** the request is rejected with a validation error identifying the category as non-empty
- **AND** the category and its tags remain unchanged

#### Scenario: Deleting an empty category succeeds

- **WHEN** a user confirms deletion of a category with zero tags (other than `general`)
- **THEN** the category is deleted
- **AND** its group disappears from the Manage tags view
