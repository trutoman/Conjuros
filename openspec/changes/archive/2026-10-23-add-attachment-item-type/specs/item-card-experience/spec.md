## ADDED Requirements

### Requirement: Attachment cards show file metadata and a view action

An item card for an `attachment` item SHALL display an `Attachment` type badge using the `attachment` icon asset and SHALL show a single-line inline representation of the item's `filename`, falling back to `No file attached` when no filename is set. It SHALL keep the same single-row layout as the other item kinds and SHALL keep the description accordion available when a description exists. The card SHALL offer a `View attachment` action in the item-actions row using the same eye icon as the other view actions, and SHALL NOT offer `Copy command`, `Open link`, `Download markdown`, or `Download file` actions.

#### Scenario: Attachment card shows the badge and filename

- **WHEN** a collection contains an `attachment` item with the filename `report.pdf`
- **THEN** its card shows an `Attachment` type badge
- **AND** the badge renders the `attachment` icon asset
- **AND** the inline content shows `report.pdf`

#### Scenario: Attachment card without a filename

- **WHEN** an attachment item has no `filename`
- **THEN** the card inline content shows `No file attached`

#### Scenario: View attachment opens the viewer

- **WHEN** a user activates the `View attachment` action on an attachment card
- **THEN** the attachment viewer opens for that item

#### Scenario: Attachment card omits text and download actions

- **WHEN** a user inspects the item-actions row of an attachment card
- **THEN** no `Copy command`, `Open link`, `Download markdown`, or `Download file` action is shown
- **AND** the `View attachment` and item menu actions are shown

#### Scenario: Attachment description can be expanded

- **WHEN** an attachment item has a description
- **THEN** the card shows the description accordion trigger
- **AND** activating it reveals the description
