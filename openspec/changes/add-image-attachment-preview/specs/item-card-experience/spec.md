## ADDED Requirements

### Requirement: Image attachment cards show a thumbnail preview

An attachment card SHALL show a thumbnail of its stored image file before the user activates the `View attachment` action. The thumbnail SHALL be constrained to at most 100 pixels on its longest edge, SHALL preserve the image's intrinsic aspect ratio without cropping or stretching, and SHALL be laid out so the card's title, filename, type badge, and actions stay readable. The thumbnail SHALL NOT replace the filename inline content or the existing `View attachment` and `Download attachment` actions.

#### Scenario: Stored image shows a card thumbnail

- **WHEN** a collection contains an attachment item with a stored `image/webp` file
- **THEN** its card shows a thumbnail preview of that image
- **AND** the thumbnail's longest edge is at most 100 pixels
- **AND** the `View attachment` action is still available

#### Scenario: Thumbnail fits the card

- **WHEN** the thumbnail is rendered
- **THEN** it does not overflow the card
- **AND** it does not hide the filename, type badge, description toggle, or item actions

#### Scenario: Thumbnail does not distort the image

- **WHEN** a stored image is not square
- **THEN** the thumbnail preserves its aspect ratio
- **AND** the image is not cropped or stretched

### Requirement: Thumbnail previews are limited to stored images

A card thumbnail SHALL be requested and rendered only when the item is an attachment, has a stored file, and its MIME type is an image type. Attachments without a stored file and attachments storing non-image files SHALL NOT show a thumbnail and SHALL keep their current card layout.

#### Scenario: Non-image attachment has no thumbnail

- **WHEN** an attachment item stores a PDF, spreadsheet, archive, or text file
- **THEN** its card shows no thumbnail preview

#### Scenario: Empty attachment has no thumbnail

- **WHEN** an attachment item has no stored file
- **THEN** its card shows no thumbnail preview
- **AND** its inline content still shows the filename or `No file attached`

### Requirement: Thumbnail failures never block the card

The thumbnail request SHALL use the same authenticated inline preview access as the viewer. If the preview URL cannot be obtained, the card SHALL omit the thumbnail and SHALL keep the item readable and its view, download, edit, and delete actions usable.

#### Scenario: Preview failure leaves the card usable

- **WHEN** the thumbnail preview URL cannot be obtained
- **THEN** the card renders without a thumbnail
- **AND** the filename, `View attachment`, `Download attachment`, and item menu actions still work

#### Scenario: Thumbnail is announced as an image

- **WHEN** a screen reader reaches an image attachment card
- **THEN** the thumbnail is exposed as an image with an accessible name referring to the item or its filename
