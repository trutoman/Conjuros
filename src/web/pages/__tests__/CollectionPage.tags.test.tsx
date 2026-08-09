import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionPage } from '../CollectionPage';

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => ({
    items: [
      { id: 'item-1', kind: 'spell', title: 'Git only', description: '', tags: ['git'], order: 1, relatedItemIds: [], command: 'git status', url: null, content: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'item-2', kind: 'spell', title: 'Docs only', description: '', tags: ['docs'], order: 2, relatedItemIds: [], command: 'cat docs', url: null, content: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'item-3', kind: 'spell', title: 'Both tags', description: '', tags: ['git', 'docs'], order: 3, relatedItemIds: [], command: 'echo both', url: null, content: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ],
    total: 3,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  }),
}));

vi.mock('../../hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      { id: 'tag-1', tagName: 'git', description: '', color: '#123ABC', order: 1, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'tag-2', tagName: 'docs', description: '', color: '#ABC123', order: 2, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ],
    total: 2,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  }),
}));

vi.mock('../../hooks/useThemes', () => ({
  useThemes: () => ({
    themes: [],
    total: 0,
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    activate: vi.fn(),
  }),
}));

describe('CollectionPage tag filters', () => {
  it('switches between all and any tag filter modes', () => {
    render(<CollectionPage />);

    fireEvent.click(screen.getByLabelText('git'));
    fireEvent.click(screen.getByLabelText('docs'));

    expect(screen.getByText('Both tags')).toBeInTheDocument();
    expect(screen.queryByText('Git only')).not.toBeInTheDocument();
    expect(screen.queryByText('Docs only')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Match any tag' }));

    expect(screen.getByText('Git only')).toBeInTheDocument();
    expect(screen.getByText('Docs only')).toBeInTheDocument();
    expect(screen.getByText('Both tags')).toBeInTheDocument();
  });
});
