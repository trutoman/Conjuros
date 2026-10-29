import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { CollectionItem } from '@conjuros/contracts';
import { downloadAttachment } from '../lib/downloadAttachment';
import {
  getAttachmentPreviewUrl,
  isImageAttachment,
} from '../lib/attachmentPreview';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState('');
  const isMarkdown = item.kind === 'markdown';
  const isAttachment = item.kind === 'attachment';
  const showsImagePreview = isImageAttachment(item);
  const viewerKind = isMarkdown ? 'markdown' : isAttachment ? 'attachment' : 'file';
  const html = useMemo(
    () => (isMarkdown ? DOMPurify.sanitize(marked.parse(item.content ?? '') as string) : ''),
    [isMarkdown, item.content],
  );

  useEffect(() => {
    if (!showsImagePreview) {
      setPreviewUrl(null);
      setPreviewError('');
      return;
    }

    let cancelled = false;
    setPreviewUrl(null);
    setPreviewError('');
    getAttachmentPreviewUrl(item)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPreviewError('Could not load image preview');
      });

    return () => {
      cancelled = true;
    };
  }, [item, showsImagePreview]);

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
      {showsImagePreview && (
        <div className="attachment-image-pane">
          {previewUrl ? (
            <figure className="attachment-image-frame">
              <img
                className="attachment-image-preview"
                src={previewUrl}
                alt={item.filename ?? item.title}
                onError={() => {
                  setPreviewUrl(null);
                  setPreviewError('Could not load image preview');
                }}
              />
            </figure>
          ) : previewError ? (
            <p className="field-error" role="alert">
              {previewError}
            </p>
          ) : (
            <p className="attachment-viewer-status">Loading image preview…</p>
          )}
        </div>
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