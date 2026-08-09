import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ItemCardViewer } from '../ItemCardViewer';
import { createMarkdownItem } from './itemCard.fixtures';

describe('ItemCardViewer', () => {
  it('shows "View markdown" and the item title in the header', () => {
    render(
      <ItemCardViewer item={createMarkdownItem({ title: 'Research notes' })} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { name: /View markdown/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Research notes/ })).toBeInTheDocument();
  });

  it('shows the item filename with a label when present', () => {
    render(
      <ItemCardViewer item={createMarkdownItem({ filename: 'research-notes.md' })} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    expect(screen.getByText('Filename')).toBeInTheDocument();
    expect(screen.getByText('research-notes.md')).toBeInTheDocument();
  });

  it('omits the filename label when the item has no filename', () => {
    render(
      <ItemCardViewer item={createMarkdownItem({ filename: null })} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    expect(screen.queryByText('Filename')).not.toBeInTheDocument();
  });

  it('renders the stored markdown content as HTML', () => {
    const { container } = render(
      <ItemCardViewer item={createMarkdownItem()} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    const content = container.querySelector('.markdown-viewer-content');
    expect(content).toHaveTextContent('Heading');
    expect(content?.querySelector('h1')).toHaveTextContent('Heading');
    expect(content).toHaveTextContent('Some bold text.');
    expect(content).toHaveTextContent('Second line stays hidden.');
  });

  it('renders the full content, not the single-line slug', () => {
    const { container } = render(
      <ItemCardViewer item={createMarkdownItem()} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    const content = container.querySelector('.markdown-viewer-content');
    expect(content).toHaveTextContent('Second line stays hidden.');
  });

  it('sanitizes script content out of the rendered markdown', () => {
    const { container } = render(
      <ItemCardViewer
        item={createMarkdownItem({ content: '<p>Safe</p><script>window.__pwn = true</script>' })}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    const content = container.querySelector('.markdown-viewer-content');
    expect(content?.querySelector('script')).toBeNull();
    expect(content).toHaveTextContent('Safe');
    expect((window as unknown as { __pwn?: boolean }).__pwn).toBeUndefined();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ItemCardViewer item={createMarkdownItem()} onClose={onClose} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close markdown viewer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when the Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ItemCardViewer item={createMarkdownItem()} onClose={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});