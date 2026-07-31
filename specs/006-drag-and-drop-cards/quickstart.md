# Quickstart: Drag-and-Drop Card Reordering

## Prerequisites

- Node.js 20 or compatible runtime
- Dependencies installed with `npm install`
- Local app running with `npm run dev`
- Authenticated user with at least three collection items

## Validation Scenarios

1. Open the collection page and verify item-card rows do not show up/down arrow buttons.
2. Drag the third card and drop it above the first card; verify the visible order updates immediately.
3. Refresh the page and verify the reordered position persists.
4. Focus a card row, press `Alt+ArrowUp`, and verify it moves up by one position while focus remains on the moved row.
5. Focus a card row, press `Alt+ArrowDown`, and verify it moves down by one position while focus remains on the moved row.
6. Drag a card and drop it back to its original position; verify no reorder request side effect and no visible order change.
7. Simulate reorder failure (mock/network failure) and verify a user-visible error message appears while the UI remains usable.

## Test Commands

- `npm run test -- src/web/components/__tests__/CollectionList.test.tsx`
- `npm run test -- src/web/pages/__tests__/CollectionPage.test.tsx`
- `npm run check`

## Expected Result

The collection list uses drag-and-drop as the primary reorder mechanism, arrow controls are removed, keyboard reordering via `Alt+ArrowUp` and `Alt+ArrowDown` works, and ordering persists through the existing API flow.
