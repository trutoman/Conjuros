import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
      tagCategory: 'work',
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

  it('returns to the management list when the tag form is closed via its close button', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    expect(screen.getByRole('heading', { name: 'Add tag' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'discard.me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close tag form' }));

    expect(tagsState.create).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Search collection')).not.toBeInTheDocument();
  });

  it('pre-fills the edit form and saves the updated tag', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getAllByRole('button', { name: 'Tag menu' })[0]);
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('heading', { name: 'Edit tag' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tag name')).toHaveValue('git');

    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'git.work' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(tagsState.update).toHaveBeenCalledWith({
      id: 'tag-1',
      tag: {
        tagName: 'git.work',
        tagCategory: 'development',
        description: '',
        color: '#123ABC',
      },
    });
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('deletes a tag through the confirm dialog', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getAllByRole('button', { name: 'Tag menu' })[0]);
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Delete' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    expect(tagsState.remove).toHaveBeenCalledWith('tag-1');
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('routes reorder actions through the tags reorder mutation', () => {
    render(<CollectionPage />);
    openManageTags();

    const secondRow = manageFrame().getByTestId('tag-row-tag-2');
    fireEvent.dragStart(secondRow);
    fireEvent.dragOver(manageFrame().getByTestId('tag-row-tag-1'));
    fireEvent.drop(manageFrame().getByTestId('tag-row-tag-1'));

    expect(tagsState.reorder).toHaveBeenCalledWith({ id: 'tag-2', order: 1 });
  });

  it('restores the item collection when exiting the management view', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(screen.getByRole('button', { name: 'Close tag management' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Close tag management' }));
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByRole('heading', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Manage tags' })).not.toBeInTheDocument();
  });

  it('filters tags by name through the tag search box', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.change(manageFrame().getByLabelText('Search tags'), {
      target: { value: 'git' },
    });

    expect(manageFrame().queryByText('docs')).not.toBeInTheDocument();
    expect(manageFrame().getByText('git')).toBeInTheDocument();
  });

  it('filters tags by category through the tag search box', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.change(manageFrame().getByLabelText('Search tags'), {
      target: { value: 'documentation' },
    });

    expect(manageFrame().queryByText('git')).not.toBeInTheDocument();
    expect(manageFrame().getByText('docs')).toBeInTheDocument();
  });

  it('clearing the tag search shows all tags again', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.change(manageFrame().getByLabelText('Search tags'), {
      target: { value: 'docs' },
    });
    expect(manageFrame().queryByText('git')).not.toBeInTheDocument();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Clear search' }));

    expect(manageFrame().getByText('git')).toBeInTheDocument();
    expect(manageFrame().getByText('docs')).toBeInTheDocument();
  });

  it('shows no tags when the search matches nothing', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.change(manageFrame().getByLabelText('Search tags'), {
      target: { value: 'zzz' },
    });

    expect(manageFrame().queryByText('git')).not.toBeInTheDocument();
    expect(manageFrame().queryByText('docs')).not.toBeInTheDocument();
  });

  it('lets the tag search box expand to fill the available header width', () => {
    render(<CollectionPage />);
    openManageTags();

    expect(manageFrame().getByLabelText('Search tags').closest('.search-field')).toBeInTheDocument();

    const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
    expect(css).toMatch(
      /\.tag-management-actions \.search-field\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-width:\s*0;[^}]*\}/,
    );
  });
});