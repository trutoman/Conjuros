# Research: Boxed Application Shell & Layout Reformat

## Research Topic 1: Centered Boxed AppShell Layout Pattern

### Decision
Re-establish `.app-shell` as the central boxed container with `width: min(1440px, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 4rem;`.

### Rationale
- Restricts content spreading on wide desktop displays (> 1600px) to prevent long line lengths and sparse grid layouts.
- Preserves consistent 1rem padding buffer on mobile screens (`@media (max-width: 650px) { width: min(100% - 1rem, 1120px); padding-top: 1rem; }`).
- Keeps outer margins symmetrical while maintaining inner layout structure.

### Alternatives Considered
- **Full-bleed fluid layout**: Rejected because expanding across 1920px+ viewports breaks grid density and causes visual disconnect between topbar elements and items.
- **Fixed 1120px container**: Too narrow for multi-column layouts when sidebar and log panels are simultaneously visible. 1440px provides ideal balance for boxed multi-column layouts.

---

## Research Topic 2: In-Flow Collapsible Sidebar Grid Stability

### Decision
Use in-flow flex container (`display: flex; gap: 1.5rem;`) or CSS Grid layout (`grid-template-columns: auto 1fr auto`) for `.app-shell-body` containing the sidebar, main content area, and optional log column.

### Rationale
- Setting sidebar `width`, `max-width`, and `opacity` with `transition: max-width 200ms ease, opacity 150ms ease` allows the sidebar to collapse smoothly without taking elements out of the normal layout flow.
- Cards in `.collection-grid` continue using `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` within the expanding main content area without re-rendering or jumping position.

### Alternatives Considered
- **Absolute / Fixed Overlay Drawer**: Rejected per spec requirement (sidebar must be part of the container layout, not a floating panel).
- **Hardcoded pixel column widths**: Rigid and breaks responsiveness on intermediate screen sizes.

---

## Research Topic 3: Auxiliary Log Panel Layout

### Decision
Include the log column inside `.app-shell-body` as a third collapsible panel bounded by the `app-shell` max-width.

### Rationale
- Prevents the log panel from expanding outside the `app-shell` max-width boundaries.
- Maintains visual symmetry with sidebar collapse state.

### Alternatives Considered
- **Modal dialog / drawer overlay**: Displaces focus from the main collection. Keeping log in-bounds respects the boxed shell structure.
