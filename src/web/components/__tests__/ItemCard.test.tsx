import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemCard } from '../ItemCard';

const spell = {
  id: 'spell-1', kind: 'spell' as const, title: 'Status', description: 'Check repository state',
  tags: ['git' as const], order: 1, relatedItemIds: [], command: 'git status --short', url: null,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};

afterEach(() => vi.restoreAllMocks());

describe('ItemCard', () => {
  it('copies the exact spell command and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ItemCard item={spell} onEdit={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }));

    expect(writeText).toHaveBeenCalledWith('git status --short');
    expect(await screen.findByText('Command copied')).toBeInTheDocument();
  });

  it('opens a link only when the open action is clicked', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ItemCard item={{ ...spell, kind: 'web-link', command: null, url: 'https://example.com' }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open link' }));
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });
});