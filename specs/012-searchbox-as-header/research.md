# Research: Search & Filter Sub-Header in Main Content Frame

## Research Topic 1: Sub-Header Component Architecture & Positioning

### Decision
Extract the search input box and item type selector into a dedicated sub-header container (`.collection-subheader`) placed directly inside `.main-content-frame` above the collection list/empty states in `CollectionPage.tsx`.

### Rationale
- Locates search and type controls directly in the main viewport flow where items are rendered.
- Maintains single source of truth for filter state via the existing `useCollectionFilters()` hook without adding redundant state wrappers.
- Keeps `Sidebar.tsx` cleanly focused on tag management and tag filter pills.

### Alternatives Considered
- **Leaving filters inside topbar header**: Rejected because topbar houses app-level branding, auth widget, and theme toggle. Adding content search into topbar clutters app navigation.
- **Floating search toolbar**: Displaces card grid and breaks static boxed container flow.

---

## Research Topic 2: Responsive Flex Sub-Header Layout & Stacking Rules

### Decision
Use CSS Flexbox (`display: flex; gap: 1rem; align-items: center;`) for `.collection-subheader` on desktop viewports, with search input `flex: 1 1 auto` and type dropdown `flex: 0 0 auto`. Apply `@media (max-width: 650px)` stacking rule (`flex-direction: column; align-items: stretch;`).

### Rationale
- On desktop (> 650px), search input box dynamically expands to occupy all available space while type selector stays neatly aligned to the right edge.
- On mobile (<= 650px), stacking into 2 full-width rows provides full-width search input and comfortable 44px+ touch targets for dropdown selects.

### Alternatives Considered
- **Strict CSS Grid layout**: Flexbox handles dynamic 1-row to 2-row transitions with fewer rules and better cross-browser line wrapping.

---

## Research Topic 3: Tags Sidebar Header & Content Cleanup

### Decision
Update `Sidebar.tsx` header text from `"Search"` to `"Tags"` and remove `.search-field` and `.inline-label` (type filter selector) from `Sidebar.tsx`.

### Rationale
- Resolves terminology mismatch (sidebar heading said "Search" while primarily holding tag filters).
- Eliminates duplicate controls.
