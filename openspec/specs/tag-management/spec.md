# Tag Management

## Purpose

Lets users organize tags into categories and manage them per user across the collection experience.

## Summary

This capability covers configurable tags, categories, and ownership-scoped tag usage across items.
## Requirements

- Tags must be configurable per user and associated with the relevant collection items.
- Tag categories must be supported where applicable.
- Tag assignment and validation must remain scoped to the current user.
- Tag-based filtering and search behavior must remain consistent with the collection experience.

### Requirement: Add tag form close button

The Add tag form SHALL provide a borderless floating close button displaying an "X" in the top-right corner of the form. Activating it SHALL dismiss the form and return to the collection view, with the same behavior as the Cancel button.

#### Scenario: Closing the Add tag form

- **WHEN** a user activates the close button on the Add tag form
- **THEN** the form closes
- **AND** the collection view is shown again

#### Scenario: Close button equals Cancel behavior

- **WHEN** a user activates the close button instead of the Cancel button
- **THEN** no tag is saved
- **AND** any typed input is discarded
- **AND** the user returns to the collection view

#### Scenario: Accessible close button

- **WHEN** a user using assistive technology reaches the close button
- **THEN** the button is announced with an accessible label identifying it as the close action for the form

### Requirement: Tag management view close button

The tag management view SHALL replace its text back control ("← Collection") with a borderless floating close button displaying an "X" in the top-right corner of the view. Activating it SHALL dismiss the view and return to the collection view, with the same behavior as the replaced back control.

#### Scenario: Closing the tag management view

- **WHEN** a user activates the close button on the tag management view
- **THEN** the view closes
- **AND** the collection view is shown again

#### Scenario: No unsaved data loss on close

- **WHEN** a user activates the close button on the tag management view
- **THEN** no tag is created or modified
- **AND** the user returns to the collection view

#### Scenario: Accessible tag management close button

- **WHEN** a user using assistive technology reaches the close button on the tag management view
- **THEN** the button is announced with an accessible label identifying it as the close action for the tag management view

### Requirement: No inline tag creation entry point in the sidebar

The sidebar footer SHALL NOT provide an "Add tag" button or any other control that opens the tag creation form from the sidebar. Tag creation SHALL be available only from within the tag management view.

#### Scenario: Sidebar footer shows no tag creation control

- **WHEN** a user views the expanded sidebar footer
- **THEN** no button labeled "Add tag" is present
- **AND** the only tag-related action offered is "Manage tags"

#### Scenario: Tags are created from the tag management view

- **WHEN** a user wants to create a tag
- **THEN** they open the tag management view
- **AND** create the tag using the "Add tag" control in the tag management header

### Requirement: Single heading in the tag management view

The tag management view SHALL render exactly one heading: the "Manage tags" heading of the tag management header. The tags panel SHALL NOT render its own "Tags" heading.

#### Scenario: Tag management view displays a single heading

- **WHEN** a user opens the tag management view
- **THEN** the view shows the "Manage tags" heading from the tag management header
- **AND** no separate "Tags" heading is rendered above the tag list

#### Scenario: Accessible heading structure is preserved

- **WHEN** a user using assistive technology navigates the tag management view
- **THEN** the "Manage tags" heading remains the sole heading that labels the tag list

### Requirement: Tag management rows render as pills

In the tag management view, each tag SHALL render as a `tag-filter-pill` styled element using the tag's color for text and border, with a `color-mix` tinted background, consistent with the sidebar and item form pills. Rows SHALL NOT render inline Edit, Delete, Move up, or Move down buttons.

#### Scenario: Tag renders as a colored pill

- **WHEN** a user opens the tag management view with existing tags
- **THEN** each tag renders as a pill using its tag color for text and border
- **AND** no inline Edit, Delete, Move up, or Move down buttons are shown

### Requirement: Tag actions use a dropdown menu

Each tag row in the tag management view SHALL provide the same three-dot dropdown menu used by collection items, exposing Edit and Delete actions. Selecting Edit SHALL open the tag form for that tag; selecting Delete SHALL initiate the existing delete confirmation flow.

#### Scenario: Edit a tag from the dropdown

- **WHEN** a user opens the three-dot menu on a tag row
- **AND** activates the Edit action
- **THEN** the tag form opens for that tag

#### Scenario: Delete a tag from the dropdown

- **WHEN** a user opens the three-dot menu on a tag row
- **AND** activates the Delete action
- **THEN** the delete confirmation dialog opens for that tag

