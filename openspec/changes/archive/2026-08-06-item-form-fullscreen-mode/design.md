## Context

See proposal.md for motivation. Currently, `CollectionPage.tsx` renders the `ItemForm` as a sibling to `.app-shell-body`, appearing below the collection view in the normal document flow. The main content frame (`.main-content-frame`) contains the collection subheader (with Add Item button, search, and type selector) and conditionally renders `LoadingState`, `ErrorState`, `EmptyState`, or `CollectionList`. The form visibility is controlled by a three-state pattern: `formItem` can be `undefined` (hidden), `null` (create mode), or a `CollectionItem` object (edit mode).

## Goals / Non-Goals

**Goals:**
- Render the form as the sole content inside `.main-content-frame` (replacing both subheader and collection list)
- Toggle between full collection view (subheader + list) and form view within the main frame
- Preserve existing state management pattern (`formItem` state)
- Provide focused form experience without navigation controls visible

**Non-Goals:**
- Changing the form's internal functionality or validation logic
- Adding animation/transitions (keep implementation simple)
- Modifying the sidebar or topbar layout
- Changing how the form communicates with the API

## Decisions

### Decision 1: Conditional rendering within main-content-frame

**Approach:** Move the `ItemForm` rendering logic inside `.main-content-frame`, conditionally showing either the full collection view (subheader + list) OR just the form based on `formItem` state. The subheader and collection list are hidden when the form is active.

**Rationale:**
- Minimal state changes: reuses existing `formItem` state pattern
- No new component abstractions needed
- Clear separation: form takes the entire frame when active
- Maximizes focus on form—no search box or filters as distraction

**Alternative considered:** Keep subheader visible. Rejected because the user requested the form to occupy the entire frame including the subheader area.

### Decision 2: Hide subheader when form is active

**Approach:** The subheader (`.collection-subheader`) is only rendered when `formItem === undefined` (collection view mode). In form mode, it is completely hidden and the form occupies the full frame.

**Rationale:**
- Maximizes available space for the form
- Eliminates confusion (Add Item button wouldn't make sense while already adding an item)
- Clear visual distinction between browse mode and edit mode

**Alternative considered:** Keep subheader visible but disable buttons. Rejected to maximize form space and eliminate visual clutter.

### Decision 3: CSS adjustments for full-frame form layout

**Approach:** Remove the `margin-top: 1.5rem` from `.item-form` and adjust styles so the form fills the entire `.main-content-frame` without the subheader present.

**Rationale:**
- Form should occupy the full available space in the frame
- Existing styles already provide border and background
- Minimal CSS changes needed—just remove external positioning
- Form becomes the primary focus with no competing UI elements

## Risks / Trade-offs

- **Trade-off:** Users can't search or filter while creating/editing an item → **Acceptable:** This is the intended behavior for focus; users can cancel to return to search/filter
- **Trade-off:** Users lose context of what collection they're in (no subheader) → **Acceptable:** Sidebar remains visible showing tag context, and the transition is immediate/reversible
- **Risk:** Form might overflow viewport on small screens → **Mitigation:** Existing form already handles scrolling via CSS; no change needed
