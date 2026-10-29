## ADDED Requirements

### Requirement: Image attachment cards keep the thumbnail in the single-row header

An attachment card with a stored image file SHALL render its thumbnail inside the same single header row as the title, inline filename/description, and tags. The thumbnail SHALL be positioned after the inline filename/description box and before the tag list. The card SHALL NOT render the thumbnail as a separate block below the header, and the header row SHALL NOT wrap into multiple rows because of the thumbnail.

#### Scenario: Thumbnail appears between filename and tags

- **WHEN** a collection contains an attachment item with a stored image file
- **THEN** the card shows the thumbnail in the header row
- **AND** the thumbnail is to the right of the inline filename/description box
- **AND** the thumbnail is to the left of the item's tags

#### Scenario: Image attachment card stays on one row

- **WHEN** an attachment item with a stored image file is rendered
- **THEN** the title, inline filename, thumbnail, and tags share one header row
- **AND** no separate preview block appears below the header

#### Scenario: Thumbnail does not overlap or hide tags

- **WHEN** an image attachment card also has tags
- **THEN** the tags remain visible next to the thumbnail
- **AND** the thumbnail does not cover or push the tags outside the card

#### Scenario: Thumbnail sizing leaves the rest of the row readable

- **WHEN** the thumbnail is rendered in the header row
- **THEN** the title, filename/description box, type badge, and item actions remain readable
- **AND** the row does not scroll horizontally

### Requirement: Attachment card thumbnails are capped at 85 pixels

The attachment card thumbnail SHALL be no larger than 85 pixels on its longest edge. The image SHALL preserve its intrinsic aspect ratio without cropping, stretching, or distortion, and smaller images SHALL keep their intrinsic size instead of being enlarged.

#### Scenario: Wide image fits within 85 pixels

- **WHEN** a stored image is wider than it is tall
- **THEN** the thumbnail width is at most 85 pixels
- **AND** its height scales proportionally

#### Scenario: Tall image fits within 85 pixels

- **WHEN** a stored image is taller than it is wide
- **THEN** the thumbnail height is at most 85 pixels
- **AND** its width scales proportionally

#### Scenario: Small image is not enlarged

- **WHEN** a stored image is smaller than 85 pixels on both edges
- **THEN** the thumbnail keeps its intrinsic dimensions

#### Scenario: Thumbnail stays accessible

- **WHEN** a screen reader reaches an image attachment card
- **THEN** the thumbnail is exposed as an image with an accessible name referring to the item or its filename
- **AND** a failed thumbnail request removes the image without breaking the card
