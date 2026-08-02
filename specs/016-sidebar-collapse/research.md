# Phase 0 Research: Sidebar Collapse & Expand Mechanics

**Feature**: 016-sidebar-collapse
**Date**: 2026-08-02

## Technical Research & Key Decisions

### 1. Single Sidebar Toggle Button Strategy

- **Decision**: Remove the `tags-toggle-btn` from the topbar (`CollectionPage.tsx`) and consolidate all toggling into a single `tags-toggle-btn` inside the sidebar header (`Sidebar.tsx`).
- **Rationale**: Meets FR-006 and FR-007, avoiding duplicate toggle controls and ensuring the toggle button remains visible both when expanded and when reduced to the compact toggle column.
- **Alternatives Considered**: Keeping dual toggle buttons (rejected per FR-006 explicit mandate).

### 2. Reduced Sidebar CSS & Layout Transition

- **Decision**: In the `collapsed` (reduced) state, set `.tags-sidebar` width to fit only the toggle button (`width: fit-content` / `padding: 0.35rem`) and set `display: none` on the inner filter contents (`.sidebar-header-right`, category list, `TagMatchToggle`, tags list).
- **Rationale**: Fulfills FR-008 and the clarified requirement (Option A). Using `display: none` on inner elements ensures they are completely excluded from the browser accessibility tree and tab order when reduced.
- **Alternatives Considered**: CSS overflow masking with `visibility: hidden` (rejected to ensure clean focus isolation without needing manual `tabIndex={-1}` attributes on all inner tags).

### 3. LocalStorage Persistence & Initialization

- **Decision**: Persist `isSidebarOpen` (boolean) in browser `localStorage` under key `conjuros_sidebar_open`. Initialize state using a lazy initializer in `useState(() => localStorage.getItem('conjuros_sidebar_open') !== 'false')`.
- **Rationale**: Simple, zero-dependency browser persistence adhering to FR-004. Defaulting to `true` (expanded) unless explicitly stored as `'false'`.

### 4. Accessibility (`aria-expanded` and Keyboard `Escape`)

- **Decision**: Add `aria-expanded={isSidebarOpen}` and `aria-controls="tags-sidebar-panel"` to `TagColumnIcon` / `tags-toggle-btn`. Add an `onKeyDown` listener for the `Escape` key inside `.tags-sidebar` to reduce the sidebar when focused.
- **Rationale**: Complies with FR-002, FR-003, and WCAG accessibility standards.
