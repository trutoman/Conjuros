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
      content: null,
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

vi.mock('../../hooks/useTagCategories', () => ({
  useTagCategories: () => ({
    categories: mockCategories,
    total: mockCategories.length,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: categoryUpdateMock,
    remove: categoryRemoveMock,
    reorder: vi.fn(),
  }),
}));

const mockCategories = [
  {
    id: 'cat-development',
    name: 'development',
    description: '',
    tagIds: ['tag-1'],
    tagCount: 1,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-documentation',
    name: 'documentation',
    description: '',
    tagIds: ['tag-2'],
    tagCount: 1,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-general',
    name: 'general',
    description: '',
    tagIds: [],
    tagCount: 0,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const categoryUpdateMock = vi.fn().mockResolvedValue(undefined);
const categoryRemoveMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useThemes', () => ({
  useThemes: () => ({
    themes: [],
    total: 0,
    isLoading: false,
    error: null as Error | null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    activate: vi.fn(),
  }),
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
  categoryUpdateMock.mockReset();
  categoryRemoveMock.mockReset();
  categoryUpdateMock.mockResolvedValue(undefined);
  categoryRemoveMock.mockResolvedValue(undefined);
});

describe('CollectionPage tag management modal', () => {
  it('shows the management view as a modal over the persistent collection list', () => {
    render(<CollectionPage />);

    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();

    openManageTags();

    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Manage tags' })).toBeInTheDocument();
    const frame = manageFrame();
    expect(frame.getByText('git')).toBeInTheDocument();
    expect(frame.getByText('docs')).toBeInTheDocument();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse tags sidebar' })).toBeInTheDocument();
  });

  it('dismisses the management view when clicking outside the modal', () => {
    render(<CollectionPage />);
    openManageTags();

    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));

    expect(screen.queryByRole('heading', { name: 'Manage tags' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
    expect(screen.getByText('Git status')).toBeInTheDocument();
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
    expect(screen.queryByRole('heading', { name: 'Add tag' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
  });

  it('returns to the management list after canceling the tag form', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'discard.me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(tagsState.create).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
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
    expect(screen.getByLabelText('Search collection')).toBeInTheDocument();
  });

  it('dismisses only the nested tag form when clicking outside of it', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Add tag' }));
    expect(screen.getByRole('heading', { name: 'Add tag' })).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(2);

    const backdrops = screen.getAllByTestId('modal-backdrop');
    fireEvent.mouseDown(backdrops[backdrops.length - 1]);

    expect(screen.queryByRole('heading', { name: 'Add tag' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
    expect(tagsState.create).not.toHaveBeenCalled();
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
    expect(screen.getByRole('dialog', { name: 'Delete git?' })).toBeInTheDocument();

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

  it('renders the Add tag control as an icon button, not plain text', () => {
    render(<CollectionPage />);
    openManageTags();

    const addTag = manageFrame().getByRole('button', { name: 'Add tag' });
    expect(addTag.classList.contains('add-item-button')).toBe(true);
    expect(addTag.querySelector('svg.icon')).toBeInTheDocument();

    const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
    expect(css).toMatch(/\.tag-management-header \.add-item-button\s*\{/);
  });

  it('orders the tag management header as button, then heading, then search box', () => {
    render(<CollectionPage />);
    openManageTags();

    const frame = manageFrame();
    const addTag = frame.getByRole('button', { name: 'Add tag' });
    const heading = frame.getByRole('heading', { name: 'Manage tags' });
    const searchInput = frame.getByLabelText('Search tags');

    const indicator = (node: HTMLElement, follower: HTMLElement) =>
      (node.compareDocumentPosition(follower) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

    expect(indicator(addTag, heading)).toBe(true);
    expect(indicator(heading, searchInput)).toBe(true);
  });

  it('groups tags under their category with the tags stacked below the group name', () => {
    render(<CollectionPage />);
    openManageTags();

    const frame = manageFrame();
    expect(frame.getByRole('heading', { name: 'development' })).toBeInTheDocument();
    expect(frame.getByRole('heading', { name: 'documentation' })).toBeInTheDocument();

    const developmentGroup = frame.getByTestId('tag-category-group-cat-development');
    expect(within(developmentGroup).getByTestId('tag-row-tag-1')).toBeInTheDocument();
    expect(within(developmentGroup).queryByTestId('tag-row-tag-2')).not.toBeInTheDocument();
  });

  it('renders empty categories as groups in the same list', () => {
    render(<CollectionPage />);
    openManageTags();

    const frame = manageFrame();
    const generalGroup = frame.getByTestId('tag-category-group-cat-general');
    expect(within(generalGroup).getByText('No tags in this category')).toBeInTheDocument();
  });

  it('hides groups that match neither the query nor their tags', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.change(manageFrame().getByLabelText('Search tags'), {
      target: { value: 'documentation' },
    });

    expect(manageFrame().getByTestId('tag-category-group-cat-documentation')).toBeInTheDocument();
    expect(
      manageFrame().queryByTestId('tag-category-group-cat-development'),
    ).not.toBeInTheDocument();
    expect(manageFrame().queryByTestId('tag-category-group-cat-general')).not.toBeInTheDocument();
  });

  it('renames a category through its group menu', () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Category menu for development' }));
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Rename' }));
    expect(screen.getByRole('heading', { name: 'Rename category' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'dev' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(categoryUpdateMock).toHaveBeenCalledWith({
      id: 'cat-development',
      category: { name: 'dev' },
    });
  });

  it('offers no menu for the general category', () => {
    render(<CollectionPage />);
    openManageTags();

    expect(manageFrame().getByTestId('tag-category-group-cat-general')).toBeInTheDocument();
    expect(
      manageFrame().queryByRole('button', { name: 'Category menu for general' }),
    ).not.toBeInTheDocument();
  });

  it('deletes a category through the confirm dialog', async () => {
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Category menu for documentation' }));
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Delete documentation?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    expect(categoryRemoveMock).toHaveBeenCalledWith('cat-documentation');
    expect(await screen.findByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('keeps the management view open when deleting a category fails', async () => {
    categoryRemoveMock.mockRejectedValueOnce(new Error('Tag category is not empty'));
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Category menu for development' }));
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    const dialog = await screen.findByRole('dialog', { name: 'Delete development?' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Tag category is not empty');
    expect(screen.getByRole('heading', { name: 'Manage tags' })).toBeInTheDocument();
  });

  it('scopes a rejected category delete to the dialog without ghost entries in either list', async () => {
    categoryRemoveMock.mockRejectedValueOnce(new Error('Tag category is not empty'));
    render(<CollectionPage />);
    openManageTags();

    fireEvent.click(manageFrame().getByRole('button', { name: 'Category menu for development' }));
    fireEvent.click(manageFrame().getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    const dialog = await screen.findByRole('dialog', { name: 'Delete development?' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Tag category is not empty');

    // Main collection list keeps its items and shows no error frame for the failure.
    expect(screen.getByText('Git status')).toBeInTheDocument();
    const mainFrame = document.querySelector('.main-content-frame');
    expect(mainFrame).not.toBeNull();
    expect(within(mainFrame as HTMLElement).queryByText('Tag category is not empty')).not.toBeInTheDocument();

    // Manage tags list keeps its groups with no ghost first entry carrying the error.
    expect(manageFrame().queryByText('Tag category is not empty')).not.toBeInTheDocument();
    expect(manageFrame().getByTestId('tag-category-group-cat-development')).toBeInTheDocument();
    expect(manageFrame().getByTestId('tag-row-tag-1')).toBeInTheDocument();

    // Cancelling the dialog dismisses the scoped error.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog', { name: 'Delete development?' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tag category is not empty')).not.toBeInTheDocument();
  });
});