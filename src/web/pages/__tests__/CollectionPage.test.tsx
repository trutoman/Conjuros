import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionPage } from '../CollectionPage';

vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => ({
    items: [{ id: 'item-1', kind: 'spell', title: 'Git status', description: '', tags: ['git'], order: 1, relatedItemIds: [], command: 'git status', url: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }],
    total: 1, isLoading: false, error: null, create: vi.fn(), update: vi.fn(), remove: vi.fn(), reorder: vi.fn(),
  }),
}));

describe('CollectionPage', () => {
  it('renders searchable collection items and a no-results state', () => {
    render(<CollectionPage />);
    expect(screen.getByText('Git status')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search collection'), { target: { value: 'missing' } });
    expect(screen.getByText('No matching items')).toBeInTheDocument();
  });
});