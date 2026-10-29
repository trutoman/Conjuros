## 1. Inline thumbnail placement

- [x] 1.1 Move the attachment thumbnail markup from below the card header into `item-title-row`, between the inline filename/description box and the tags.
- [x] 1.2 Remove the separate below-header preview block so image attachment cards no longer render a second row.
- [x] 1.3 Keep the existing eligibility check, accessible name, lazy loading, and failure fallback unchanged.

## 2. Thumbnail sizing and styles

- [x] 2.1 Change the thumbnail cap from 100 px to 85 px on both axes using `max-width`, `max-height`, and `width: auto; height: auto` with `object-fit: contain`.
- [x] 2.2 Style the preview wrapper as a non-shrinking inline flex item aligned to the row center, removing the former top margin and block layout.
- [x] 2.3 Keep the thumbnail border, radius, and background so it stays visually consistent with the card.

## 3. Tag overflow budget

- [x] 3.1 Subtract the thumbnail reservation (85 px plus the row gap) from the available width passed to the tag overflow calculation for image attachments.
- [x] 3.2 Base the reservation and memo dependencies on preview eligibility rather than the loaded URL so the collapsed tag count stays stable while the image loads.

## 4. Tests

- [x] 4.1 Update the attachment card tests to assert the thumbnail is a child of the title row, after the filename/description box, and before the tags.
- [x] 4.2 Assert image attachment cards have no separate preview block below the header.
- [x] 4.3 Keep coverage for non-image, empty, failed-preview, accessible-name, and view/download behavior.
- [x] 4.4 Add a tag overflow test showing tags collapse to fit when the thumbnail reservation is present.

## 5. Validation

- [x] 5.1 Run `npm run check` and fix any lint, test, or build failures.
- [x] 5.2 Run `openspec validate refine-attachment-card-thumbnail` and confirm the change stays consistent with the implementation.
