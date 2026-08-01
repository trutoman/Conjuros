# Contract: Item Card Row UI Behavior

## Scope

Defines UI-level behavior contract for one-line/top-row item-card rendering in the collection page.

## Inputs

- `CollectionItem` data from existing shared contracts.
- Optional resolved tag color metadata.
- Existing action handlers (`copy`, `open`, `edit`, `delete`, `reorder`).

## Rendering Contract

### Row Composition

1. Item content text is rendered in the top row.
2. Top-row order places content text between title and tags.
3. Visible row elements remain vertically centered.

### Width-Constrained Behavior

1. Content-text area shrinks first.
2. Content-text area has a minimum target width of 2 rem, with rendered tolerance down to 1.9 rem to account for browser rounding.
3. If additional compression is needed, tags collapse into `+N` indicator.
4. Title and actions remain visible when `+N` is active.

### Hidden-Tag Reveal

1. On pointer hover over `+N`, hidden tags are revealed via tooltip/popover.
2. On keyboard focus on `+N`, hidden tags are revealed via tooltip/popover.
3. On touch-only collapsed row, hidden-tag reveal is not required for this feature.

## Interaction Contract

1. Spell copy action copies exact command text and provides success/failure feedback.
2. Web-link open action requires explicit user trigger.
3. Edit, delete, and reorder actions remain available and usable.
4. Existing ownership boundaries and authorization behavior remain unchanged.

## Accessibility Contract

1. Keyboard navigation must reach row actions and `+N` indicator.
2. Focus visibility must be preserved for interactive elements.
3. Hover-only behavior must have keyboard-focus equivalence for hidden-tag reveal.

## Out of Scope

- API payload changes
- Database schema changes
- Touch-only hidden-tag reveal interaction in collapsed rows
