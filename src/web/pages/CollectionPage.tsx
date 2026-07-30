import { useState } from 'react';
import type {
  CollectionItem,
  CollectionItemInput,
  Tag,
  TagInput,
  ThemePreference,
} from '@conjuros/contracts';
import { CollectionList } from '../components/CollectionList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { ItemForm } from '../components/ItemForm';
import { LoadingState } from '../components/LoadingState';
import { TagForm } from '../components/TagForm';
import { TagList } from '../components/TagList';
import { ThemeToggle } from '../components/ThemeToggle';
import { useCollection } from '../hooks/useCollection';
import { useCollectionFilters } from '../hooks/useCollectionFilters';
import { useTags } from '../hooks/useTags';

export function CollectionPage({
  onSignOut,
  theme = 'light',
  onThemeChange,
}: {
  onSignOut?: () => void;
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void | Promise<void>;
}) {
  const { filters, setFilters, query } = useCollectionFilters();
  const { items, isLoading, error, create, update, remove, reorder } = useCollection(query);
  const tagsState = useTags();
  const [formItem, setFormItem] = useState<CollectionItem | null | undefined>(undefined);
  const [formTag, setFormTag] = useState<Tag | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<CollectionItem | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
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

  async function saveTag(input: TagInput) {
    try {
      if (formTag) await tagsState.update({ id: formTag.id, tag: input });
      else await tagsState.create(input);
      setFormTag(undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save tag');
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
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Evil begins when you begin to treat people as things.</p>
          <h1>Conjuros</h1>
        </div>
        <div className="topbar-actions">
          <button onClick={() => setFormItem(null)}>Add item</button>
          <button onClick={() => setFormTag(null)}>Add tag</button>
          <ThemeToggle theme={theme} onChange={(nextTheme) => onThemeChange?.(nextTheme)} />
          {onSignOut && (
            <button className="quiet" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      </header>
      <FilterBar filters={filters} availableTags={tagsState.tags} onChange={setFilters} />
      {actionError && <ErrorState message={actionError} />}
      {isLoading || tagsState.isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : tagsState.error ? (
        <ErrorState message={tagsState.error.message} />
      ) : visibleItems.length === 0 ? (
        <EmptyState filtered={filtered} />
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
      <TagList
        tags={tagsState.tags}
        onEdit={setFormTag}
        onDelete={setDeleteTag}
        onMove={(id, order) =>
          void tagsState
            .reorder({ id, order })
            .catch((cause: unknown) =>
              setActionError(cause instanceof Error ? cause.message : 'Could not reorder tag'),
            )
        }
      />
      {formItem !== undefined && (
        <ItemForm
          item={formItem ?? undefined}
          availableTags={tagsState.tags}
          onSubmit={save}
          onCancel={() => setFormItem(undefined)}
        />
      )}
      {formTag !== undefined && (
        <TagForm
          tag={formTag ?? undefined}
          onSubmit={saveTag}
          onCancel={() => setFormTag(undefined)}
        />
      )}
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
  );
}
