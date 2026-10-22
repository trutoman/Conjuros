## Purpose

Lets users inspect an attachment item's metadata in a read-only panel without rendering or downloading its file, until Supabase Storage support is added.

## ADDED Requirements

### Requirement: Attachment viewer opens from the attachment card

The collection SHALL open a read-only attachment viewer as a floating modal when a user activates the `View attachment` action on an attachment card. The viewer SHALL use the same modal pattern as the markdown and file viewers, closing any other open panel. The viewer header SHALL read `View attachment` and SHALL show the item title next to it.

#### Scenario: View attachment opens the viewer

- **WHEN** a user activates `View attachment` on an attachment card
- **THEN** the attachment viewer opens as a floating modal over the collection
- **AND** the header reads `View attachment` followed by the item title

#### Scenario: Opening the attachment viewer closes other panels

- **WHEN** the attachment viewer opens
- **THEN** no item form, tag form, manage-tags panel, or other item viewer is open at the same time

### Requirement: Attachment viewer shows metadata without content

The attachment viewer SHALL show the item's description when present and its `filename` when present. It SHALL NOT render a text content body and SHALL NOT offer upload, download, open, or copy actions in this phase. When the item has no stored file reference, the viewer SHALL show a `No file stored yet` status.

#### Scenario: Viewer shows attachment metadata

- **WHEN** an attachment viewer opens for an item titled `Quarterly report` with description `Q3 results` and filename `report.pdf`
- **THEN** the viewer shows the description `Q3 results`
- **AND** the viewer shows the filename `report.pdf`
- **AND** no text content body is rendered

#### Scenario: Viewer reports that no file is stored

- **WHEN** an attachment item has no `storagePath`
- **THEN** the viewer shows `No file stored yet`
- **AND** no download or open action is shown

#### Scenario: Attachment without metadata still opens

- **WHEN** an attachment item has no description and no filename
- **THEN** the viewer opens with its title and the `No file stored yet` status
- **AND** the viewer does not fail

### Requirement: Attachment viewer closes and offers editing

The attachment viewer SHALL provide a close control with an accessible label that returns to the collection, and an `Edit` action that opens the attachment item form for the same item.

#### Scenario: Close returns to the collection

- **WHEN** a user activates the attachment viewer close control
- **THEN** the viewer closes
- **AND** the collection list is shown again

#### Scenario: Edit opens the attachment form

- **WHEN** a user activates `Edit` in the attachment viewer
- **THEN** the attachment item form opens for that item
