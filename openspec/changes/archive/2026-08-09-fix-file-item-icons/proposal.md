## Why

The `file` item kind added by `add-file-item-type` renders three incorrect icons in the item card: the card badge uses a wrong glyph (it merges the markdown glyph with an ad-hoc document path), and the "View file" and "Download file" action icons differ from the exact icons the `markdown` item uses for its equivalent "View markdown" and "Download markdown" actions. Users get a visually inconsistent card row for `file` items.

## What Changes

- `src/web/components/ItemCard.tsx`: replace the `file` badge icon with the exact document-page glyph provided by the user (24x24, `viewBox="0 -960 960 960"`), removing the merged markdown/document path that is currently there.
- Use exactly the same SVG paths as the `markdown` item for the file card's action buttons:
  - "View file" renders the identical eye icon used by "View markdown".
  - "Download file" renders the identical download icon used by "Download markdown".
- No label, aria-label, interaction, or styling changes; only the three icon path(s) change.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `item-card-experience`: The card icon rendering REQUIREMENT is updated so a `file` item's badge uses the exact user-provided document-page glyph and its "View file" and "Download file" action buttons use the exact same SVGs as the `markdown` card's "View markdown" and "Download markdown" buttons.

## Impact

- `src/web/components/ItemCard.tsx`: only the three `Icon` path values for the file badge and the two file action buttons (plus viewBox consistency). No logic changes, no schema changes, no API changes.
- Tests: update/extend `src/web/components/__tests__/ItemCard.test.tsx` file assertions where the icon path identity matters (all existing behavior tests remain valid since aria-labels are unchanged).
- No backend, repository, or contract changes.