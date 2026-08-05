import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollectionPage } from '../CollectionPage';

const collectionState = {
  items: [
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
  ],
  total: 1,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
};

let mockTags = [
  {
    id: 'tag-1',
    tagName: 'git',
    tagCategory: 'Development',
    description: '',
    color: '#123ABC',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-2',
    tagName: 'docs',
    tagCategory: 'Documentation',
    description: '',
    color: '#456DEF',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const tagsState = {
  tags: mockTags,
  total: mockTags.length,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  reorder: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => collectionState,
}));

vi.mock('../../hooks/useTags', () => ({
  useTags: () => tagsState,
}));

function manageFrame() {
  const frame = document.querySelector('.tag-management-view');
  if (!frame) throw new Error('management view not rendered');
  return within(frame as HTMLElement);
}

function openManageTags() {
  fireEvent.click(screen.getByRole('button', { name: 'Manage tags' }));
}

afterEach(() => {
  mockTags = [
    {
      id: 'tag-1',
      tagName: 'git',
      tagCategory: 'Development',
      description: '',
      color: '#123ABC',
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'tag-2',
      tagName: 'docs',
      tagCategory: 'Documentation',
      description: '',
      color: '#456DEF',
      order: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  tagsState.tags = mockTags;
  tagsState.total = mockTags.length;
  tagsState.isLoading = false;
  tagsState.error = null;
  tagsState.create.mockReset();
  tagsState.update.mockReset();
  tagsState.remove.mockReset();
  tagsState.reorder.mockReset();
  tagsState.create.mockResolvedValue(undefined);
  tagsState.update.mockResolvedValue(undefined);
  tagsState.remove.mockResolvedValue(undefined);
  tagsState.reorder.mockResolvedValue(undefined);
});

describe('CollectionPage inline manage tags view', () => {
  it('shows the management view as the sole frame content while keeping the sidebar visible', () => {
    render(<CollectionPage />);

    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();

    openManageTags();

    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    const frame = manageFrame();
    expect(frame.getByText('git')).toBeInTheDocument();
    expect(frame.getByText('docs')).toBeInTheDocument();
    expect(screen.queryByLabelText('Search collection')).not.toBeInTheDocument();
    expect(screen.queryByText('Git status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse tags sidebar' })).toBeInTheDocument();
  });

  it('returns to the management list after saving a new tag', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'work.todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: '#112233' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(tagsState.create).toHaveBeenCalledWith({
      tagName: 'work.todo',
      tagCategory: 'Work',
      description: '',
      color: '#112233',
    });
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Search collection')).not.toBeInTheDocument();
  });

  it('returns to the management list after canceling the tag form', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'discard.me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(tagsState.create).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Search collection')).not.toBeInTheDocument();
  });

  it('pre-fills the edit form and saves the updated tag', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(
      manageFrame().getAllByRole('button', { name: 'Edit' })[0],
    );
    expect(screen.getByRole('heading', { name: 'Edit tag' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tag name')).toHaveValue('git');

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'git.work' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(tagsState.update).toHaveBeenCalledWith({
      id: 'tag-1',
      tag: {
        tagName: 'git.work',
        tagCategory: 'Development',
        description: '',
        color: '#123ABC',
      },
    });
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('deletes a tag through the confirm dialog', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(
      manageFrame().getAllByRole('button', { name: 'Delete' })[0],
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    expect(tagsState.remove).toHaveBeenCalledWith('tag-1');
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('routes reorder actions through the tags reorder mutation', () => {
    render(<CollectionPage />);
    openManageTags();

    const moves = manageFrame().getAllByRole('button', { name: /move (up|down)/i });
    fireEvent.click(moves[1]);

    expect(tagsState.reorder).toHaveBeenCalledWith({ id: 'tag-1', order: 2 });
  });

  it('restores the item collection when exiting the management view', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(screen.getByRole('button', { name: '← Collection' }));

    expect(screen.queryByRole('heading', { name: 'Manage tags' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
  });

  it('keeps the management view, item form, and tag form mutually exclusive', () => {
    render(<CollectionPage />);

    openManageTags();
    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    expect(screen.getByRole('heading', { name: 'Add tag' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '← Collection' }));
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByRole('heading', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Manage tags' })).not.toBeInTheDocument();
  });
});