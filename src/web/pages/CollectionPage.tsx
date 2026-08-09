import { useEffect, useState } from 'react';
import type {
  CollectionItem,
  CollectionItemInput,
  ItemKind,
  Tag,
  TagInput,
  ThemePreference,
} from '@conjuros/contracts';
import { CollectionList } from '../components/CollectionList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Sidebar } from '../components/Sidebar';
import { ItemForm } from '../components/ItemForm';
import { ItemCardViewer } from '../components/ItemCardViewer';
import { TagForm } from '../components/TagForm';
import { TagList } from '../components/TagList';
import { LoadingState } from '../components/LoadingState';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserWidget } from '../components/UserWidget';
import { useCollection } from '../hooks/useCollection';
import { useCollectionFilters } from '../hooks/useCollectionFilters';
import { useTags } from '../hooks/useTags';

const MOBILE_BREAKPOINT_PX = 768;

export function CollectionPage({
  onSignOut,
  currentUserLabel,
  theme = 'light',
  onThemeChange,
}: {
  onSignOut?: () => void;
  currentUserLabel?: string;
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void | Promise<void>;
}) {
  const { filters, setFilters, query } = useCollectionFilters();
  const { items, isLoading, error, create, update, remove, reorder } = useCollection(query);
  const tagsState = useTags();
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT_PX,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('conjuros_sidebar_open');
    if (saved !== null) return saved !== 'false';
    return window.innerWidth > MOBILE_BREAKPOINT_PX;
  });

  useEffect(() => {
    function handleResize() {
      setIsNarrowViewport(window.innerWidth <= MOBILE_BREAKPOINT_PX);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldForceExpandedSidebar = isNarrowViewport;
  const effectiveSidebarOpen = shouldForceExpandedSidebar ? true : isSidebarOpen;

  function handleToggleSidebar() {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('conjuros_sidebar_open', String(next));
      return next;
    });
  }

  const [formItem, setFormItem] = useState<CollectionItem | null | undefined>(undefined);
  const [formTag, setFormTag] = useState<Tag | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<CollectionItem | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [manageTags, setManageTags] = useState(false);
  const [viewerItem, setViewerItem] = useState<CollectionItem | null | undefined>(undefined);
  const [actionError, setActionError] = useState('');
  const [tagQuery, setTagQuery] = useState('');

  async function save(input: CollectionItemInput) {
    try {
      if (formItem) await update({ id: formItem.id, item: input });
      else await create(input);
      setFormItem(undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save item');
    }
  }

  async function saveTag(input: TagInput) {
    try {
      if (formTag) await tagsState.update({ id: formTag.id, tag: input });
      else await tagsState.create(input);
      setFormTag(undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save tag');
    }
  }

  function openItemForm(item: CollectionItem | null) {
    setFormTag(undefined);
    setManageTags(false);
    setViewerItem(undefined);
    setFormItem(item);
  }

  function openViewer(item: CollectionItem) {
    setFormItem(undefined);
    setFormTag(undefined);
    setManageTags(false);
    setViewerItem(item);
  }

  function closeViewer() {
    setViewerItem(undefined);
  }

  function openTagFormInManage(tag: Tag | null) {
    setFormItem(undefined);
    setFormTag(tag);
  }

  function openManageTags() {
    setFormItem(undefined);
    setFormTag(undefined);
    setTagQuery('');
    setViewerItem(undefined);
    setManageTags(true);
  }

  function closeManageTags() {
    setFormTag(undefined);
    setManageTags(false);
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    try {
      await remove(deleteItem.id);
      setDeleteItem(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not delete item');
    }
  }

  async function confirmTagDelete() {
    if (!deleteTag) return;
    try {
      await tagsState.remove(deleteTag.id);
      setDeleteTag(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not delete tag');
    }
  }

  const filtered = Boolean(filters.search || filters.kind || filters.tags.length > 0);
  const normalizedTagQuery = tagQuery.trim().toLowerCase();
  const visibleTags = tagsState.tags.filter(
    (tag) =>
      !normalizedTagQuery ||
      tag.tagName.toLowerCase().includes(normalizedTagQuery) ||
      tag.tagCategory.toLowerCase().includes(normalizedTagQuery),
  );
  const visibleItems = items.filter((item) => {
    const searchable = [
      item.title,
      item.description ?? '',
      item.command ?? '',
      item.url ?? '',
      item.content ?? '',
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase();
    return (
      (!filters.search || searchable.includes(filters.search.toLowerCase())) &&
      (!filters.kind || item.kind === filters.kind) &&
      (filters.tags.length === 0 ||
        (filters.tagFilterMode === 'any'
          ? filters.tags.some((tag) => item.tags.includes(tag))
          : filters.tags.every((tag) => item.tags.includes(tag))))
    );
  });
  return (
    <div className={`collection-layout-wrapper ${effectiveSidebarOpen ? 'sidebar-open' : ''}`}>
      <main className="app-shell">
        <header className="topbar">
          <div className="topbar-brand">
            <p className="eyebrow">Enchantments to charm machines.</p>
            <h1>Conjuros</h1>
          </div>
          <div className="topbar-signout">
            <ThemeToggle theme={theme} onChange={(nextTheme) => onThemeChange?.(nextTheme)} />
            {onSignOut && currentUserLabel && (
              <UserWidget userLabel={currentUserLabel} onSignOut={onSignOut} />
            )}
          </div>
        </header>

        <div className="app-shell-body">
          <div
            className={`app-sidebar ${effectiveSidebarOpen ? 'expanded' : 'collapsed'} ${
              shouldForceExpandedSidebar ? 'stacked-mobile' : ''
            }`}
          >
            <Sidebar
              tags={tagsState.tags}
              filters={filters}
              isOpen={effectiveSidebarOpen}
              onToggleOpen={handleToggleSidebar}
              onChange={setFilters}
              onManageTags={openManageTags}
              onClose={
                shouldForceExpandedSidebar
                  ? undefined
                  : () => {
                      setIsSidebarOpen(false);
                      localStorage.setItem('conjuros_sidebar_open', 'false');
                    }
              }
            />
          </div>
          {effectiveSidebarOpen && !shouldForceExpandedSidebar && (
            <div className="sidebar-backdrop" onClick={handleToggleSidebar} />
          )}

          <div className="main-content-frame">
            {viewerItem !== undefined && viewerItem !== null ? (
              <ItemCardViewer
                item={viewerItem}
                onClose={closeViewer}
                onEdit={() => openItemForm(viewerItem)}
              />
            ) : manageTags ? (
              formTag !== undefined ? (
                <TagForm
                  tag={formTag ?? undefined}
                  onSubmit={saveTag}
                  onCancel={() => setFormTag(undefined)}
                />
              ) : (
                <div className="item-form tag-management-view">
                  <button
                    type="button"
                    className="form-close"
                    aria-label="Close tag management"
                    onClick={closeManageTags}
                  >
                    ✕
                  </button>
                  <div className="tag-management-header">
                    <h2>Manage tags</h2>
                    <div className="tag-management-actions">
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
                          aria-label="Search tags"
                          value={tagQuery}
                          onChange={(event) => setTagQuery(event.target.value)}
                          placeholder="Search in name or category..."
                        />
                        {tagQuery && (
                          <button
                            type="button"
                            className="search-clear-button"
                            onClick={() => setTagQuery('')}
                            aria-label="Clear search"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={() => openTagFormInManage(null)}>
                        Add tag
                      </button>
                    </div>
                  </div>
                  {actionError && <ErrorState message={actionError} />}
                  {tagsState.isLoading ? (
                    <LoadingState />
                  ) : tagsState.error ? (
                    <ErrorState message={tagsState.error.message} />
                  ) : (
                    <TagList
                      tags={visibleTags}
                      onEdit={setFormTag}
                      onDelete={setDeleteTag}
                      onMove={(id, order) =>
                        void tagsState
                          .reorder({ id, order })
                          .catch((cause: unknown) =>
                            setActionError(
                              cause instanceof Error ? cause.message : 'Could not reorder tag',
                            ),
                          )
                      }
                    />
                  )}
                </div>
              )
            ) : formItem !== undefined ? (
              <ItemForm
                item={formItem ?? undefined}
                availableTags={tagsState.tags}
                onSubmit={save}
                onCancel={() => setFormItem(undefined)}
              />
            ) : (
              <>
                <div className="collection-subheader">
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={() => openItemForm(null)}
                    aria-label="Add item"
                    title="Add item"
                  >
                    +
                  </button>
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
                      onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                      placeholder="Search in title and content..."
                    />
                    {filters.search && (
                      <button
                        type="button"
                        className="search-clear-button"
                        onClick={() => setFilters({ ...filters, search: '' })}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <label className="inline-label type-selector-label filter-label">
                    Type
                    <select
                      value={filters.kind ?? ''}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          kind: (event.target.value || undefined) as ItemKind | undefined,
                        })
                      }
                    >
                      <option value="">All types</option>
                      <option value="spell">Spells</option>
                      <option value="web-link">Web links</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </label>
                </div>
                {actionError && <ErrorState message={actionError} />}
                {isLoading || tagsState.isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <ErrorState message={error.message} />
                ) : tagsState.error ? (
                  <ErrorState message={tagsState.error.message} />
                ) : visibleItems.length === 0 ? (
                  <EmptyState filtered={filtered} filters={filters} />
                ) : (
                  <CollectionList
                    items={visibleItems}
                    tags={tagsState.tags}
                    onReorder={(id, order) =>
                      void reorder({ id, order }).catch((cause: unknown) =>
                        setActionError(
                          cause instanceof Error ? cause.message : 'Could not reorder item',
                        ),
                      )
                    }
                    onEdit={openItemForm}
                    onDelete={setDeleteItem}
                    onView={openViewer}
                  />
                )}
              </>
            )}
          </div>
        </div>
        {deleteItem && (
          <DeleteConfirmDialog
            title={deleteItem.title}
            onConfirm={() => void confirmDelete()}
            onCancel={() => setDeleteItem(null)}
          />
        )}
        {deleteTag && (
          <DeleteConfirmDialog
            title={deleteTag.tagName}
            onConfirm={() => void confirmTagDelete()}
            onCancel={() => setDeleteTag(null)}
          />
        )}
      </main>
    </div>
  );
}
