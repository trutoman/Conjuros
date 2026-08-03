# Data Model & UI Components: New Tag Column Icon

## Component Model

### `TagColumnIcon` Component
- **File**: `src/web/components/TagColumnIcon.tsx`
- **Props**:
  - `className?: string` — Optional extra CSS classes
  - `size?: number | string` — Optional size (defaults to `1.2rem` or `24px`)
  - `ariaLabel?: string` — Optional accessible label if standalone (defaults to decorative with `aria-hidden="true"`)
- **SVG Attributes**:
  - `viewBox`: `"0 0 64 64"`
  - `fill`: `"currentColor"`
  - `path`: `"M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z"`

## Layout Models

### Topbar Tags Button
- **Location**: `src/web/pages/CollectionPage.tsx`
- **Structure**:
  ```tsx
  <button className="tags-toggle-btn quiet" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
    <span>Tags</span>
    <TagColumnIcon />
  </button>
  ```
- **CSS Style**:
  ```css
  .tags-toggle-btn {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  ```

### Sidebar Header
- **Location**: `src/web/components/Sidebar.tsx`
- **Structure**:
  ```tsx
  <div className="sidebar-header-title">
    <h2>Tags</h2>
    <TagColumnIcon />
  </div>
  ```
- **CSS Style**:
  ```css
  .sidebar-header-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  ```
