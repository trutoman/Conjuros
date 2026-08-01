# Data Model: Top-Row Item Text Placement

## Scope

This feature introduces presentation-state changes for item-card rows. Persistent domain entities remain unchanged.

## Domain Entities (Existing, Reused)

### CollectionItem

- Source: shared contracts (`packages/contracts/src/items.ts`)
- Key fields used by this feature:
  - `id`
  - `kind` (`spell` or `web-link`)
  - `title`
  - `command` / `url`
  - `tags`
  - `description`
  - `order`
- Validation: unchanged and enforced by existing contract schemas.

### Tag

- Source: shared contracts (`packages/contracts/src/tags.ts` and item tag references)
- Key fields used by this feature:
  - `tagName`
  - `color`
- Validation: unchanged; tag normalization and catalog constraints remain existing behavior.

## Presentation-State Entities (New UI-level Concepts)

### TopRowSegment

- Description: Composed row area containing title, inline content text, tag region, and actions.
- Invariants:
  - Content text is positioned between title and tags.
  - Visible elements stay vertically centered.

### ContentTextAreaState

- Description: Width behavior for inline item content text.
- Attributes:
  - `isShrinking` (derived)
  - `minWidth` (target ~2 rem)
- Invariants:
  - Shrinks before non-content elements.
  - Must not shrink below minimum threshold.

### TagOverflowState

- Description: Overflow representation when row width remains constrained after content-text minimum.
- Attributes:
  - `collapsedCount` (number of hidden tags)
  - `indicatorLabel` (`+N`)
  - `revealMode` (`hover` | `focus`)
- Invariants:
  - Title and actions remain visible when tags collapse.
  - Hidden-tag reveal is required for pointer hover and keyboard focus.
  - Hidden-tag reveal is not required on touch-only collapsed rows.

## State Transitions

1. Normal width:

- Full tags visible, content text in top row, no overflow indicator.

2. Constrained width phase 1:

- Content text area shrinks toward minimum width.

3. Constrained width phase 2:

- If more space is needed after minimum width, tags collapse into `+N` indicator.

4. Interaction reveal:

- Pointer hover or keyboard focus on `+N` reveals hidden tags.

## Persistence Impact

- No database schema changes.
- No API request/response shape changes.
- No contract-version changes expected.
