import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { ItemForm } from '../ItemForm';
import { createMarkdownItem } from './itemCard.fixtures';

const availableTags: Tag[] = [
  {
    id: 'tag-git',
    tagName: 'git',
    tagCategory: 'Dev',
    description: '',
    color: '#123ABC',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-docs',
    tagName: 'docs',
    tagCategory: 'Docs',
    description: '',
    color: '#ABC123',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('ItemForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('shows inline validation when a spell has no command', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My spell' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
    expect(screen.getByText('Command is required for a spell')).toBeInTheDocument();
  });

  it('shows a single Tags label as the fieldset legend', () => {
    render(<ItemForm availableTags={availableTags} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const legend = document.querySelector('.item-form-tags legend');
    expect(legend).toHaveTextContent('Tags');
    expect(screen.getAllByText('Tags')).toHaveLength(1);
  });

  it('renders tag checkboxes as pills with their tag color', () => {
    render(<ItemForm availableTags={availableTags} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const gitPill = screen.getByRole('checkbox', { name: 'git' }).closest('label');
    expect(gitPill).toHaveClass('tag-filter-pill');
    expect(gitPill).toHaveStyle({ color: '#123ABC', borderColor: '#123ABC' });
    expect(gitPill?.getAttribute('style')).toContain(
      'color-mix(in srgb, #123ABC 8%, var(--surface))',
    );

    const docsPill = screen.getByRole('checkbox', { name: 'docs' }).closest('label');
    expect(docsPill).toHaveClass('tag-filter-pill');
    expect(docsPill).toHaveStyle({ color: '#ABC123', borderColor: '#ABC123' });
  });

  it('renders available tag names in lowercase', () => {
    const mixedCase: Tag[] = [{ ...availableTags[0], tagName: 'GIT' }];
    render(<ItemForm availableTags={mixedCase} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const gitPill = screen.getByRole('checkbox', { name: 'git' }).closest('label');
    expect(gitPill).toHaveTextContent('git');
  });

  it('renders the command field above the tag selector and above the buttons', () => {
    render(<ItemForm availableTags={availableTags} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const commandField = screen.getByLabelText('Command');
    const tagFieldset = document.querySelector('.item-form-tags');
    const actions = document.querySelector('.form-actions');

    expect(commandField.compareDocumentPosition(tagFieldset as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect((tagFieldset as Node).compareDocumentPosition(actions as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders a borderless close button that invokes onCancel', () => {
    const onCancel = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={onCancel} />);

    const closeButton = screen.getByRole('button', { name: 'Close item form' });
    expect(closeButton).toHaveTextContent('✕');
    expect(closeButton.className).toBe('form-close');
    fireEvent.click(closeButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('submits markdown content when the markdown type is selected', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'notes.md' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Notes\n\nBody' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'markdown', content: '# Notes\n\nBody' }),
    );
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('description');
  });

  it('shows the Filename input only for the markdown type', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByLabelText('Filename')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Markdown'));
    expect(screen.getByLabelText('Filename')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Spell'));
    expect(screen.queryByLabelText('Filename')).not.toBeInTheDocument();
  });

  it('renders the Filename input below Title and above the Content panes', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));

    const titleField = screen.getByLabelText('Title');
    const filenameField = screen.getByLabelText('Filename');
    const contentPane = screen.getByLabelText('Content - Edit');

    expect(titleField.compareDocumentPosition(filenameField)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(filenameField.compareDocumentPosition(contentPane)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('prefills the Filename input from a markdown item in edit mode', () => {
    render(
      <ItemForm
        item={createMarkdownItem({ id: 'item-1', filename: 'notes.md' })}
        availableTags={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect((screen.getByLabelText('Filename') as HTMLInputElement).value).toBe('notes.md');
  });

  it('submits the filename with a markdown item', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'notes.md' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Notes\n\nBody' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'markdown', filename: 'notes.md' }),
    );
  });

  it('shows the friendly filename message for an invalid filename', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'notes.txt' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(
      screen.getByText('Filename must be a name of at most 64 characters ending in .md, with no path separators'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a friendly message when a markdown item is created without a filename', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Filename is required for a markdown note')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits an empty filename to clear it when editing a markdown item', () => {
    const onSubmit = vi.fn();
    render(
      <ItemForm
        item={createMarkdownItem({ id: 'item-1', filename: 'notes.md', title: 'My note' })}
        availableTags={[]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'markdown', filename: '' }),
    );
  });

  it('shows inline validation when a markdown item has no content', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Content is required for a markdown note')).toBeInTheDocument();
  });

  it('shows inline validation when a markdown item has an empty title', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('shows inline validation for whitespace-only markdown title and content', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
    expect(screen.getByText('Content is required for a markdown note')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline validation for a whitespace-only spell command', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My spell' } });
    fireEvent.change(screen.getByLabelText('Command'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Command is required for a spell')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline validation for an invalid web-link URL', () => {
    const onSubmit = vi.fn();
    render(<ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Web link'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My link' } });
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'ftp://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('URL must use the http or https protocol')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('never shows the raw Zod validation message', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.queryByText('String must contain at least 1 character(s)')).not.toBeInTheDocument();
  });

  it('hides the Description field for markdown items', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  });

  it('renders Content - Edit and Content - View panes with no standalone Content label', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    expect(screen.getByLabelText('Content - Edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Content - View')).toBeInTheDocument();
    expect(document.querySelector('.content-panes')).not.toBeNull();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders a markdown preview that updates as the user types in the edit pane', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), { target: { value: '# Sync' } });

    const preview = document.querySelector('.content-pane-preview');
    expect(preview).not.toBeNull();
    expect(preview?.querySelector('h1')).toHaveTextContent('Sync');
    expect(screen.getByLabelText('Content - View')).toHaveClass('content-pane-preview');

    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '## Next' },
    });
    expect(preview?.querySelector('h2')).toHaveTextContent('Next');
  });

  it('does not execute scripts embedded in the markdown content', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Safe\n\n<script>window.hacked = true</script>' },
    });

    expect((window as { hacked?: boolean }).hacked).toBeUndefined();
    expect(document.querySelector('.content-pane-preview script')).toBeNull();
  });

  it('grows both panes to the taller of the editor text and the preview', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    const editor = screen.getByLabelText('Content - Edit') as HTMLTextAreaElement;
    const preview = document.querySelector('.content-pane-preview') as HTMLDivElement;

    Object.defineProperty(editor, 'scrollHeight', { value: 256, configurable: true });
    Object.defineProperty(preview, 'scrollHeight', { value: 128, configurable: true });
    fireEvent.change(editor, { target: { value: '# Notes\n\nBody\n\nMore lines' } });

    expect(editor.style.height).toBe('256px');
    expect(preview.style.height).toBe('256px');

    Object.defineProperty(editor, 'scrollHeight', { value: 128, configurable: true });
    Object.defineProperty(preview, 'scrollHeight', { value: 256, configurable: true });
    fireEvent.change(editor, { target: { value: '# Tall preview' } });

    expect(editor.style.height).toBe('256px');
    expect(preview.style.height).toBe('256px');
  });

  it('restores a previously saved draft when opening the add form', () => {
    const first = render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Draft note' },
    });
    first.unmount();

    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    expect((screen.getByLabelText('Content - Edit') as HTMLTextAreaElement).value).toBe(
      '# Draft note',
    );
  });

  it('does not restore a draft saved for a different item', () => {
    const existingItem: CollectionItem = {
      id: 'item-1',
      kind: 'markdown',
      title: 'Note',
      description: null,
      tags: [],
      order: 1,
      relatedItemIds: [],
      command: null,
      url: null,
      content: '# Saved',
      filename: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const first = render(
      <ItemForm item={existingItem} availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Item draft' },
    });
    first.unmount();

    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    expect((screen.getByLabelText('Content - Edit') as HTMLTextAreaElement).value).toBe('');
  });

  it('shows a Discard draft button when a draft exists and clears it on click', () => {
    const first = render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Draft note' },
    });
    first.unmount();

    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    expect(screen.getByRole('button', { name: 'Discard draft' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }));
    expect((screen.getByLabelText('Content - Edit') as HTMLTextAreaElement).value).toBe('');
    expect(screen.queryByRole('button', { name: 'Discard draft' })).not.toBeInTheDocument();
  });

  it('clears the saved draft after a successful submit', async () => {
    const onSubmit = vi.fn();
    const first = render(
      <ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Draft note' },
    });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    first.unmount();

    const second = render(
      <ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'notes.md' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
      await Promise.resolve();
    });
    expect(onSubmit).toHaveBeenCalled();
    second.unmount();

    render(
      <ItemForm availableTags={[]} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText('Markdown'));
    expect((screen.getByLabelText('Content - Edit') as HTMLTextAreaElement).value).toBe('');
    expect(screen.queryByRole('button', { name: 'Discard draft' })).not.toBeInTheDocument();
  });

  it('keeps the editor and preview pane headers top-aligned with and without the discard button', () => {
    const first = render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.change(screen.getByLabelText('Content - Edit'), {
      target: { value: '# Draft note' },
    });
    first.unmount();

    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));

    const headers = () => document.querySelectorAll('.content-pane-header');
    expect(headers()).toHaveLength(2);
    const [editHeader, viewHeader] = headers();
    expect(editHeader).toHaveClass('content-pane-header');
    expect(viewHeader).toHaveClass('content-pane-header');

    expect(screen.getByRole('button', { name: 'Discard draft' })).toBeInTheDocument();
    const heightsWithButton = Array.from(headers()).map((h) => getComputedStyle(h).minHeight);
    expect(new Set(heightsWithButton).size).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }));
    expect(screen.queryByRole('button', { name: 'Discard draft' })).not.toBeInTheDocument();
    const heightsWithoutButton = Array.from(headers()).map((h) => getComputedStyle(h).minHeight);
    expect(new Set(heightsWithoutButton).size).toBe(1);
    expect(heightsWithoutButton).toEqual(heightsWithButton);
  });

  it('indents a line when Tab is pressed in the markdown editor', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    const editor = screen.getByLabelText('Content - Edit') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: 'first' } });
    editor.setSelectionRange(2, 2);
    fireEvent.keyDown(editor, { key: 'Tab' });

    expect(editor.value).toBe('fi    rst');
  });

  it('dedents the current line with Shift + Tab and keeps focus in the editor', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    const editor = screen.getByLabelText('Content - Edit') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '    first' } });
    editor.focus();
    editor.setSelectionRange(9, 9);
    fireEvent.keyDown(editor, { key: 'Tab', shiftKey: true });

    expect(editor.value).toBe('first');
    expect(editor.selectionStart).toBe(5);
    expect(document.activeElement).toBe(editor);
  });

  it('dedents every selected line with Shift + Tab and keeps the selection', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    const editor = screen.getByLabelText('Content - Edit') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '    one\n    two' } });
    editor.focus();
    editor.setSelectionRange(0, 15);
    fireEvent.keyDown(editor, { key: 'Tab', shiftKey: true });

    expect(editor.value).toBe('one\ntwo');
    expect(editor.selectionStart).toBe(0);
    expect(editor.selectionEnd).toBe(7);
    expect(document.activeElement).toBe(editor);
  });

  it('auto-closes a bold marker when typing the second asterisk', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Markdown'));
    const editor = screen.getByLabelText('Content - Edit') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '**' } });
    expect(editor.value).toBe('**');
  });
});
