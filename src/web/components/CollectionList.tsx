import { useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { ItemCard } from './ItemCard';
import { ReorderHandle } from './ReorderHandle';

export function CollectionList({ items, tags = [], onReorder, onEdit, onDelete }: { items: CollectionItem[]; tags?: Tag[]; onReorder: (id: string, order: number) => void; onEdit: (item: CollectionItem) => void; onDelete: (item: CollectionItem) => void }) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  return <div className="collection-list" aria-label="Collection items">
    {items.map((item, index) => <div className="collection-row" key={item.id} draggable onDragStart={() => setDraggedId(item.id)} onDragEnd={() => setDraggedId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedId && draggedId !== item.id) onReorder(draggedId, item.order); setDraggedId(null); }}>
      <ReorderHandle title={item.title} canMoveUp={index > 0} canMoveDown={index < items.length - 1} onMoveUp={() => onReorder(item.id, item.order - 1)} onMoveDown={() => onReorder(item.id, item.order + 1)} />
      <ItemCard item={item} tags={tags} onEdit={onEdit} onDelete={onDelete} />
    </div>)}
  </div>;
}