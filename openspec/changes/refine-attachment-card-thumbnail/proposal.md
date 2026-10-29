## Why

The image thumbnail currently sits on its own block below the attachment card header, so image attachments take two rows instead of matching the compact single-row rhythm of the collection. The preview is also larger than it needs to be next to the filename and tags.

## What Changes

- Move the attachment thumbnail into the card's single header row: after the inline filename/description box and before the tag list.
- Remove the separate preview block below the header so the card keeps its one-row layout.
- Resize the thumbnail to a maximum of 85 pixels on its longest edge, still preserving the intrinsic aspect ratio without cropping or stretching.
- Account for the thumbnail width when calculating tag overflow, so tags continue to fit instead of being clipped or overlapping the image.
- Keep the existing eligibility rules (stored image attachments only), accessible name, lazy loading, silent failure fallback, and the view/download actions unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `item-card-experience`: image attachment cards keep the thumbnail inside the single-row header, positioned after the inline filename/description and before the tags, capped at 85 px on the longest edge.

## Impact

- `src/web/components/ItemCard.tsx`: thumbnail moves into the title row and the tag overflow budget reserves its width.
- `src/web/index.css`: thumbnail sizing and inline placement replace the block-level preview styles.
- `src/web/components/__tests__/ItemCard.test.tsx`: layout and sizing expectations for the thumbnail.
- No API, contract, database, or storage changes.
- This refines the thumbnail behavior introduced by the still-unarchived `add-image-attachment-preview` change; it should be archived after that change.
