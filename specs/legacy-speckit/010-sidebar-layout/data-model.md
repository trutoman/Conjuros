# Data Model - Sidebar Tag Filter Layout

No new database models, schemas, or MongoDB collection changes are required for this feature. The existing entities (`Tag` and `CollectionItem`) are fully sufficient.

## Key UI State Model (Client-side only)

The feature introduces a UI state model managed inside the client application (`App.tsx` and `CollectionPage.tsx`).

### Sidebar State
- `isSidebarOpen` (boolean): Controls whether the tags sidebar is visible on the screen.
- Default values:
  - Desktop viewports (screen width > 768px): `true` (open).
  - Mobile viewports (screen width <= 768px): `false` (closed).

### Active Filters (Existing, unchanged)
- `search` (string): Search query.
- `kind` (enum: `spell | web-link`): Filter by item kind.
- `tags` (string[]): Selected tags to filter items by.
- `tagFilterMode` (enum: `all | any`): Filtering logic.
