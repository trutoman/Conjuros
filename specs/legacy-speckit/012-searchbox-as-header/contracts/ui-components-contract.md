# UI Contract: Search & Filter Sub-Header Component Structure

## Component Contract: CollectionSubHeader Props & Elements

```tsx
export interface CollectionSubHeaderProps {
  filters: CollectionFilters;
  onChange: (filters: CollectionFilters) => void;
}
```

### Element Markup Structure

```tsx
<div className="collection-subheader">
  <div className="search-field">
    <svg className="icon search-icon" aria-hidden="true" viewBox="0 -960 960 960">
      <path d="..." />
    </svg>
    <input
      aria-label="Search collection"
      value={filters.search}
      onChange={(e) => onChange({ ...filters, search: e.target.value })}
      placeholder="Buscar en título y contenido..."
    />
    {filters.search && (
      <button
        type="button"
        className="search-clear-button"
        onClick={() => onChange({ ...filters, search: '' })}
        aria-label="Clear search"
      >
        ✕
      </button>
    )}
  </div>
  <label className="type-selector-field">
    <span>Type</span>
    <select
      value={filters.kind ?? ''}
      onChange={(e) =>
        onChange({
          ...filters,
          kind: (e.target.value || undefined) as ItemKind | undefined,
        })
      }
    >
      <option value="">All types</option>
      <option value="spell">Spells</option>
      <option value="web-link">Web links</option>
    </select>
  </label>
</div>
```

### Component Contract: Tags Sidebar Heading Update

In `Sidebar.tsx`:
- Header `<h2>` content MUST be `"Tags"`.
- `.search-field` and `.sidebar-filters-group` MUST NOT be rendered inside `Sidebar.tsx`.
