# Spec Delta

## ADDED Requirements

### Requirement: Pagination row centers the counter and controls

The pagination row SHALL present the range counter and the page controls as a single group centered horizontally within the collection content column. The counter SHALL render first and the `Previous`, `Next`, and `Last` controls SHALL follow immediately to its right, separated by a consistent gap. Centering SHALL survive the narrow-viewport wrap and SHALL NOT depend on which controls are enabled.

#### Scenario: Group is centered in the content column

- **WHEN** a user views the collection on a wide viewport
- **THEN** the counter and the page controls form one group centered within the list's width
- **AND** the free space before the counter equals the free space after the last control

#### Scenario: Counter comes before the controls

- **WHEN** a user reads the pagination row from left to right
- **THEN** the range counter appears first
- **AND** the `Previous`, `Next`, and `Last` controls follow to its right

#### Scenario: Wrapped group stays centered

- **WHEN** a narrow viewport forces the counter and the controls onto separate lines
- **THEN** both lines stay centered in the content column

#### Scenario: Disabled controls do not break the alignment

- **WHEN** the user is on the first page and `Previous` and `Last` are disabled
- **THEN** the group stays centered with the counter still first
