import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagsPage } from '../TagsPage';

const createMock = vi.fn();
const updateMock = vi.fn();
const removeMock = vi.fn();
const reorderMock = vi.fn();
const categoryUpdateMock = vi.fn();
const categoryRemoveMock = vi.fn();

let mockTags = [
  {
    id: 'tag-1',
    tagName: 'deploy.todo',
    tagCategory: 'Work',
    description: '',
    color: '#123ABC',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

vi.mock('../../hooks/useTags', () => ({
  useTags: () => ({
    tags: mockTags,
    total: mockTags.length,
    isLoading: false,
    error: null,
    create: createMock,
    update: updateMock,
    remove: removeMock,
    reorder: reorderMock,
  }),
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

let mockCategories = [
  {
    id: 'cat-work',
    name: 'work',
    description: '',
    tagIds: ['tag-1'],
    tagCount: 1,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-hobby',
    name: 'hobby',
    description: '',
    tagIds: [],
    tagCount: 0,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

afterEach(() => {
  mockTags = [
    {
      id: 'tag-1',
      tagName: 'deploy.todo',
      tagCategory: 'Work',
      description: '',
      color: '#123ABC',
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  mockCategories = [
    {
      id: 'cat-work',
      name: 'work',
      description: '',
      tagIds: ['tag-1'],
      tagCount: 1,
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cat-hobby',
      name: 'hobby',
      description: '',
      tagIds: [],
      tagCount: 0,
      order: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  createMock.mockReset();
  updateMock.mockReset();
  removeMock.mockReset();
  reorderMock.mockReset();
  categoryUpdateMock.mockReset();
  categoryRemoveMock.mockReset();
  categoryUpdateMock.mockResolvedValue(undefined);
  categoryRemoveMock.mockResolvedValue(undefined);
});

describe('TagsPage', () => {
  it('renders tag categories and does not expose standalone category management actions', () => {
    render(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'work' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add tag' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument();
  });

  it('renders empty categories as groups in the same list', () => {
    render(<TagsPage onBack={vi.fn()} />);

    const hobbyGroup = screen.getByTestId('tag-category-group-cat-hobby');
    expect(within(hobbyGroup).getByText('No tags in this category')).toBeInTheDocument();
    expect(screen.getByTestId('tag-category-group-cat-work')).toBeInTheDocument();
  });

  it('shows duplicate pair save failures from tag mutations', async () => {
    createMock.mockRejectedValueOnce(new Error('Tag name and category already exist'));
    render(<TagsPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByLabelText('Tag name'), { target: { value: 'deploy.todo' } });
    fireEvent.change(screen.getByLabelText('Tag category'), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText('Tag color'), { target: { value: '#123ABC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tag' }));

    expect(await screen.findByText('Tag name and category already exist')).toBeInTheDocument();
  });

  it('updates displayed categories after a tag category changes or the tag is removed', () => {
    mockCategories = [];
    const { rerender } = render(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'work' })).toBeInTheDocument();

    mockTags = [
      {
        ...mockTags[0],
        tagCategory: 'Archive',
      },
    ];
    rerender(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'archive' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'work' })).not.toBeInTheDocument();

    mockTags = [];
    rerender(<TagsPage onBack={vi.fn()} />);

    expect(screen.queryByRole('heading', { name: 'archive' })).not.toBeInTheDocument();
    expect(screen.queryByText('deploy.todo')).not.toBeInTheDocument();
  });

  it('renames a category through its group menu', () => {
    render(<TagsPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(screen.getByRole('heading', { name: 'Rename category' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'job' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(categoryUpdateMock).toHaveBeenCalledWith({
      id: 'cat-work',
      category: { name: 'job' },
    });
  });

  it('deletes an empty category through its group menu', async () => {
    render(<TagsPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for hobby' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Delete hobby?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    expect(categoryRemoveMock).toHaveBeenCalledWith('cat-hobby');
    expect(await screen.findByTestId('tag-category-group-cat-work')).toBeInTheDocument();
  });

  it('keeps the view open when deleting a non-empty category fails', async () => {
    categoryRemoveMock.mockRejectedValueOnce(new Error('Tag category is not empty'));
    render(<TagsPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    const dialog = await screen.findByRole('dialog', { name: 'Delete work?' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Tag category is not empty');
    expect(screen.getByTestId('tag-category-group-cat-work')).toBeInTheDocument();
  });

  it('scopes a rejected category delete to the dialog and clears it on cancel', async () => {
    categoryRemoveMock.mockRejectedValueOnce(new Error('Tag category is not empty'));
    render(<TagsPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    const dialog = await screen.findByRole('dialog', { name: 'Delete work?' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Tag category is not empty');

    // No ghost first-row entry: the error lives only in the dialog, not in a category group.
    const workGroup = screen.getByTestId('tag-category-group-cat-work');
    expect(within(workGroup).queryByText('Tag category is not empty')).not.toBeInTheDocument();
    expect(within(workGroup).getByTestId('tag-row-tag-1')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Delete work?' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tag category is not empty')).not.toBeInTheDocument();
    expect(screen.getByTestId('tag-category-group-cat-work')).toBeInTheDocument();
  });

  it('offers no menu for the general category', () => {
    mockCategories = [
      ...mockCategories,
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
    render(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByTestId('tag-category-group-cat-general')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Category menu for general' }),
    ).not.toBeInTheDocument();
  });
});
