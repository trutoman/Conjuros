import { useMemo } from 'react';
import type { Tag, ItemKind } from '@conjuros/contracts';
import type { CollectionFilters } from '../hooks/useCollectionFilters';

export function Sidebar({
  tags,
  filters,
  onChange,
  onNavigateToTags,
  onClose,
}: {
  tags: Tag[];
  filters: CollectionFilters;
  onChange: (filters: CollectionFilters) => void;
  onNavigateToTags: () => void;
  onClose: () => void;
}) {
  const groupedCategories = useMemo(() => {
    const grouped: Record<string, Tag[]> = {};
    for (const tag of tags) {
      const category = tag.tagCategory || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(tag);
    }
    const sortedCategoryNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    for (const catName of sortedCategoryNames) {
      grouped[catName].sort((a, b) => a.tagName.localeCompare(b.tagName));
    }
    return { names: sortedCategoryNames, tagsMap: grouped };
  }, [tags]);

  return (
    <aside className="tags-sidebar" aria-label="Tags filter panel">
      <div className="sidebar-header">
        <h2>Search</h2>
        <div className="sidebar-header-right">
          <label className="match-mode-selector" aria-label="Tag match mode">
            <span>Match</span>
            <select
              value={filters.tagFilterMode}
              onChange={(event) =>
                onChange({
                  ...filters,
                  tagFilterMode: event.target.value as 'all' | 'any',
                })
              }
            >
              <option value="all">Match all</option>
              <option value="any">Match any</option>
            </select>
          </label>
          <button className="sidebar-close quiet" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-filters-group">
          <div className="search-field">
            <svg
              className="icon icon-filled search-icon"
              role="img"
              aria-hidden="true"
              viewBox="0 -960 960 960"
              focusable="false"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            <input
              aria-label="Search collection"
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
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
          <label className="inline-label">
            Type
            <select
              value={filters.kind ?? ''}
              onChange={(event) =>
                onChange({
                  ...filters,
                  kind: (event.target.value || undefined) as ItemKind | undefined,
                })
              }
            >
              <option value="">All types</option>
              <option value="spell">Spells</option>
              <option value="web-link">Web links</option>
            </select>
          </label>
        </div>
        {groupedCategories.names.length === 0 ? (
          <p className="empty-tags-message">No tags created yet.</p>
        ) : (
          groupedCategories.names.map((catName) => (
            <div key={catName} className="category-group">
              <h3>{catName}</h3>
              <ul className="category-tags-list">
                {groupedCategories.tagsMap[catName].map((tag) => {
                  const normalized = tag.tagName.toLowerCase();
                  const isSelected = filters.tags.includes(normalized);
                  return (
                    <li key={tag.id}>
                      <label
                        className="tag-filter-pill"
                        style={{
                          color: tag.color,
                          borderColor: tag.color,
                          background: isSelected
                            ? `color-mix(in srgb, ${tag.color} 20%, var(--surface))`
                            : `color-mix(in srgb, ${tag.color} 8%, var(--surface))`,
                        }}
                      >
                        <input
                          type="checkbox"
                          aria-label={tag.tagName}
                          checked={isSelected}
                          onChange={(event) => {
                            const nextTags = event.target.checked
                              ? [...filters.tags, normalized]
                              : filters.tags.filter((candidate) => candidate !== normalized);
                            onChange({ ...filters, tags: [...new Set(nextTags)] });
                          }}
                        />
                        {tag.tagName}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
      <div className="sidebar-footer">
        <button className="quiet" onClick={onNavigateToTags}>
          Manage tags
        </button>
      </div>
    </aside>
  );
}
