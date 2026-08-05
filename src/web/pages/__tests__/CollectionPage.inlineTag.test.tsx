import { fireEvent, render, screen } from '@testing-library/react';
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

const tagsState = {
  tags: [
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
  ],
  total: 1,
  isLoading: false,
  error: null as Error | null,
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
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
  tagsState.create.mockReset();
  tagsState.update.mockReset();
  tagsState.create.mockResolvedValue(undefined);
  tagsState.update.mockResolvedValue(undefined);
});

describe('CollectionPage inline tag form', () => {
  it('opens the tag form inline, hiding the subheader and collection list', () => {
    render(<CollectionPage />);

    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));

    expect(screen.getByRole('heading', { name: 'Add tag' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Search collection')).not.toBeInTheDocument();
    expect(screen.queryByText('Git status')).not.toBeInTheDocument();
  });

  it('pre-fills the tag edit form with the tag current values', () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit tag git' }));

    expect(screen.getByRole('heading', { name: 'Edit tag' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tag name')).toHaveValue('git');
    expect(screen.getByLabelText('Tag color')).toHaveValue('#123ABC');
  });

  it('returns to the collection view after saving a new tag', async () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
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
    expect(await screen.findByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Add tag' })).not.toBeInTheDocument();
  });

  it('returns to the collection view after saving an edited tag', async () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit tag git' }));
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
    expect(await screen.findByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
  });

  it('returns to the collection view when the tag form is canceled', () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'discard.me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(tagsState.create).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Add tag' })).not.toBeInTheDocument();
  });

  it('keeps the item and tag forms mutually exclusive', () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByRole('heading', { name: 'Add item' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
    expect(screen.getByRole('heading', { name: 'Add tag' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Add item' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
  });
});
