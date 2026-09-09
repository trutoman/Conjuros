import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Tag, TagCategory } from '@conjuros/contracts';

function Icon({
  label,
  path,
  title,
  viewBox = '0 0 24 24',
}: {
  label: string;
  path: string;
  title: string;
  viewBox?: string;
}) {
  return (
    <svg
      className="icon"
      role="img"
      aria-label={label}
      viewBox={viewBox}
      focusable="false"
      aria-hidden={false}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}

type CategoryGroup = {
  key: string;
  testId: string;
  name: string;
  category: TagCategory | null;
  tags: Tag[];
};

export function TagList({
  tags,
  categories = [],
  query = '',
  onEdit,
  onDelete,
  onMove,
  onRenameCategory,
  onDeleteCategory,
}: {
  tags: Tag[];
  categories?: TagCategory[];
  query?: string;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onMove: (id: string, order: number) => void;
  onRenameCategory?: (category: TagCategory) => void;
  onDeleteCategory?: (category: TagCategory) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openCategoryMenuId, setOpenCategoryMenuId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo<CategoryGroup[]>(() => {
    const byName = new Map<string, CategoryGroup>();
    for (const category of categories) {
      const name = category.name.toLowerCase();
      if (!byName.has(name)) {
        byName.set(name, {
          key: category.id,
          testId: category.id,
          name,
          category,
          tags: [],
        });
      }
    }
    for (const tag of tags) {
      const matches =
        !normalizedQuery ||
        tag.tagName.toLowerCase().includes(normalizedQuery) ||
        (tag.tagCategory || 'general').toLowerCase().includes(normalizedQuery);
      if (!matches) continue;
      const name = (tag.tagCategory || 'general').toLowerCase();
      const existing = byName.get(name);
      if (existing) {
        existing.tags.push(tag);
      } else {
        byName.set(name, { key: name, testId: name, name, category: null, tags: [tag] });
      }
    }
    return [...byName.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(
        (group) =>
          !normalizedQuery || group.name.includes(normalizedQuery) || group.tags.length > 0,
      );
  }, [tags, categories, normalizedQuery]);

  const orderedTags = useMemo(() => groups.flatMap((group) => group.tags), [groups]);

  function reorderByIndex(tagId: string, targetIndex: number) {
    const sourceIndex = orderedTags.findIndex((tag) => tag.id === tagId);
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= orderedTags.length ||
      sourceIndex === targetIndex
    ) {
      return false;
    }

    onMove(tagId, orderedTags[targetIndex].order);
    return true;
  }

  function handleKeyboardReorder(event: KeyboardEvent<HTMLLIElement>, tagId: string) {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }

    event.preventDefault();
    const currentIndex = orderedTags.findIndex((tag) => tag.id === tagId);
    if (currentIndex < 0) {
      return;
    }

    const direction = event.key === 'ArrowUp' ? -1 : 1;
    const moved = reorderByIndex(tagId, currentIndex + direction);
    if (!moved) {
      return;
    }

    event.currentTarget.focus();
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const targetIndex = orderedTags.findIndex((tag) => tag.id === targetId);
    reorderByIndex(draggedId, targetIndex);
    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <section className="tag-panel">
      {groups.map((group) => (
        <div
          key={group.key}
          className="category-group"
          data-testid={`tag-category-group-${group.testId}`}
        >
          <div className="category-group-header">
            <h3>{group.name}</h3>
            {group.category &&
              group.name !== 'general' &&
              onRenameCategory &&
              onDeleteCategory && (
                <div className="item-menu-wrapper">
                  <button
                    type="button"
                    className="icon-action"
                    aria-label={`Category menu for ${group.name}`}
                    aria-haspopup="menu"
                    aria-expanded={openCategoryMenuId === group.category.id}
                    onClick={() => {
                      setOpenMenuId(null);
                      setOpenCategoryMenuId((current) =>
                        current === group.category?.id ? null : (group.category?.id ?? null),
                      );
                    }}
                  >
                    <Icon
                      label="Menu"
                      title="Menu"
                      path="M12 5a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 17a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z"
                      viewBox="0 0 24 24"
                    />
                  </button>
                  {openCategoryMenuId === group.category.id && (
                    <div
                      className="item-menu-dropdown"
                      role="menu"
                      aria-label={`Category options for ${group.name}`}
                    >
                      <button
                        type="button"
                        className="icon-action"
                        role="menuitem"
                        aria-label="Rename"
                        tabIndex={-1}
                        onClick={() => {
                          onRenameCategory(group.category as TagCategory);
                          setOpenCategoryMenuId(null);
                        }}
                      >
                        <Icon
                          label="Rename"
                          title="Rename"
                          path="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                        />
                      </button>
                      <button
                        type="button"
                        className="icon-action danger"
                        role="menuitem"
                        aria-label="Delete"
                        tabIndex={-1}
                        onClick={() => {
                          onDeleteCategory(group.category as TagCategory);
                          setOpenCategoryMenuId(null);
                        }}
                      >
                        <Icon
                          label="Delete"
                          title="Delete"
                          path="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6"
                          viewBox="0 0 24 24"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
          {group.tags.length > 0 ? (
            <ul className="category-tags-list">
              {group.tags.map((tag) => (
                <li
                  className={`tag-row${draggedId === tag.id ? ' tag-row-dragging' : ''}${
                    dropTargetId === tag.id ? ' tag-row-drop-target' : ''
                  }`}
                  key={tag.id}
                  data-testid={`tag-row-${tag.id}`}
                  draggable
                  tabIndex={0}
                  onKeyDown={(event) => handleKeyboardReorder(event, tag.id)}
                  onDragStart={() => {
                    setDraggedId(tag.id);
                    setDropTargetId(tag.id);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (dropTargetId !== tag.id) {
                      setDropTargetId(tag.id);
                    }
                  }}
                  onDrop={() => handleDrop(tag.id)}
                  aria-label={`Tag ${tag.tagName.toLowerCase()}`}
                >
                  <div className="tag-row-label">
                    <span
                      className="tag-filter-pill"
                      style={{
                        color: tag.color,
                        borderColor: tag.color,
                        background: `color-mix(in srgb, ${tag.color} 8%, var(--surface))`,
                      }}
                    >
                      {tag.tagName.toLowerCase()}
                    </span>
                    <span className="tag-swatch" aria-hidden="true" style={{ backgroundColor: tag.color }} />
                    <span className="tag-category">{tag.tagCategory.toLowerCase()}</span>
                    <span className="tag-color">{tag.color}</span>
                    {tag.description && <span className="tag-description">{tag.description}</span>}
                  </div>
                  <div className="item-menu-wrapper">
                    <button
                      type="button"
                      className="icon-action"
                      aria-label="Tag menu"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === tag.id}
                      onClick={() => {
                        setOpenCategoryMenuId(null);
                        setOpenMenuId((current) => (current === tag.id ? null : tag.id));
                      }}
                    >
                      <Icon
                        label="Menu"
                        title="Menu"
                        path="M12 5a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z M12 17a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z"
                        viewBox="0 0 24 24"
                      />
                    </button>
                    {openMenuId === tag.id && (
                      <div className="item-menu-dropdown" role="menu" aria-label="Tag options">
                        <button
                          type="button"
                          className="icon-action"
                          role="menuitem"
                          aria-label="Edit"
                          tabIndex={-1}
                          onClick={() => {
                            onEdit(tag);
                            setOpenMenuId(null);
                          }}
                        >
                          <Icon
                            label="Edit"
                            title="Edit"
                            path="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                          />
                        </button>
                        <button
                          type="button"
                          className="icon-action danger"
                          role="menuitem"
                          aria-label="Delete"
                          tabIndex={-1}
                          onClick={() => {
                            onDelete(tag);
                            setOpenMenuId(null);
                          }}
                        >
                          <Icon
                            label="Delete"
                            title="Delete"
                            path="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6"
                            viewBox="0 0 24 24"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-tags-message">No tags in this category</p>
          )}
        </div>
      ))}
    </section>
  );
}
