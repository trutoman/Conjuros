import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { CollectionItem } from '@conjuros/contracts';
import { ThemeIcon } from './ThemeIcon';

export function ItemCardViewer({
  item,
  onClose,
  onEdit,
}: {
  item: CollectionItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const isMarkdown = item.kind === 'markdown';
  const html = useMemo(
    () => (isMarkdown ? DOMPurify.sanitize(marked.parse(item.content ?? '') as string) : ''),
    [isMarkdown, item.content],
  );

  return (
    <div className="item-form markdown-item-viewer">
      <button
        type="button"
        className="form-close"
        aria-label={isMarkdown ? 'Close markdown viewer' : 'Close file viewer'}
        onClick={onClose}
      >
        <ThemeIcon name="close" />
      </button>
      <h2>
        {isMarkdown ? 'View markdown' : 'View file'} <span className="markdown-viewer-title">{item.title}</span>
      </h2>
      {item.filename && (
        <p className="markdown-viewer-filename">
          <span>Filename</span> {item.filename}
        </p>
      )}
      {isMarkdown ? (
        <div
          className="content-pane-preview markdown-viewer-content"
          aria-label="Markdown content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="content-pane-preview markdown-viewer-content file-viewer-content"
          aria-label="File content"
        >
          {item.content ?? ''}
        </pre>
      )}
      <div className="form-actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
}