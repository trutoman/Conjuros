# Research & Architectural Decisions: Fix Tag Column Icon Layout

## 1. Icon & Toggle Button HTML Structure

- **Decision**: Render topbar Tags toggle button using `<button className="quiet tags-toggle-btn" onClick={...}><span>Tags</span><TagColumnIcon /></button>`.
- **Rationale**: Keeps the markup semantic, clean, and accessible, ensuring the visual label text "Tags" appears above the decorative SVG icon.

## 2. Layout & CSS Alignment

- **Decision**: Apply `display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;` to `.tags-toggle-btn` and `.sidebar-header-title`.
- **Rationale**: Aligns text vertically on top and icon centered directly underneath without distortion or unwanted margins.

## 3. Accessibility & Theme Integration

- **Decision**: Use `aria-hidden="true"` on the SVG icon when inside labelled buttons and inherit theme color via `fill="currentColor"`.
- **Rationale**: Prevents screen reader duplication while maintaining automatic color adaptation in dark/light themes.
