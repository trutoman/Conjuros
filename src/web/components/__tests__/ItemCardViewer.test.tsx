import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemCardViewer } from '../ItemCardViewer';
import { clearAttachmentPreviewCache } from '../../lib/attachmentPreview';
import { createAttachmentItem, createFileItem, createMarkdownItem } from './itemCard.fixtures';

afterEach(() => {
  clearAttachmentPreviewCache();
  vi.unstubAllGlobals();
});

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

  describe('for file items', () => {
    it('shows "View file" and the item title in the header', () => {
      render(<ItemCardViewer item={createFileItem({ title: 'Deploy log' })} onClose={vi.fn()} onEdit={vi.fn()} />);

      expect(screen.getByRole('heading', { name: /View file/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Deploy log/ })).toBeInTheDocument();
    });

    it('renders the full file content as plain preformatted text', () => {
      const { container } = render(<ItemCardViewer item={createFileItem()} onClose={vi.fn()} onEdit={vi.fn()} />);

      const content = container.querySelector('.file-viewer-content');
      expect(content?.tagName.toLowerCase()).toBe('pre');
      expect(content).toHaveTextContent('Started at 09:00');
      expect(content).toHaveTextContent('Finished ok');
    });

    it('does not parse markdown markers in file content', () => {
      const { container } = render(
        <ItemCardViewer
          item={createFileItem({ content: '# Not a heading\n\n**Not bold**' })}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      const content = container.querySelector('.file-viewer-content');
      expect(content).toHaveTextContent('# Not a heading');
      expect(content).toHaveTextContent('**Not bold**');
      expect(content?.querySelector('h1')).toBeNull();
    });

    it('shows the file filename and renders scripts as inert text', () => {
      const { container } = render(
        <ItemCardViewer
          item={createFileItem({ content: '<script>window.__pwn = true</script>' })}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(screen.getByText('Filename')).toBeInTheDocument();
      expect(screen.getByText('deploy.log')).toBeInTheDocument();
      const content = container.querySelector('.file-viewer-content');
      expect(content?.querySelector('script')).toBeNull();
      expect((window as unknown as { __pwn?: boolean }).__pwn).toBeUndefined();
    });

    it('calls onClose via the close button with a file label', () => {
      const onClose = vi.fn();
      render(<ItemCardViewer item={createFileItem()} onClose={onClose} onEdit={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close file viewer' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachment viewer', () => {
    it('shows attachment metadata and no content body', () => {
      render(
        <ItemCardViewer
          item={createAttachmentItem()}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(screen.getByRole('heading', { name: /View attachment/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Quarterly report/ })).toBeInTheDocument();
      expect(screen.getByText('Q3 results')).toBeInTheDocument();
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('No file stored yet')).toBeInTheDocument();
      expect(screen.queryByLabelText('Markdown content')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('File content')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Download file' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Open link' })).not.toBeInTheDocument();
    });

    it('closes and edits through the attachment controls', () => {
      const onClose = vi.fn();
      const onEdit = vi.fn();
      render(<ItemCardViewer item={createAttachmentItem()} onClose={onClose} onEdit={onEdit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close attachment viewer' }));
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('renders a stored image preview inside a frame', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          url: 'https://storage.test/image.png?token=1',
          expiresInSeconds: 300,
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const { container } = render(
        <ItemCardViewer
          item={createAttachmentItem({
            filename: 'photo.png',
            storagePath: 'owner/file.png',
            mimeType: 'image/png',
          })}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(screen.getByText('Loading image preview…')).toBeInTheDocument();
      const image = await screen.findByRole('img', { name: 'photo.png' });

      expect(image).toHaveAttribute('src', 'https://storage.test/image.png?token=1');
      expect(container.querySelector('.attachment-image-frame')).not.toBeNull();
      expect(screen.getByRole('button', { name: 'Download attachment' })).toBeInTheDocument();
      expect(screen.getByText('File stored')).toBeInTheDocument();
    });

    it('reports a preview failure while keeping the metadata and download', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: 'Storage unavailable' } }),
      });
      vi.stubGlobal('fetch', fetchMock);

      render(
        <ItemCardViewer
          item={createAttachmentItem({
            filename: 'photo.png',
            storagePath: 'owner/file.png',
            mimeType: 'image/png',
          })}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(await screen.findByRole('alert')).toHaveTextContent('Could not load image preview');
      await waitFor(() =>
        expect(screen.queryByText('Loading image preview…')).not.toBeInTheDocument(),
      );
      expect(screen.getByRole('button', { name: 'Download attachment' })).toBeInTheDocument();
      expect(screen.getByText('File stored')).toBeInTheDocument();
      expect(screen.getByText('photo.png')).toBeInTheDocument();
    });

    it('does not request a preview for non-image attachments', () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      render(
        <ItemCardViewer
          item={createAttachmentItem({
            filename: 'contract.pdf',
            storagePath: 'owner/file.pdf',
            mimeType: 'application/pdf',
          })}
          onClose={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(screen.queryByRole('img', { name: 'contract.pdf' })).not.toBeInTheDocument();
      expect(screen.queryByText('Loading image preview…')).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(screen.getByText('File stored')).toBeInTheDocument();
    });
  });
});