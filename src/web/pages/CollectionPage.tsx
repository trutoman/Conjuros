import { useState } from 'react';
import type { CollectionItem, CollectionItemInput } from '@conjuros/contracts';
import { CollectionList } from '../components/CollectionList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { ItemForm } from '../components/ItemForm';
import { LoadingState } from '../components/LoadingState';
import { useCollection } from '../hooks/useCollection';
import { useCollectionFilters } from '../hooks/useCollectionFilters';

export function CollectionPage({ onSignOut }: { onSignOut?: () => void }) {
  const { filters, setFilters, query } = useCollectionFilters();
  const { items, isLoading, error, create, update, remove, reorder } = useCollection(query);
  const [formItem, setFormItem] = useState<CollectionItem | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<CollectionItem | null>(null);
  const [actionError, setActionError] = useState('');
  async function save(input: CollectionItemInput) { try { if (formItem) await update({ id: formItem.id, item: input }); else await create(input); setFormItem(undefined); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save item'); } }
  async function confirmDelete() { if (!deleteItem) return; try { await remove(deleteItem.id); setDeleteItem(null); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not delete item'); } }
  const filtered = Boolean(filters.search || filters.kind || filters.tag);
  const visibleItems = items.filter((item) => {
    const searchable = [item.title, item.description, item.command ?? '', item.url ?? '', ...item.tags].join(' ').toLowerCase();
    return (!filters.search || searchable.includes(filters.search.toLowerCase())) &&
      (!filters.kind || item.kind === filters.kind) && (!filters.tag || item.tags.includes(filters.tag));
  });
  return <main className="app-shell"><header className="topbar"><div><p className="eyebrow">PRIVATE COLLECTION</p><h1>Conjuros</h1></div><div><button onClick={() => setFormItem(null)}>Add item</button>{onSignOut && <button className="quiet" onClick={onSignOut}>Sign out</button>}</div></header><FilterBar filters={filters} onChange={setFilters} />{actionError && <ErrorState message={actionError} />}{isLoading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : visibleItems.length === 0 ? <EmptyState filtered={filtered} /> : <CollectionList items={visibleItems} onReorder={(id, order) => void reorder({ id, order }).catch((cause: unknown) => setActionError(cause instanceof Error ? cause.message : 'Could not reorder item'))} onEdit={setFormItem} onDelete={setDeleteItem} />}{formItem !== undefined && <ItemForm item={formItem ?? undefined} onSubmit={save} onCancel={() => setFormItem(undefined)} />}{deleteItem && <DeleteConfirmDialog title={deleteItem.title} onConfirm={() => void confirmDelete()} onCancel={() => setDeleteItem(null)} />}</main>;
}