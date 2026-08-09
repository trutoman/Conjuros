import { useEffect, useMemo } from 'react';
import type { Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../hooks/useCollectionFilters';
import { TagMatchToggle } from './TagMatchToggle';
import { TagColumnIcon } from './TagColumnIcon';

export function Sidebar({
  tags,
  filters,
  isOpen = true,
  onToggleOpen,
  onChange,
  onManageTags,
  onManageThemes,
  onClose,
}: {
  tags: Tag[];
  filters: CollectionFilters;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onChange: (filters: CollectionFilters) => void;
  onManageTags: () => void;
  onManageThemes?: () => void;
  onClose?: () => void;
}) {
  const groupedCategories = useMemo(() => {
    const grouped: Record<string, Tag[]> = {};
    for (const tag of tags) {
      const category = (tag.tagCategory || 'General').toLowerCase();
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        if (onToggleOpen) {
          onToggleOpen();
        } else if (onClose) {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggleOpen, onClose]);

  return (
    <aside id="tags-sidebar-panel" className="tags-sidebar" aria-label="Tags filter panel">
      <div className="sidebar-header">
        <button
          type="button"
          className="tags-toggle-btn"
          onClick={onToggleOpen ?? onClose}
          aria-expanded={isOpen}
          aria-controls="tags-sidebar-panel"
          aria-label={isOpen ? 'Collapse tags sidebar' : 'Expand tags sidebar'}
        >
          <span>Tags</span>
          <TagColumnIcon />
        </button>
        {isOpen && (
          <div className="sidebar-header-right">
            <TagMatchToggle
              mode={filters.tagFilterMode}
              onChange={(mode) => onChange({ ...filters, tagFilterMode: mode })}
            />
            {onClose && (
              <button className="sidebar-close quiet" onClick={onClose} aria-label="Close sidebar">
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <>
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
                              aria-label={tag.tagName.toLowerCase()}
                              checked={isSelected}
                              onChange={(event) => {
                                const nextTags = event.target.checked
                                  ? [...filters.tags, normalized]
                                  : filters.tags.filter((candidate) => candidate !== normalized);
                                onChange({ ...filters, tags: [...new Set(nextTags)] });
                              }}
                            />
                            {tag.tagName.toLowerCase()}
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
            <button className="quiet" onClick={onManageTags}>
              Manage tags
            </button>
            {onManageThemes && (
              <button className="quiet" onClick={onManageThemes}>
                Themes
              </button>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