### Requirement: Tag ordering via drag and drop

Tags in the tag management view SHALL be reorderable by dragging and dropping a tag onto another tag, persisting the new order through the existing tag reorder API. The keyboard reorder interaction used by the collection list SHALL also apply to the tag list.

#### Scenario: Reorder a tag by dragging

- **WHEN** a user drags a tag and drops it on another tag in the tag management view
- **THEN** the tag is moved to the dropped position
- **AND** the new order is persisted

#### Scenario: Reorder a tag by keyboard

- **WHEN** a user focuses a tag row in the tag management view
- **AND** presses the same keyboard shortcut used to reorder collection items
- **THEN** the tag moves to the adjacent position
- **AND** the new order is persisted

### Requirement: Tag management search filters by name and category

The tag management view SHALL provide a search box in its header, visually consistent with the collection search field, that filters the visible tags by tag name and tag category as the user types. The search SHALL be case-insensitive and match when the query appears in the tag name or the tag category.

#### Scenario: Search filters tags by name

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's name
- **THEN** only tags whose name or category contains the text remain visible

#### Scenario: Search filters tags by category

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's category but not its name
- **THEN** the tag remains visible

#### Scenario: Clearing the search shows all tags

- **WHEN** a user clears the tag management search box
- **THEN** all tags are visible again

#### Scenario: No matches shows an empty result

- **WHEN** a user types text that matches no tag name or category
- **THEN** the tag list shows no tags

### Requirement: Tag description renders inline

In the tag management view, each tag row SHALL render the tag description on the same line as the tag name, category, and color. When the description overflows the available row width, it SHALL be truncated with an ellipsis rather than wrapping onto a new line.

#### Scenario: Description fits on the tag row

- **WHEN** a tag has a short description
- **THEN** the description renders on the same line as the tag name, category, and color

#### Scenario: Description overflows the tag row

- **WHEN** a tag has a description longer than the available row width
- **THEN** the description is truncated with an ellipsis
- **AND** no new line is introduced in the tag row

#### Scenario: Tag without a description

- **WHEN** a tag has no description
- **THEN** no description element is rendered in the tag row

### Requirement: Tag search box fills the header width

In the tag management header, the tag search box SHALL stretch to fill all available width, matching the layout of the collection search box.

#### Scenario: Tag search box uses available width

- **WHEN** a user opens the tag management view
- **THEN** the tag search box expands to fill the available header space next to the Add tag control

### Requirement: Tag category validation and normalization

Tag categories SHALL follow the same validation and normalization rules as tag names and SHALL additionally resolve through the TagCategory entity. A tag category SHALL only contain alphanumeric characters and dots, SHALL be trimmed of surrounding whitespace, and SHALL be stored lowercased. Every tag create and update SHALL resolve exactly one category: an existing name assigns the tag, an unknown name creates the category first, and an absent or blank value resolves to the `general` category. These rules SHALL apply on every tag create and update. Membership SHALL be persisted in the `TagCategory` entity's `tagIds` set; tag documents SHALL carry no category fields. The category surfaced for a tag SHALL always equal its normalized lowercase, trimmed membership.

#### Scenario: Creating a tag with an uppercase category

- **WHEN** a user creates a tag with the category `Work`
- **THEN** the tag is created with category `work`

#### Scenario: Creating a tag with a mixed-case category

- **WHEN** a user creates a tag with the category `DeV.Ops`
- **THEN** the tag is created with category `dev.ops`

#### Scenario: Creating a tag with surrounding whitespace in the category

- **WHEN** a user creates a tag with the category `  work  `
- **THEN** the tag is created with category `work`

#### Scenario: Creating a tag with an invalid category character

- **WHEN** a user creates a tag with a category containing characters other than alphanumeric characters and dots
- **THEN** the creation is rejected with a validation error

#### Scenario: Editing a tag category is normalized

- **WHEN** a user edits a tag and sets its category to `General`
- **THEN** the tag belongs to the `general` category

#### Scenario: Creating a tag without a category uses general

- **WHEN** a user creates a tag without supplying a category
- **THEN** the tag is created with category `general`
- **AND** the `general` category exists afterwards

### Requirement: Existing tags use normalized lowercase categories

