## ADDED Requirements

### Requirement: Image attachments render inside the viewer

When the attachment viewer opens for an attachment item that has a stored file with an image MIME type, the viewer SHALL request an inline preview URL and render the image inside a preview frame on the same surface as the other viewer content panes, using the viewer's existing border, background, radius, and spacing treatment. The viewer SHALL preserve the normal header, filename, description, status, download, and edit affordances.

#### Scenario: Opening an image attachment shows the image

- **WHEN** a user opens the viewer for an attachment storing a PNG file
- **THEN** the viewer renders the image inside the preview frame
- **AND** the header, filename, and `Download attachment` action remain available

#### Scenario: Non-image attachments keep the metadata view

- **WHEN** a user opens the viewer for an attachment storing a PDF or for an attachment with no stored file
- **THEN** no image preview frame is rendered
- **AND** the existing `File stored` or `No file stored yet` status is shown

### Requirement: Image preview fits the screen without overflowing

The rendered image SHALL be scaled to fit within the available viewport, constrained by both the viewport width and height, and SHALL never be cropped or cause the page or viewer to scroll horizontally. The full image SHALL be visible while preserving its intrinsic aspect ratio, and the frame SHALL shrink around smaller images instead of stretching them.

#### Scenario: Large images are bounded by the viewport

- **WHEN** the viewer opens an image wider and taller than the screen
- **THEN** the image is scaled down to fit inside the screen area
- **AND** the whole image remains visible without cropping or horizontal scrolling

#### Scenario: Small images are not stretched

- **WHEN** the viewer opens an image smaller than the maximum available area
- **THEN** the image keeps its intrinsic size and aspect ratio

#### Scenario: Portrait and landscape images both fit

- **WHEN** the viewer opens a tall portrait image
- **THEN** its height is limited by the available screen height
- **AND** when it opens a wide landscape image its width is limited by the available screen width

### Requirement: Image preview reports loading and failure

While the inline preview URL is being requested, the viewer SHALL show a loading status in place of the image. If the preview cannot be obtained, the viewer SHALL show an error message and SHALL keep the item metadata and `Download attachment` action usable.

#### Scenario: Loading status is shown before the image

- **WHEN** the viewer opens for a stored image and the preview URL is still pending
- **THEN** the viewer shows a loading status
- **AND** the image appears once the URL is available

#### Scenario: Preview failure does not break the viewer

- **WHEN** requesting the inline preview URL fails
- **THEN** the viewer shows an error message
- **AND** the filename, status, download, and edit affordances remain usable

### Requirement: The image viewer dismisses on backdrop click

The image preview SHALL open as a floating modal. Activating the modal backdrop or pressing Escape SHALL close it and return to the collection, in addition to the existing close control.

#### Scenario: Backdrop click closes the image viewer

- **WHEN** an image attachment viewer is open
- **AND** the user clicks the backdrop outside the viewer panel
- **THEN** the viewer closes
- **AND** the collection list is shown again

#### Scenario: Escape closes the image viewer

- **WHEN** an image attachment viewer is open
- **AND** the user presses Escape
- **THEN** the viewer closes
