## ADDED Requirements

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
