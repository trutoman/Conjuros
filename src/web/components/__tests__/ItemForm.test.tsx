import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Tag } from '@conjuros/contracts';
import { ItemForm } from '../ItemForm';

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
    expect(gitPill?.getAttribute('style')).toContain('color-mix(in srgb, #123ABC 8%, var(--surface))');

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
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: '# Notes\n\nBody' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'markdown', content: '# Notes\n\nBody' }),
    );
  });

  it('shows inline validation when a markdown item has no content', () => {
    render(<ItemForm availableTags={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Markdown'));
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Content is required for a markdown note')).toBeInTheDocument();
  });
});