import { useMemo } from 'react';
import type { Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../hooks/useCollectionFilters';
import { TagMatchToggle } from './TagMatchToggle';

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
        <h2>Tags</h2>
        <div className="sidebar-header-right">
          <TagMatchToggle
            mode={filters.tagFilterMode}
            onChange={(mode) => onChange({ ...filters, tagFilterMode: mode })}
          />
          <button className="sidebar-close quiet" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>
      </div>
      <div className="sidebar-content">
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
