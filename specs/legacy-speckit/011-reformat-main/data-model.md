# Data Model: Boxed Application Shell & Layout Reformat

## UI Layout Entities

### AppShell Container
Container element wrapping all page sections (topbar, navigation, collection area, auxiliary panels).

- **CSS Selector**: `.app-shell`
- **Max Width (Desktop)**: `1440px` (bounded within 1400px–1600px range)
- **Margin**: `0 auto` (horizontally centered)
- **Padding (Desktop)**: `2rem 0 4rem`
- **Padding (Mobile <= 650px)**: `1rem 0` with width `min(100% - 1rem, 1120px)`

---

### Sidebar Layout Region
Collapsible tags/search panel embedded in normal layout flow.

- **CSS Selector**: `.app-sidebar`
- **Visibility State**: `expanded` | `collapsed`
- **Expanded Width**: `260px` (or `min(260px, 100%)`)
- **Collapsed Width**: `0px` (`overflow: hidden`)
- **Transition**: `max-width 200ms ease, opacity 150ms ease`
- **Flow Mode**: In-flow flex/grid item (non-floating)

---

### Main Collection Frame
Primary grid region displaying spell and web-link item cards.

- **CSS Selector**: `.main-content-frame`
- **Grid Layout**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;`
- **Behavior**: Smoothly expands to fill remaining space within `.app-shell` when sidebar collapses without displacing card contents.

---

### Log Panel Frame
Optional activity/log column rendered within container bounds.

- **CSS Selector**: `.log-panel-frame`
- **Flow Mode**: In-bounds panel within `.app-shell` flex container
- **Placement**: Right side of `.main-content-frame` within centered shell
