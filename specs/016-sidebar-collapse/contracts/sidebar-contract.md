# Interface Contract: Sidebar Component & Layout State

**Feature**: 016-sidebar-collapse
**Date**: 2026-08-02

## Sidebar Component Props

```typescript
export interface SidebarProps {
  tags: Tag[];
  filters: CollectionFilters;
  isOpen: boolean;
  onToggleOpen: () => void;
  onChange: (filters: CollectionFilters) => void;
  onNavigateToTags: () => void;
}
```

## Render Rules & Accessibility Attributes

| Element | Class / ID | Attributes when Expanded (`isOpen === true`) | Attributes when Reduced (`isOpen === false`) |
|---|---|---|---|
| Sidebar container | `.app-sidebar` | `.expanded` | `.collapsed` |
| Toggle button | `.tags-toggle-btn` | `aria-expanded="true"`, `aria-controls="tags-sidebar-panel"` | `aria-expanded="false"`, `aria-controls="tags-sidebar-panel"` |
| Inner filter panel | `.sidebar-content` | Visible, in tab focus | `display: none` / unrendered, excluded from tab focus |
