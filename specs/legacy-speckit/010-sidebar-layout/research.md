# Research - Sidebar Tag Filter Layout

This document research decisions and architectures for the Sidebar Tag Filter Layout.

## Decision 1: Responsive Sidebar Layout and CSS Transition
- **Decision**: Use a CSS Grid layout on the main container (`.app-shell`) with transitions on the sidebar column width.
- **Rationale**: CSS Grid allows the collection items area to dynamically stretch/shrink when the sidebar toggles. For mobile viewports, the sidebar will transition to a `fixed` layout (`position: fixed; z-index: 1000; left: 0; top: 0; height: 100vh;`) with a click-to-dismiss dark backdrop.
- **Alternatives Considered**: 
  - Absolute positioning on all screen sizes: Rejected because it overlays the collection items on desktop rather than resizing them.
  - Flexbox layout: Viable, but CSS Grid offers simpler control over column definitions.

## Decision 2: Tag Grouping Logic in React
- **Decision**: Group tags in-memory using `Array.prototype.reduce` during rendering, memoized using `useMemo`.
- **Rationale**: Since the maximum number of tags is capped at 50 (pagination limit), grouping on the client side is extremely fast (<1ms). Sorting categories alphabetically and tags alphabetically by name satisfies `FR-004` cleanly.
- **Alternatives Considered**:
  - Grouping tags on the backend API: Rejected because the collection filtering expects a flat array of tag definitions, and client-side grouping keeps the API contract simple.

## Decision 3: Top FilterBar Removal & Component Refactoring
- **Decision**: Remove the horizontal `<FilterBar />` entirely and move the match mode selector to the top of the sidebar.
- **Rationale**: Simplifies the collection page UI, decreases vertical clutter, and keeps all filtering controls in one unified sidebar area.
