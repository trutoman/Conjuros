import { fireEvent, render, screen, within } from '@testing-library/react';
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

const categories = [
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
    id: 'cat-personal',
    name: 'personal',
    description: '',
    tagIds: ['tag-2'],
    tagCount: 1,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-hobby',
    name: 'hobby',
    description: '',
    tagIds: [],
    tagCount: 0,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-general',
    name: 'general',
    description: '',
    tagIds: [],
    tagCount: 0,
    order: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('TagList', () => {
  it('renders each tag as a colored pill with its metadata', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    const pillFor = (name: string) =>
      screen.getByText(name).closest('.tag-filter-pill') as HTMLElement | null;
    const deployTodo = pillFor('deploy.todo');
    const deployDone = pillFor('deploy.done');
    expect(deployTodo).toHaveStyle({ color: '#123ABC', borderColor: '#123ABC' });
    expect(deployTodo?.getAttribute('style')).toContain(
      'color-mix(in srgb, #123ABC 8%, var(--surface))',
    );
    expect(deployDone).toHaveStyle({ color: '#ABC123', borderColor: '#ABC123' });

    expect(screen.getByRole('heading', { name: 'work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'personal' })).toBeInTheDocument();
  });

  it('renders tag names and categories in lowercase', () => {
    const mixedCase = [
      { ...tags[0], tagName: 'Deploy.Todo', tagCategory: 'Work' },
      { ...tags[1], tagName: 'deploy.done', tagCategory: 'PERSONAL' },
    ];
    render(<TagList tags={mixedCase} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    expect(screen.getByText('deploy.todo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'personal' })).toBeInTheDocument();
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

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(tags[1]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[0]);
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

    const firstRow = screen.getByTestId('tag-row-tag-2');
    firstRow.focus();
    fireEvent.keyDown(firstRow, { key: 'ArrowDown', altKey: true });

    expect(document.activeElement).toBe(firstRow);
    expect(onMove).toHaveBeenCalledWith('tag-2', 1);
  });

  it('ignores out-of-bounds keyboard reorder moves', () => {
    const onMove = vi.fn();
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={onMove} />);

    const firstRow = screen.getByTestId('tag-row-tag-2');
    fireEvent.keyDown(firstRow, { key: 'ArrowUp', altKey: true });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('groups tags under alphabetically ordered category headings', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    const headings = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(headings).toEqual(['general', 'hobby', 'personal', 'work']);

    const workGroup = screen.getByTestId('tag-category-group-cat-work');
    expect(within(workGroup).getByTestId('tag-row-tag-1')).toBeInTheDocument();
    expect(within(workGroup).queryByTestId('tag-row-tag-2')).not.toBeInTheDocument();

    const personalGroup = screen.getByTestId('tag-category-group-cat-personal');
    expect(within(personalGroup).getByTestId('tag-row-tag-2')).toBeInTheDocument();
  });

  it('renders empty categories as groups with no tags', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    const hobbyGroup = screen.getByTestId('tag-category-group-cat-hobby');
    expect(within(hobbyGroup).getByText('No tags in this category')).toBeInTheDocument();
    expect(within(hobbyGroup).queryByTestId(/tag-row-/)).not.toBeInTheDocument();
  });

  it('lays out each group with a left-aligned name and a vertical right-aligned tag stack', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    const header = screen
      .getByTestId('tag-category-group-cat-work')
      .querySelector('.category-group-header');
    expect(header?.querySelector('h3')?.textContent).toBe('work');

    const css = readFileSync(join(process.cwd(), 'src/web/index.css'), 'utf8');
    expect(css).toMatch(
      /\.tag-panel \.category-group-header\s*\{[^}]*justify-content:\s*space-between;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.tag-panel \.category-group-header h3\s*\{[^}]*text-align:\s*left;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.tag-panel \.category-tags-list\s*\{[^}]*flex-direction:\s*column;[^}]*\}/,
    );
  });

  it('hides groups with no query match and keeps groups matching by tag', () => {
    const props = {
      categories,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onMove: vi.fn(),
      onRenameCategory: vi.fn(),
      onDeleteCategory: vi.fn(),
    };

    const { unmount } = render(<TagList tags={tags} query="work" {...props} />);
    expect(screen.getByTestId('tag-category-group-cat-work')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-category-group-cat-personal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tag-category-group-cat-hobby')).not.toBeInTheDocument();
    unmount();

    render(<TagList tags={tags} query="deploy.done" {...props} />);
    expect(screen.getByTestId('tag-category-group-cat-personal')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-category-group-cat-work')).not.toBeInTheDocument();
  });

  it('keeps an empty category visible when the query matches its name', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        query="hob"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    expect(screen.getByTestId('tag-category-group-cat-hobby')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-category-group-cat-work')).not.toBeInTheDocument();
  });

  it('wires category rename and delete from the group menu', () => {
    const onRenameCategory = vi.fn();
    const onDeleteCategory = vi.fn();
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={onRenameCategory}
        onDeleteCategory={onDeleteCategory}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));
    expect(
      screen.getByRole('menu', { name: 'Category options for work' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(onRenameCategory).toHaveBeenCalledWith(categories[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDeleteCategory).toHaveBeenCalledWith(categories[0]);
  });

  it('offers no actions menu for the general category', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Category menu for general' }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('tag-category-group-cat-general')).toBeInTheDocument();
  });

  it('renders no category menus without category handlers', () => {
    render(<TagList tags={tags} onEdit={vi.fn()} onDelete={vi.fn()} onMove={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Category menu for / })).not.toBeInTheDocument();
  });

  it('closes the tag menu when a category menu opens', () => {
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Tag menu' })[0]);
    expect(screen.getByRole('menu', { name: 'Tag options' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Category menu for work' }));

    expect(screen.queryByRole('menu', { name: 'Tag options' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('menu', { name: 'Category options for work' }),
    ).toBeInTheDocument();
  });

  it('reorders across groups through the flattened order without changing categories', () => {
    const onMove = vi.fn();
    render(
      <TagList
        tags={tags}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={onMove}
        onRenameCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />,
    );

    fireEvent.dragStart(screen.getByTestId('tag-row-tag-1'));
    fireEvent.dragOver(screen.getByTestId('tag-row-tag-2'));
    fireEvent.drop(screen.getByTestId('tag-row-tag-2'));

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('tag-1', 2);
  });
});
