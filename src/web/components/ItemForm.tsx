import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { collectionItemInputSchema, type CollectionItem, type CollectionItemInput, type ItemKind, type Tag } from '@conjuros/contracts';
import { FormField } from './FormField';
import { ItemTypeSelector } from './ItemTypeSelector';

function autoResizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = '0px';
  element.style.height = `${element.scrollHeight}px`;
}

export function ItemForm({
  item,
  availableTags,
  onSubmit,
  onCancel,
}: {
  item?: CollectionItem;
  availableTags: Tag[];
  onSubmit: (input: CollectionItemInput) => Promise<unknown> | void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? 'spell');
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [content, setContent] = useState(item?.command ?? item?.url ?? item?.content ?? '');
  const [error, setError] = useState('');
  const editPaneRef = useRef<HTMLTextAreaElement>(null);
  const viewPaneRef = useRef<HTMLDivElement>(null);

  const previewHtml = useMemo(
    () => (kind === 'markdown' ? DOMPurify.sanitize(marked.parse(content) as string) : ''),
    [kind, content],
  );

  useLayoutEffect(() => {
    if (kind !== 'markdown') return;
    const editPane = editPaneRef.current;
    if (!editPane) return;
    autoResizeTextarea(editPane);
    const viewPane = viewPaneRef.current;
    if (viewPane) {
      viewPane.style.height = editPane.style.height;
    }
  }, [kind, content]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const payload = {
      kind,
      title,
      tags,
      relatedItemIds: [],
      ...(kind === 'markdown' ? {} : { description }),
      ...(kind === 'spell' ? { command: content } : kind === 'web-link' ? { url: content } : { content }),
    };
    const result = collectionItemInputSchema.safeParse(payload);
    if (!result.success) {
      setError(kind === 'spell' && !content ? 'Command is required for a spell' : kind === 'markdown' && !content ? 'Content is required for a markdown note' : result.error.issues[0]?.message ?? 'Check the item details');
      return;
    }
    await onSubmit(result.data);
  }

  return (
    <form className={`item-form${kind === 'markdown' ? ' item-form--markdown' : ''}`} onSubmit={submit}>
      <button type="button" className="form-close" aria-label="Close item form" onClick={onCancel}>✕</button>
      <h2>{item ? 'Edit item' : 'Add item'}</h2>
      <ItemTypeSelector value={kind} onChange={setKind} />
      <FormField label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} /></FormField>
      {kind !== 'markdown' && (
        <FormField label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
      )}
      {kind === 'markdown' ? (
        <div className="form-field">
          <div className="content-panes">
            <label className="content-pane">
              <span>Content - Edit</span>
              <textarea ref={editPaneRef} value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
            <div className="content-pane">
              <span>Content - View</span>
              <div
                className="content-pane-preview"
                ref={viewPaneRef}
                aria-label="Content - View"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
          {error && <span className="field-error" role="alert">{error}</span>}
        </div>
      ) : (
        <FormField label={kind === 'spell' ? 'Command' : 'URL'} error={error}>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} />
        </FormField>
      )}
      <fieldset className="item-form-tags">
        <legend>Tags</legend>
        {availableTags.map((tag) => {
          const normalized = tag.tagName.toLowerCase();
          const checked = tags.includes(normalized);
          return (
            <label
              key={tag.id}
              className="tag-filter-pill"
              style={{
                color: tag.color,
                borderColor: tag.color,
                background: `color-mix(in srgb, ${tag.color} ${checked ? 20 : 8}%, var(--surface))`,
              }}
            >
              <input
                type="checkbox"
                aria-label={normalized}
                checked={checked}
                onChange={(event) => {
                  const next = event.target.checked ? [...tags, normalized] : tags.filter((candidate) => candidate !== normalized);
                  setTags([...new Set(next)]);
                }}
              />
              {normalized}
            </label>
          );
        })}
      </fieldset>
      <div className="form-actions">
        <button type="submit">Save item</button>
        <button type="button" className="quiet" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
