import { useState } from 'react';
import type { CollectionItem, CollectionItemInput, ItemKind, ThemePreference } from '@conjuros/contracts';
import { CollectionList } from '../components/CollectionList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Sidebar } from '../components/Sidebar';
import { ItemForm } from '../components/ItemForm';
import { LoadingState } from '../components/LoadingState';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserWidget } from '../components/UserWidget';
import { useCollection } from '../hooks/useCollection';
import { useCollectionFilters } from '../hooks/useCollectionFilters';
import { useTags } from '../hooks/useTags';

export function CollectionPage({
  onSignOut,
  currentUserLabel,
  onNavigateToTags,
  theme = 'light',
  onThemeChange,
}: {
  onSignOut?: () => void;
  currentUserLabel?: string;
  onNavigateToTags?: () => void;
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void | Promise<void>;
}) {
  const { filters, setFilters, query } = useCollectionFilters();
  const { items, isLoading, error, create, update, remove, reorder } = useCollection(query);
  const tagsState = useTags();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('conjuros_sidebar_open');
    if (saved !== null) return saved !== 'false';
    return window.innerWidth > 768;
  });

  function handleToggleSidebar() {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('conjuros_sidebar_open', String(next));
      return next;
    });
  }

  const [formItem, setFormItem] = useState<CollectionItem | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<CollectionItem | null>(null);
  const [actionError, setActionError] = useState('');

  async function save(input: CollectionItemInput) {
    try {
      if (formItem) await update({ id: formItem.id, item: input });
      else await create(input);
      setFormItem(undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save item');
    }
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

  const filtered = Boolean(filters.search || filters.kind || filters.tags.length > 0);
  const visibleItems = items.filter((item) => {
    const searchable = [
      item.title,
      item.description,
      item.command ?? '',
      item.url ?? '',
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
    <div className={`collection-layout-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
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
          <div className="topbar-actions">
            <button onClick={() => setFormItem(null)}>Add item</button>
          </div>
        </header>

        <div className="app-shell-body">
          <div className={`app-sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
            <Sidebar
              tags={tagsState.tags}
              filters={filters}
              isOpen={isSidebarOpen}
              onToggleOpen={handleToggleSidebar}
              onChange={setFilters}
              onNavigateToTags={onNavigateToTags ?? (() => {})}
              onClose={() => {
                setIsSidebarOpen(false);
                localStorage.setItem('conjuros_sidebar_open', 'false');
              }}
            />
          </div>
          {isSidebarOpen && (
            <div className="sidebar-backdrop" onClick={handleToggleSidebar} />
          )}

          <div className="main-content-frame">
            <div className="collection-subheader">
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
                  placeholder="Buscar en título y contenido..."
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
                    setActionError(cause instanceof Error ? cause.message : 'Could not reorder item'),
                  )
                }
                onEdit={setFormItem}
                onDelete={setDeleteItem}
              />
            )}
          </div>
        </div>

        {formItem !== undefined && (
          <ItemForm
            item={formItem ?? undefined}
            availableTags={tagsState.tags}
            onSubmit={save}
            onCancel={() => setFormItem(undefined)}
          />
        )}
        {deleteItem && (
          <DeleteConfirmDialog
            title={deleteItem.title}
            onConfirm={() => void confirmDelete()}
            onCancel={() => setDeleteItem(null)}
          />
        )}
      </main>
    </div>
  );
}
