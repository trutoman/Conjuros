## MODIFIED Requirements

### Requirement: Attachment viewer shows metadata without content

The attachment viewer SHALL show the item's description when present and its `filename` when present. It SHALL NOT render a text content body. When the item has a stored file, the viewer SHALL show a `File stored` status and a `Download attachment` action that starts the download; when it has none, the viewer SHALL show a `No file stored yet` status and SHALL NOT offer a download action. The viewer SHALL NOT offer upload, open, or copy actions.

#### Scenario: Viewer shows attachment metadata

- **WHEN** an attachment viewer opens for an item titled `Quarterly report` with description `Q3 results` and filename `report.pdf`
- **THEN** the viewer shows the description `Q3 results`
- **AND** the viewer shows the filename `report.pdf`
- **AND** no text content body is rendered

#### Scenario: Viewer offers the download of a stored file

- **WHEN** an attachment item has a stored file
- **THEN** the viewer shows `File stored`
- **AND** the viewer shows a `Download attachment` action that starts the download

#### Scenario: Viewer reports that no file is stored

- **WHEN** an attachment item has no stored file
- **THEN** the viewer shows `No file stored yet`
- **AND** no download action is shown

#### Scenario: Attachment without metadata still opens

- **WHEN** an attachment item has no description and no filename
- **THEN** the viewer opens with its title and the `No file stored yet` status
- **AND** the viewer does not fail
