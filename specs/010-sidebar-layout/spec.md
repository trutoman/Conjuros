# Feature Specification: Sidebar Tag Filter Layout

**Feature Branch**: `010-sidebar-layout`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "quiero cambiar la manera en que funciona la pagina principal. Ahora react tiene dos estados collection o tags, quiero que ahora el boton tags no regenere todo el panel de collection de nuevo sino que haga aparecen en una transicion corta la columna dde tags que se situara a la izquierda del panel collections."

## Clarifications

### Session 2026-08-01
- Q: How should the user manage tags (create, edit, delete) under the new sidebar layout? → A: Add a "Manage Tags" link at the bottom of the sidebar to navigate to the existing `TagsPage`.
- Q: How should the tags sidebar behave on mobile viewports or narrow screens? → A: Render the sidebar as a temporary slide-over drawer overlaying the collection.
- Q: Should the tag category groups in the sidebar be collapsible, or remain static list sections? → A: Static lists. All categories and tags are always fully visible.
- Q: Should the tags sidebar be open or closed by default when the user first loads the application? → A: Open by default on desktop viewports, closed by default on mobile.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggleable left sidebar for tag filtering (Priority: P1)

As an authenticated user, I can toggle a left sidebar containing tags grouped by category, so that I can filter my collection on the fly without losing the context of my items.

**Why this priority**: Improves retrieval speed and organization by keeping tags visible and interactive alongside the item collection without needing to reload components.

**Independent Test**: The user clicks the "Tags" button, sees a sidebar appear from the left showing tags grouped by category and a match mode selector, checks a tag, and observes the item collection immediately update.

**Acceptance Scenarios**:

1. **Given** a user is viewing the collection, **When** they click the "Tags" button in the topbar, **Then** a sidebar transitions into view on the left, and the collection items list resizes/shifts to the right.
2. **Given** the tags sidebar is open, **When** they click the "Tags" button again, **Then** the sidebar transitions out of view, and the collection items list expands to fill the full width.
3. **Given** the tags sidebar is visible, **When** they inspect the tags, **Then** they see tags grouped by `tagCategory` (first level) and sorted by `tagName` (second level) within each category.
4. **Given** the tags sidebar is visible, **When** they click a tag check-button, **Then** the collection list is filtered by that tag, preserving active search or kind filters.
5. **Given** the tags sidebar is visible, **When** they inspect the sidebar header, **Then** they see the "Match mode" selector (Match all / Match any) aligned to the right of the "Tags" title.
6. **Given** the collection page is loaded, **When** the sidebar layout is active, **Then** the horizontal top `FilterBar` is removed from the interface.

---

### Edge Cases

- **No Tags Available**: If the user has no tags, the sidebar displays an empty message, but the layout and toggle transitions continue to work normally.
- **Responsive Layout**: On narrower viewports, the sidebar should overlay or stack correctly without breaking the two-row card structure of items on the right.
- **State Persistence**: The search query and selection filters must remain active and intact when toggling the sidebar open or closed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Tags" button in the topbar MUST toggle the visibility of the left tags column.
- **FR-002**: Toggling the sidebar MUST perform a short, smooth visual transition (e.g., CSS transition on width/flex/transform).
- **FR-003**: The sidebar MUST render a title "Search" with the match mode selector (label and select dropdown) aligned to its right.
- **FR-004**: The tags in the sidebar MUST be grouped under their respective `tagCategory` headers in alphabetical order, and sorted by `tagName` inside each group.
- **FR-005**: Clicking tags in the sidebar MUST toggle their selection status and update the item collection filter immediately.
- **FR-006**: The horizontal top `FilterBar` component MUST be removed from the page.
- **FR-007**: The sidebar MUST contain a 'Manage Tags' link at the bottom that navigates the user to the existing `TagsPage`.
- **FR-008**: On mobile/narrow viewports, the sidebar MUST behave as a temporary overlay drawer (slide-over layout) with a dark backdrop, rather than pushing the collection list.
- **FR-009**: The categories in the sidebar MUST be displayed as static headers, keeping all tags fully expanded and visible at all times.
- **FR-010**: The sidebar MUST be open by default on desktop viewports and closed by default on mobile viewports on initial load.
- **FR-011**: The tags in the sidebar MUST be styled as filter pills (preserving the colors and backgrounds from the original design) and use a smaller font size (`0.65rem`).
- **FR-012**: The search input MUST contain a magnifying glass icon, a clear text button (✕) visible only when text is entered, and the placeholder "Buscar en título y contenido...".
- **FR-013**: The title of the sidebar column MUST be "Search".

### Key Entities *(include if feature involves data)*

- **Tags Sidebar**: The toggleable column rendering the category-grouped tag checkboxes and filter controls.
- **Category Group**: A visual section in the sidebar containing all tags belonging to a specific category.
- **Filter State**: The active filter criteria (tags selection, search term, item kind) applied to the list query.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.
- The sidebar filter action MUST preserve active keyboard navigation and accessibility standards.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tag checkbox clicks update the filtered list of items within 150ms.
- **SC-002**: Toggling the tags sidebar executes without reloading or regenerating the collection items list component.
- **SC-003**: The tags list in the sidebar is correctly grouped and sorted by category and name.

## Assumptions

- The underlying items filtering queries and state management structures (from `useCollectionFilters` and `useCollection`) are preserved and used by the new sidebar interface.
- No changes to the database schemas or repositories are required.
