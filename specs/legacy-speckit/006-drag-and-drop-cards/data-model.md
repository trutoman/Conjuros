# Data Model: Drag-and-Drop Card Reordering

## Entities

### Collection Item

- Represents a user-owned item card (spell or web-link) shown in the collection list.
- Existing fields remain unchanged: `id`, `kind`, `title`, `description`, `tags`, `command`, `url`, `order`, `relatedItemIds`, and timestamps.
- No new persisted field is required for drag-and-drop.

### Collection Order

- Represents the positional sequence of collection items for a single authenticated user.
- Persisted through the existing reorder operation by updating item `order` values.
- Reorder commands must remain user-scoped and ownership-validated by existing backend behavior.

### Reorder Interaction State (UI-only)

- Transient client-side state used only during interaction.
- Suggested attributes in list component state:
  - `draggedItemId` (string | null)
  - `dropTargetItemId` (string | null)
  - `isReorderPending` (boolean)
  - `focusedItemId` (string | null) for keyboard shortcut behavior
- This state is not persisted and is reset after drop success, drop cancel, or failure.

## Relationships

- One authenticated user owns many collection items.
- Collection order is a user-specific ordering over that user's items.
- Reorder interaction state references collection item identifiers and drives a single reorder request at a time.

## Validation Rules

- Drag/drop reorder must not call reorder persistence when origin and target positions are identical.
- Keyboard reorder with `Alt+ArrowUp` and `Alt+ArrowDown` must move exactly one position per action.
- Reorder attempts must maintain valid bounds (cannot move above first position or below last position).
- On failure, the UI must show error feedback and clear transient drag state.
