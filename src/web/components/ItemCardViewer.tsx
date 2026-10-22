import { useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { CollectionItem } from '@conjuros/contracts';
import { downloadAttachment } from '../lib/downloadAttachment';
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
  const [downloadError, setDownloadError] = useState('');
  const isMarkdown = item.kind === 'markdown';
  const isAttachment = item.kind === 'attachment';
  const viewerKind = isMarkdown ? 'markdown' : isAttachment ? 'attachment' : 'file';
  const html = useMemo(
    () => (isMarkdown ? DOMPurify.sanitize(marked.parse(item.content ?? '') as string) : ''),
    [isMarkdown, item.content],
  );

  return (
    <div className="item-form markdown-item-viewer">
      <button
        type="button"
        className="form-close"
        aria-label={`Close ${viewerKind} viewer`}
        onClick={onClose}
      >
        <ThemeIcon name="close" />
      </button>
      <h2>
        {isMarkdown ? 'View markdown' : isAttachment ? 'View attachment' : 'View file'}{' '}
        <span className="markdown-viewer-title">{item.title}</span>
      </h2>
      {isAttachment && item.description && (
        <p className="attachment-viewer-description">{item.description}</p>
      )}
      {item.filename && (
        <p className="markdown-viewer-filename">
          <span>Filename</span> {item.filename}
        </p>
      )}
      {isAttachment ? (
        item.storagePath ? (
          <div className="attachment-viewer-status">
            <p>File stored</p>
            <button
              type="button"
              onClick={() => {
                setDownloadError('');
                downloadAttachment(item.id).catch(() =>
                  setDownloadError('Could not download attachment'),
                );
              }}
            >
              Download attachment
            </button>
            {downloadError && (
              <p className="field-error" role="alert">
                {downloadError}
              </p>
            )}
          </div>
        ) : (
          <p className="attachment-viewer-status">No file stored yet</p>
        )
      ) : isMarkdown ? (
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