# Reorder Interaction Contract

## Overview

This contract defines the user-facing behavior for collection item reordering after removing arrow-based controls.

## Rendering Contract

- Item-card rows are rendered as reorderable targets.
- Up/down arrow controls are not rendered anywhere in item-card rows.
- Dragging state and drop target state must have visible UI feedback.

## Interaction Contract

- Pointer interaction:
  - User can drag one item-card row and drop it at a new target position.
  - Dropping into a different position triggers exactly one reorder request.
  - Dropping into the same position triggers no reorder request.
- Keyboard interaction:
  - With card row focus, `Alt+ArrowUp` moves the card up by one position.
  - With card row focus, `Alt+ArrowDown` moves the card down by one position.
  - Focus remains on the moved row after each keyboard reorder action.
  - Out-of-bounds keyboard moves are ignored safely.
- Failure handling:
  - Reorder failures surface a visible error message.
  - Interaction state resets so users can retry immediately.

## Persistence Contract

- Reorder persistence uses existing `onReorder(id, order)` integration.
- No public API shape changes are introduced by this feature.
