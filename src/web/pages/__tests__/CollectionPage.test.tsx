import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollectionPage } from '../CollectionPage';

const reorderMock = vi.fn().mockResolvedValue(undefined);
const collectionItems = [
  {
    id: 'item-1',
    kind: 'spell',
    title: 'Git status',
    description: '',
    tags: ['git'],
    order: 1,
    relatedItemIds: [],
    command: 'git status',
    url: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'item-2',
    kind: 'spell',
    title: 'Git diff',
    description: '',
    tags: ['git'],
    order: 2,
    relatedItemIds: [],
    command: 'git diff',
    url: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => ({
    items: collectionItems,
    total: collectionItems.length,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: reorderMock,
  }),
}));

vi.mock('../../hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      {
        id: 'tag-1',
        tagName: 'git',
        description: '',
        color: '#123ABC',
        order: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    total: 1,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  }),
}));

afterEach(() => {
  sessionStorage.clear();
  reorderMock.mockReset();
  reorderMock.mockResolvedValue(undefined);
});

describe('CollectionPage', () => {
  it('renders searchable collection items and a no-results state', () => {
    render(<CollectionPage />);
    expect(screen.getByText('Git status')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search collection'), { target: { value: 'missing' } });
    expect(screen.getByText('No matching items')).toBeInTheDocument();
  });

  it('renders the theme controls and keeps secondary item actions de-emphasized', () => {
    render(<CollectionPage />);

    expect(screen.getByRole('group', { name: 'Theme preference' })).toBeInTheDocument();

    const itemCard = screen.getByText('Git status').closest('.item-card');
    expect(itemCard).toBeTruthy();
    const actionButtons = itemCard?.querySelectorAll('button');
    expect(actionButtons?.[1]).toHaveClass('action-secondary');
    expect(actionButtons?.[2]).toHaveClass('action-secondary');
  });

  it('routes drag-and-drop reorder through the collection reorder mutation', () => {
    render(<CollectionPage />);

    const firstRow = screen.getByTestId('collection-row-item-1');
    const secondRow = screen.getByTestId('collection-row-item-2');
    fireEvent.dragStart(secondRow);
    fireEvent.dragOver(firstRow);
    fireEvent.drop(firstRow);

    expect(reorderMock).toHaveBeenCalledWith({ id: 'item-2', order: 1 });
  });

  it('does not render legacy move controls on the collection page', () => {
    render(<CollectionPage />);

    expect(screen.queryByRole('button', { name: /move .* up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move .* down/i })).not.toBeInTheDocument();
  });

  it('shows an error message when keyboard reorder persistence fails', async () => {
    reorderMock.mockRejectedValueOnce(new Error('Could not reorder item'));
    render(<CollectionPage />);

    const secondRow = screen.getByTestId('collection-row-item-2');
    secondRow.focus();
    fireEvent.keyDown(secondRow, { key: 'ArrowUp', altKey: true });

    expect(await screen.findByText('Could not reorder item')).toBeInTheDocument();
  });
});
