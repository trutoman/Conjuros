import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../Sidebar';
import type { Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../../hooks/useCollectionFilters';

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    tagName: 'git',
    description: '',
    color: '#123ABC',
    tagCategory: 'Development',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-2',
    tagName: 'docs',
    description: '',
    color: '#456DEF',
    tagCategory: 'Documentation',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-3',
    tagName: 'docker',
    description: '',
    color: '#789012',
    tagCategory: 'Development',
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const defaultFilters: CollectionFilters = {
  search: '',
  tags: [],
  tagFilterMode: 'all',
};

describe('Sidebar component', () => {
  it('renders categories in alphabetical order and tags alphabetically inside them', () => {
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onNavigateToTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const headers = screen.getAllByRole('heading', { level: 3 });
    expect(headers[0]).toHaveTextContent('Development');
    expect(headers[1]).toHaveTextContent('Documentation');

    const devTags = screen
      .getAllByRole('checkbox')
      .map((el) => el.closest('label')?.textContent?.trim());
    expect(devTags[0]).toBe('docker');
    expect(devTags[1]).toBe('git');
    expect(devTags[2]).toBe('docs');
  });

  it('triggers onChange callback when a tag checkbox is clicked', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={onChange}
        onNavigateToTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('docker'));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: ['docker'],
    });
  });

  it('triggers onChange callback when a tag is deselected', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={{ ...defaultFilters, tags: ['docker'] }}
        onChange={onChange}
        onNavigateToTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('docker'));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: [],
    });
  });

  it('triggers onChange callback when match mode toggle is clicked', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={onChange}
        onNavigateToTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match any tag' }));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tagFilterMode: 'any',
    });
  });

  it('triggers onNavigateToTags callback when manage tags is clicked', () => {
    const onNavigateToTags = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onNavigateToTags={onNavigateToTags}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Manage tags' }));
    expect(onNavigateToTags).toHaveBeenCalled();
  });

  it('triggers onClose callback when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onNavigateToTags={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders "Tags" as the sidebar header title', () => {
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onNavigateToTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Tags');
  });
});
