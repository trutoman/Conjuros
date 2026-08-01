import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagList } from '../TagList';

const tags = [
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
  {
    id: 'tag-2',
    tagName: 'deploy.todo',
    tagCategory: 'Personal',
    description: '',
    color: '#ABC123',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('TagList', () => {
  it('renders each tag category next to the tag name', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getAllByText('deploy.todo')).toHaveLength(2);
  });

  it('wires edit, delete, and move actions to the selected tag', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(<TagList tags={tags} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Move down' })[1]);

    expect(onEdit).toHaveBeenCalledWith(tags[1]);
    expect(onDelete).toHaveBeenCalledWith(tags[1]);
    expect(onMove).toHaveBeenCalledWith('tag-2', 3);
  });
});
