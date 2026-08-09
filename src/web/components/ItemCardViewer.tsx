import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { CollectionItem } from '@conjuros/contracts';

export function ItemCardViewer({
  item,
  onClose,
  onEdit,
}: {
  item: CollectionItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(item.content ?? '') as string),
    [item.content],
  );

  return (
    <div className="item-form markdown-item-viewer">
      <button
        type="button"
        className="form-close"
        aria-label="Close markdown viewer"
        onClick={onClose}
      >
        ✕
      </button>
      <h2>
        View markdown <span className="markdown-viewer-title">{item.title}</span>
      </h2>
      <div
        className="content-pane-preview markdown-viewer-content"
        aria-label="Markdown content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="form-actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
}