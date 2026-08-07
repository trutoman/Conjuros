import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
    tagName: 'deploy.done',
    tagCategory: 'Personal',
    description: '',
    color: '#ABC123',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('TagList', () => {
  it('renders each tag as a colored pill with its metadata', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    const pills = screen.getAllByText(/^deploy\./).map((node) => node.closest('.tag-filter-pill'));
    expect(pills).toHaveLength(2);
    expect(pills[0]).toHaveStyle({ color: '#123ABC', borderColor: '#123ABC' });
    expect(pills[0]?.getAttribute('style')).toContain(
      'color-mix(in srgb, #123ABC 8%, var(--surface))',
    );
    expect(pills[1]).toHaveStyle({ color: '#ABC123', borderColor: '#ABC123' });

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
  });

  it('renders tag names and categories in lowercase', () => {
    const mixedCase = [
      { ...tags[0], tagName: 'Deploy.Todo', tagCategory: 'Work' },
      { ...tags[1], tagName: 'deploy.done', tagCategory: 'PERSONAL' },
    ];
    render(<TagList tags={mixedCase} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    expect(screen.getByText('deploy.todo')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
  });

  it('does not render inline edit, delete, move up, or move down buttons', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move .* up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move .* down/i })).not.toBeInTheDocument();
  });

  it('renders the tag description inline and truncated, and omits it when empty', () => {
    const withDescription = [
      { ...tags[0], description: 'Deploys the todo pipeline' },
      { ...tags[1], description: '' },
    ];

    render(
      <TagList tags={withDescription} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />,
    );

    const description = screen.getByText('Deploys the todo pipeline');
    expect(description).toHaveClass('tag-description');
    expect(description.closest('.tag-row-label')).toBeInTheDocument();
    expect(description.closest('.tag-row-label')?.children).toContain(description);
    expect(document.querySelectorAll('.tag-description')).toHaveLength(1);

    const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
    expect(css).toMatch(
      /\.tag-row-label\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.tag-description\s*\{[^}]*white-space:\s*nowrap;[^}]*overflow:\s*hidden;[^}]*text-overflow:\s*ellipsis;[^}]*\}/,
    );
  });

  it('wires edit and delete from the dropdown menu to the selected tag', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<TagList tags={tags} onEdit={onEdit} onDelete={onDelete} onMove={vi.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[1]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(tags[1]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[1]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(tags[1]);
  });

  it('keeps at most one dropdown menu open at a time', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[1]);

    expect(screen.getAllByRole('menu', { name: 'Tag options' })).toHaveLength(1);
  });

  it('reorders with drag and drop when dropped on a different row', () => {
    const onMove = vi.fn();
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={onMove} />);

    const firstRow = screen.getByTestId('tag-row-tag-1');
    const secondRow = screen.getByTestId('tag-row-tag-2');

    fireEvent.dragStart(firstRow);
    fireEvent.dragOver(secondRow);
    fireEvent.drop(secondRow);

    expect(onMove).toHaveBeenCalledWith('tag-1', 2);
  });

  it('does not reorder when dropped on the same row', () => {
    const onMove = vi.fn();
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={onMove} />);

    const firstRow = screen.getByTestId('tag-row-tag-1');
    fireEvent.dragStart(firstRow);
    fireEvent.drop(firstRow);

    expect(onMove).not.toHaveBeenCalled();
  });

  it('supports Alt+Arrow keyboard reordering and preserves focus', () => {
    const onMove = vi.fn();
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={onMove} />);

    const secondRow = screen.getByTestId('tag-row-tag-2');
    secondRow.focus();
    fireEvent.keyDown(secondRow, { key: 'ArrowUp', altKey: true });

    expect(document.activeElement).toBe(secondRow);
    expect(onMove).toHaveBeenCalledWith('tag-2', 1);
  });

  it('ignores out-of-bounds keyboard reorder moves', () => {
    const onMove = vi.fn();
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={onMove} />);

    const firstRow = screen.getByTestId('tag-row-tag-1');
    fireEvent.keyDown(firstRow, { key: 'ArrowUp', altKey: true });

    expect(onMove).not.toHaveBeenCalled();
  });
});
