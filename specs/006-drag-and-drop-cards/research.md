# Research: Drag-and-Drop Card Reordering

## Decisions

- Replace the arrow-based reorder UI with drag-and-drop interactions directly on each collection row.
- Keep reorder persistence through the existing `onReorder(id, order)` flow used by `CollectionPage` and `useCollection`.
- Implement keyboard reordering with `Alt+ArrowUp` and `Alt+ArrowDown` on the focused draggable card row.
- Keep the implementation in existing React components and CSS, without backend or shared contract shape changes.

## Rationale

The current collection list already has reorder persistence and item ownership protections through the existing API layer. This feature is an interaction redesign, so the lowest-risk path is to replace the visual/interaction layer while preserving the same data mutation entry points.

Using direct drag-and-drop on rows removes redundant controls and keeps ordering intuitive. Adding the agreed keyboard shortcut preserves accessibility requirements after removing visible up/down buttons.

## Alternatives considered

- Keep arrows and add drag-and-drop in parallel: rejected because the spec requires complete removal of arrow controls.
- Introduce a new backend reorder endpoint: rejected because existing reorder operations already persist order and enforce ownership.
- Use pointer-only drag-and-drop with no keyboard support: rejected because the specification requires a keyboard-accessible reorder path.
