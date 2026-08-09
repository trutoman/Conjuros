import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { ItemCard } from './ItemCard';

export function CollectionList({
  items,
  tags = [],
  onReorder,
  onEdit,
  onDelete,
  onView,
}: {
  items: CollectionItem[];
  tags?: Tag[];
  onReorder: (id: string, order: number) => void;
  onEdit: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
  onView?: (item: CollectionItem) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [interactionMessage, setInteractionMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  function reorderByIndex(itemId: string, targetIndex: number) {
    const sourceIndex = items.findIndex((item) => item.id === itemId);
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= items.length ||
      sourceIndex === targetIndex
    ) {
      return false;
    }

    const sourceItem = items[sourceIndex];
    const targetItem = items[targetIndex];
    onReorder(sourceItem.id, targetItem.order);
    setInteractionMessage(`${sourceItem.title} moved to position ${targetIndex + 1}`);
    return true;
  }

  function handleKeyboardReorder(event: KeyboardEvent<HTMLDivElement>, itemId: string) {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }

    event.preventDefault();
    const currentIndex = items.findIndex((item) => item.id === itemId);
    if (currentIndex < 0) {
      return;
    }

    const direction = event.key === 'ArrowUp' ? -1 : 1;
    const nextIndex = currentIndex + direction;
    const moved = reorderByIndex(itemId, nextIndex);
    if (!moved) {
      return;
    }

    // Keep focus anchored on the moved row for keyboard-only interaction continuity.
    event.currentTarget.focus();
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const targetIndex = items.findIndex((item) => item.id === targetId);
    reorderByIndex(draggedId, targetIndex);
    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <div className="collection-list" aria-label="Collection items">
      {items.map((item) => (
        <div
          className={`collection-row${draggedId === item.id ? ' collection-row-dragging' : ''}${dropTargetId === item.id ? ' collection-row-drop-target' : ''}`}
          key={item.id}
          data-testid={`collection-row-${item.id}`}
          draggable
          tabIndex={0}
          onKeyDown={(event) => handleKeyboardReorder(event, item.id)}
          onDragStart={() => {
            setDraggedId(item.id);
            setDropTargetId(item.id);
          }}
          onDragEnd={() => {
            setDraggedId(null);
            setDropTargetId(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (dropTargetId !== item.id) {
              setDropTargetId(item.id);
            }
          }}
          onDrop={() => handleDrop(item.id)}
          aria-label={`Collection item ${item.title}`}
        >
          <ItemCard
            item={item}
            tags={tags}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            isMenuOpen={openMenuId === item.id}
            onMenuToggle={() =>
              setOpenMenuId((current) => (current === item.id ? null : item.id))
            }
          />
        </div>
      ))}
      {interactionMessage && (
        <p className="visually-hidden" role="status" aria-live="polite">
          {interactionMessage}
        </p>
      )}
    </div>
  );
}
