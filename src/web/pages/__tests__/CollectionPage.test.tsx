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

const collectionState = {
  items: collectionItems,
  total: collectionItems.length,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder: reorderMock,
};

const tagsState = {
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
  error: null as Error | null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
};

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => collectionState,
}));

vi.mock('../../hooks/useTags', () => ({
  useTags: () => tagsState,
}));

afterEach(() => {
  sessionStorage.clear();
  reorderMock.mockReset();
  reorderMock.mockResolvedValue(undefined);
  collectionState.items = collectionItems;
  collectionState.total = collectionItems.length;
  collectionState.isLoading = false;
  collectionState.error = null;
  tagsState.isLoading = false;
  tagsState.error = null;
  tagsState.tags = [
    {
      id: 'tag-1',
      tagName: 'git',
      description: '',
      color: '#123ABC',
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
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

  it('keeps item content visible in the top row between title and tags', () => {
    render(<CollectionPage />);

    const card = screen.getByText('Git status').closest('.item-card');
    expect(card).toBeTruthy();

    const topRow = card?.querySelector('.item-title-row');
    const title = card?.querySelector('h2');
    const content = card?.querySelector('.item-inline-content');
    const tags = card?.querySelector('.tags');

    expect(topRow).toBeTruthy();
    expect(content).toHaveTextContent('git status');
    expect(
      title &&
        content &&
        Boolean(title.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(
      content &&
        tags &&
        Boolean(content.compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
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

  it('renders loading state while collection data is loading', () => {
    collectionState.isLoading = true;

    render(<CollectionPage />);

    expect(screen.getByText('Loading collection...')).toBeInTheDocument();
  });

  it('renders empty state when there are no items', () => {
    collectionState.items = [];
    collectionState.total = 0;

    render(<CollectionPage />);

    expect(screen.getByText('Your collection is empty')).toBeInTheDocument();
  });

  it('renders API error state when collection query fails', () => {
    collectionState.error = new Error('Collection exploded');

    render(<CollectionPage />);

    expect(screen.getByText('Collection exploded')).toBeInTheDocument();
  });

  it('renders the user widget and routes sign out through its action', () => {
    const onSignOut = vi.fn();
    render(<CollectionPage onSignOut={onSignOut} currentUserLabel="alicia" />);

    expect(screen.getByText('alicia')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out alicia' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
