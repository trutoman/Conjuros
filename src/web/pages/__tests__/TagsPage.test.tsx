import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagsPage } from '../TagsPage';

const createMock = vi.fn();
const updateMock = vi.fn();
const removeMock = vi.fn();
const reorderMock = vi.fn();

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
  createMock.mockReset();
  updateMock.mockReset();
  removeMock.mockReset();
  reorderMock.mockReset();
});

describe('TagsPage', () => {
  it('renders tag categories and does not expose standalone category management actions', () => {
    render(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add tag' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument();
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
    const { rerender } = render(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByText('work')).toBeInTheDocument();

    mockTags = [
      {
        ...mockTags[0],
        tagCategory: 'Archive',
      },
    ];
    rerender(<TagsPage onBack={vi.fn()} />);

    expect(screen.getByText('archive')).toBeInTheDocument();
    expect(screen.queryByText('work')).not.toBeInTheDocument();

    mockTags = [];
    rerender(<TagsPage onBack={vi.fn()} />);

    expect(screen.queryByText('archive')).not.toBeInTheDocument();
    expect(screen.queryByText('deploy.todo')).not.toBeInTheDocument();
  });
});