Existing tags whose stored category is not already in normalized lowercase form SHALL resolve to their normalized lowercase category. Tags without a stored category SHALL resolve to the normalized default `general`. On migration, one TagCategory entity SHALL be created per distinct normalized category plus a guaranteed `general` category, so no tag is left without exactly one category. Membership SHALL be persisted in the `TagCategory` entity's `tagIds` set; no tag document SHALL contain the legacy `tagCategory` or `tagCategoryNormalized` fields.

#### Scenario: Legacy tag without a category

- **WHEN** a tag stored without a category is read
- **THEN** its category is surfaced as `general`

#### Scenario: Legacy tag with a capitalized category

- **WHEN** a tag stored with the category `General` is read
- **THEN** its category is surfaced as `general`

#### Scenario: Migration preserves membership

- **WHEN** legacy tags with distinct categories are migrated
- **THEN** each distinct normalized category exists as a TagCategory entity
- **AND** every tag belongs to exactly one of them

#### Scenario: No tag document carries legacy fields

- **WHEN** any tag document is inspected in the database
- **THEN** it contains neither `tagCategory` nor `tagCategoryNormalized`

### Requirement: Lowercase display of tag names and categories

Every frame and component that displays a tag SHALL render the tag name and the tag category in lowercase, regardless of the casing of the underlying stored values.

#### Scenario: Sidebar groups tags by category

- **WHEN** a user opens the sidebar with tags whose categories differ only by casing
- **THEN** the sidebar renders a single category group for the normalized category

#### Scenario: Tag management shows lowercase categories

- **WHEN** a user opens the tag management view
- **THEN** every tag name and category is displayed in lowercase

#### Scenario: Item cards show lowercase tags

- **WHEN** a collection item displays its tags
- **THEN** every displayed tag name is lowercase

#### Scenario: Tag forms show lowercase values

- **WHEN** a tag form is opened for an existing tag
- **THEN** the tag name and category inputs show the lowercase values

### Requirement: Add tag button style and position

The tag management header's "Add tag" control SHALL render as an icon-style button using the same `+` icon used by the collection "Add item" button, instead of plain text. The button SHALL be positioned at the left of the tag management header, before the "Manage tags" heading, and the tag search box SHALL follow after the heading.

#### Scenario: Add tag button uses an add icon

- **WHEN** a user opens the tag management view
- **THEN** the "Add tag" control in the header displays a `+` icon
- **AND** the control does not render a plain text label

#### Scenario: Add tag button is left aligned

- **WHEN** a user opens the tag management view
- **THEN** the "Add tag" button is the first element at the left of the tag management header
- **AND** the "Manage tags" heading appears to its right
- **AND** the tag search box appears after the heading

#### Scenario: Add tag button remains accessible

- **WHEN** a user using assistive technology reaches the "Add tag" control in the tag management header
- **THEN** the control is announced with an accessible label identifying it as the action to add a tag

### Requirement: Tag form and tag management view open as floating modals

The Add tag form, the Edit tag form, and the Manage tags view SHALL open as floating modals over the persistent item list instead of replacing the collection view. The existing Close ("X") and Cancel controls keep their current behavior (dismiss without saving, typed input discarded) and additionally a backdrop click dismisses the modal the same way. The "Add tag" entry point remains inside the Manage tags modal, opening the tag form as a nested modal stacked above it.

#### Scenario: Opening Manage tags keeps the collection list visible

- **WHEN** the user opens "Manage tags"
- **THEN** the tag management view opens as a floating modal
- **AND** the collection subheader and item list remain visible behind it

#### Scenario: Opening Add tag stacks over Manage tags

- **WHEN** the user clicks "Add tag" inside the Manage tags modal
- **THEN** the tag form opens as a nested modal above the Manage tags modal
- **AND** closing the tag form reveals the Manage tags modal unchanged

#### Scenario: Backdrop click discards and reveals the list

- **WHEN** the user clicks outside the Add tag dialog
- **THEN** the form closes without saving the tag
- **AND** any typed input is discarded
- **AND** the underlying view (Manage tags modal or item list) is revealed unchanged

### Requirement: Tags filter clear button deselects all tags

The sidebar tags filter SHALL provide a `clear` button that deselects every currently selected filter tag in one action. The button SHALL be visible at all times, SHALL be disabled while no tag is selected, and SHALL become enabled as soon as one or more tags are selected. Activating the enabled button SHALL clear the entire tag selection; afterwards, while no tag remains selected, the button SHALL return to the disabled state.

#### Scenario: Clear button disabled with no selection

