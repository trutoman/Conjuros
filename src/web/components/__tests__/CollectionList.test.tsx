import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionList } from '../CollectionList';

const items = [
  {
    id: 'first',
    kind: 'spell' as const,
    title: 'First',
    description: '',
    tags: [],
    order: 1,
    relatedItemIds: [],
    command: 'first',
    url: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'second',
    kind: 'spell' as const,
    title: 'Second',
    description: '',
    tags: [],
    order: 2,
    relatedItemIds: [],
    command: 'second',
    url: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('CollectionList', () => {
  it('reorders with drag and drop when dropped on a different row', () => {
    const onReorder = vi.fn();
    render(
      <CollectionList items={items} onReorder={onReorder} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const firstRow = screen.getByTestId('collection-row-first');
    const secondRow = screen.getByTestId('collection-row-second');

    fireEvent.dragStart(firstRow);
    fireEvent.dragOver(secondRow);
    fireEvent.drop(secondRow);

    expect(onReorder).toHaveBeenCalledWith('first', 2);
  });

  it('does not reorder when dropped on the same row', () => {
    const onReorder = vi.fn();
    render(
      <CollectionList items={items} onReorder={onReorder} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const firstRow = screen.getByTestId('collection-row-first');
    fireEvent.dragStart(firstRow);
    fireEvent.drop(firstRow);

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('supports Alt+Arrow keyboard reordering and preserves focus', () => {
    const onReorder = vi.fn();
    render(
      <CollectionList items={items} onReorder={onReorder} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const secondRow = screen.getByTestId('collection-row-second');
    secondRow.focus();
    fireEvent.keyDown(secondRow, { key: 'ArrowUp', altKey: true });

    expect(document.activeElement).toBe(secondRow);
    expect(onReorder).toHaveBeenCalledWith('second', 1);
  });

  it('ignores out-of-bounds keyboard reorder moves', () => {
    const onReorder = vi.fn();
    render(
      <CollectionList items={items} onReorder={onReorder} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const firstRow = screen.getByTestId('collection-row-first');
    fireEvent.keyDown(firstRow, { key: 'ArrowUp', altKey: true });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not render legacy move-up and move-down buttons', () => {
    render(
      <CollectionList items={items} onReorder={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { name: /move .* up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move .* down/i })).not.toBeInTheDocument();
  });

  it('keeps only one item menu open at a time', () => {
    render(
      <CollectionList items={items} onReorder={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const [firstTrigger, secondTrigger] = screen.getAllByRole('button', { name: 'Item menu' });

    fireEvent.click(firstTrigger);
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    const firstRow = screen.getByTestId('collection-row-first');
    expect(firstRow.querySelector('.item-card')).toHaveClass('item-card--menu-open');

    fireEvent.click(secondTrigger);

    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(firstRow.querySelector('.item-card')).not.toHaveClass('item-card--menu-open');
    const secondRow = screen.getByTestId('collection-row-second');
    expect(secondRow.querySelector('.item-card')).toHaveClass('item-card--menu-open');
  });

  it('closes the open item menu when its trigger is clicked again', () => {
    render(
      <CollectionList items={items} onReorder={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const [firstTrigger] = screen.getAllByRole('button', { name: 'Item menu' });

    fireEvent.click(firstTrigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(firstTrigger);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    const firstRow = screen.getByTestId('collection-row-first');
    expect(firstRow.querySelector('.item-card')).not.toHaveClass('item-card--menu-open');
  });
});
