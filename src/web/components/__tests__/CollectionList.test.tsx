import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionList } from '../CollectionList';

const items = [
  { id: 'first', kind: 'spell' as const, title: 'First', description: '', tags: [], order: 1, relatedItemIds: [], command: 'first', url: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'second', kind: 'spell' as const, title: 'Second', description: '', tags: [], order: 2, relatedItemIds: [], command: 'second', url: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

describe('CollectionList', () => {
  it('offers keyboard-accessible move controls', () => {
    const onReorder = vi.fn();
    render(<CollectionList items={items} onReorder={onReorder} onEdit={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move Second up' }));

    expect(onReorder).toHaveBeenCalledWith('second', 1);
  });
});