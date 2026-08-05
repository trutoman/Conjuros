# Data Model: Search & Filter Sub-Header in Main Content Frame

## UI Component & Layout Entities

### CollectionSubHeader Region
Sub-header container element embedded inside `.main-content-frame` above the collection items.

- **CSS Selector**: `.collection-subheader`
- **Flex Layout (Desktop)**: `display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; width: 100%;`
- **Flex Layout (Mobile <= 650px)**: `flex-direction: column; align-items: stretch; gap: 0.75rem;`
- **Children**: Search Field Box (`.search-field`), Type Selector (`.type-selector-field`)

---

### Search Field Input Box
Search input field with inline search magnifying glass icon and clear button.

- **CSS Selector**: `.collection-subheader .search-field`
- **Flex Growth**: `flex: 1 1 auto; min-width: 0;`
- **Placeholder**: `"Buscar en título y contenido..."`
- **Clear Action**: Resets `filters.search` to empty string `""`

---

### Item Type Selector Field
Dropdown select control filtering collection items by kind (`spell`, `web-link`, or all).

- **CSS Selector**: `.collection-subheader .type-selector-field`
- **Flex Growth**: `flex: 0 0 auto;`
- **Options**: `All types` (`""`), `Spells` (`"spell"`), `Web links` (`"web-link"`)

---

### Tags Sidebar Header
Heading and header region of the tags drawer/sidebar component.

- **CSS Selector**: `.tags-sidebar .sidebar-header`
- **Heading Text**: `"Tags"` (formerly `"Search"`)
- **Included Controls**: Tag Match Mode selector (`Match all` / `Match any`), Sidebar close button (`✕`)