- **WHEN** a user views the tags filter with no tag selected
- **THEN** the `clear` button is visible and disabled

#### Scenario: Selecting a tag enables the clear button

- **WHEN** a user selects one tag in the tags filter
- **THEN** the `clear` button becomes enabled
- **AND** it shows the text "clear" together with the clear icon

#### Scenario: Selecting multiple tags keeps the clear button enabled

- **WHEN** a user selects two or more tags in the tags filter
- **THEN** the `clear` button remains enabled

#### Scenario: Activating clear deselects every tag

- **WHEN** a user activates the enabled `clear` button while one or more tags are selected
- **THEN** every selected tag becomes deselected
- **AND** the collection filter contains no selected tags
- **AND** the `clear` button returns to the disabled state

#### Scenario: Clear button is keyboard operable and announced

- **WHEN** a user using assistive technology reaches the `clear` button
- **THEN** the button is announced with an accessible label identifying it as the action that clears the tag selection
- **AND** it can be activated by keyboard when enabled
- **AND** it cannot be activated while disabled

### Requirement: Tag form forces a single category choice

The tag create and edit forms SHALL require resolving exactly one category. The category input SHALL default to `general` when the user supplies nothing. Submitting a new name SHALL create that category on demand per the `tag-category` capability; submitting an existing name SHALL assign the tag to it. The form SHALL NOT allow saving a tag with zero categories or with more than one category.

#### Scenario: Tag form defaults to general

- **WHEN** a user opens the Add tag form and saves without touching the category field
- **THEN** the tag is created in the `general` category

#### Scenario: Tag form creates an unknown category

- **WHEN** a user types a new category name in the tag form and saves
- **THEN** the category is created
- **AND** the tag is assigned to it

#### Scenario: Editing a tag moves it between categories

- **WHEN** a user edits a tag and changes its category from `general` to `work`
- **THEN** the tag leaves the `general` member set
- **AND** it joins the `work` member set

### Requirement: Empty categories are visible in tag views

The tag management view and the sidebar category grouping SHALL include categories with zero tags. An empty category SHALL render its name with an empty tag set rather than being hidden. Search filtering SHALL still match empty categories by name.

#### Scenario: Management view shows an empty category

- **WHEN** a user opens tag management while category `hobby` has no tags
- **THEN** `hobby` is displayed with zero tags

#### Scenario: Sidebar shows an empty category group

- **WHEN** a user views the sidebar while category `hobby` has no tags
- **THEN** a `hobby` group is rendered with no tag pills inside

#### Scenario: Search matches an empty category

- **WHEN** a user types text matching only an empty category name in tag search
- **THEN** that empty category remains visible

### Requirement: Public tag payloads expose the derived category

Tag API responses SHALL keep exposing the `tagCategory` field, derived from the tag's `TagCategory` membership at read time. Tag list search and sort by category SHALL keep working. No frontend change is required by the storage migration.

#### Scenario: Tag payload still carries its category

- **WHEN** a user reads a tag that belongs to category `work`
- **THEN** the payload contains `tagCategory` with value `work`

#### Scenario: Search by category keeps working

- **WHEN** a user searches tags with text matching only a category name
- **THEN** tags in that category are returned

### Requirement: Manage tags delete failures are scoped to the management view

Failed tag and tag-category deletes initiated from the Manage tags view SHALL surface their error only inside the Manage tags context (the delete confirmation flow or a dismissible management-view error). The main collection list SHALL NOT render Manage tags delete errors, and neither list SHALL render the error as a first-row dashed-frame entry.

#### Scenario: Non-empty category delete fails from Manage tags

- **WHEN** a user confirms deletion of a non-empty category and the backend rejects it with `Tag category is not empty`
- **THEN** the delete confirmation stays open (or an equivalent scoped management-view error is shown)
- **AND** the main collection list shows no new error frame and its items are unchanged
- **AND** the Manage tags list still shows its existing groups and tags with no ghost first entry

#### Scenario: Tag delete failure does not pollute the collection list

- **WHEN** a tag delete initiated from Manage tags fails
- **THEN** the error is shown only in the Manage tags context
- **AND** the main collection list renders no error frame for that failure

#### Scenario: Scoped delete error is dismissible and does not persist

- **WHEN** a scoped delete error is shown
- **THEN** closing the delete dialog (cancel or view close) or completing a subsequent successful delete clears it
- **AND** reopening Manage tags shows no stale `Tag category is not empty` frame

