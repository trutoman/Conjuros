# Data Model & UI Components: Fix Tag Column Icon Layout

## Component Model

### `TagColumnIcon` Component
- **File**: `src/web/components/TagColumnIcon.tsx`
- **Props**:
  - `className?: string` — Extra styling classes (defaults to `""`)
  - `size?: number | string` — Sizing in pixels or CSS units (defaults to `18`)
  - `ariaLabel?: string` — Accessible label if standalone
- **SVG Structure**:
  ```tsx
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="currentColor"
    className={`tag-column-icon ${className}`.trim()}
    {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-hidden': 'true' })}
  >
    <path d="M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z" />
  </svg>
  ```

## UI Layout Models

### Topbar Toggle Button
- **Location**: `src/web/pages/CollectionPage.tsx`
- **Markup**:
  ```tsx
  <button className="quiet tags-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
    <span>Tags</span>
    <TagColumnIcon />
  </button>
  ```

### Sidebar Header Title
- **Location**: `src/web/components/Sidebar.tsx`
- **Markup**:
  ```tsx
  <div className="sidebar-header-title">
    <h2>Tags</h2>
    <TagColumnIcon />
  </div>
  ```
