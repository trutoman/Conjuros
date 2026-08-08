import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { collectionItemInputSchema, type CollectionItem, type CollectionItemInput, type ItemKind, type Tag } from '@conjuros/contracts';
import { clearDraft, dedentSelection, handleAutoClose, handleEnter, indentSelection, loadDraft, saveDraft, type EditResult } from '../lib/markdownEditor';
import { messageForInputError } from '../lib/itemForm';
import { FormField } from './FormField';
import { ItemTypeSelector } from './ItemTypeSelector';

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
  const formId = item?.id ?? 'add';
  const markdownSavedContent = item?.content ?? '';
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? 'spell');
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [content, setContent] = useState(() => {
    const base = item?.command ?? item?.url ?? item?.content ?? '';
    return item?.kind === 'markdown' ? loadDraft(formId) ?? base : base;
  });
  const [error, setError] = useState('');
  const [hasDraft, setHasDraft] = useState(() => item?.kind === 'markdown' && loadDraft(formId) !== null);
  const editPaneRef = useRef<HTMLTextAreaElement>(null);
  const viewPaneRef = useRef<HTMLDivElement>(null);
  const draftLoadedForRef = useRef<string | null>(item?.kind === 'markdown' ? formId : null);
  const requestedSelectionRef = useRef<EditResult | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const kindRef = useRef(kind);
  kindRef.current = kind;
  const formIdRef = useRef(formId);
  formIdRef.current = formId;
  const contentRef = useRef(content);
  contentRef.current = content;
  const dirtyRef = useRef(false);

  const previewHtml = useMemo(
    () => (kind === 'markdown' ? DOMPurify.sanitize(marked.parse(content) as string) : ''),
    [kind, content],
  );

  useLayoutEffect(() => {
    if (kind !== 'markdown') return;
    const editPane = editPaneRef.current;
    const viewPane = viewPaneRef.current;
    if (!editPane || !viewPane) return;
    editPane.style.height = '0px';
    viewPane.style.height = 'auto';
    const sharedHeight = Math.max(editPane.scrollHeight, viewPane.scrollHeight);
    editPane.style.height = `${sharedHeight}px`;
    viewPane.style.height = `${sharedHeight}px`;
  }, [kind, content]);

  useLayoutEffect(() => {
    if (selectionVersion === 0) return;
    const requested = requestedSelectionRef.current;
    const editPane = editPaneRef.current;
    if (!requested || !editPane) return;
    requestedSelectionRef.current = null;
    editPane.focus();
    editPane.setSelectionRange(requested.selectionStart, requested.selectionEnd);
  }, [selectionVersion, content]);

  useLayoutEffect(() => {
    if (kind !== 'markdown' || draftLoadedForRef.current === formId) return;
    draftLoadedForRef.current = formId;
    const draft = loadDraft(formId);
    if (draft !== null) {
      setContent(draft);
      setHasDraft(true);
    }
  }, [kind, formId]);

  function applyEditResult(result: EditResult) {
    dirtyRef.current = true;
    setContent(result.value);
    requestedSelectionRef.current = result;
    setSelectionVersion((version) => version + 1);
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const editPane = event.currentTarget;
    if (event.key === 'Tab') {
      event.preventDefault();
      applyEditResult(
        event.shiftKey
          ? dedentSelection(editPane.value, editPane.selectionStart, editPane.selectionEnd)
          : indentSelection(editPane.value, editPane.selectionStart, editPane.selectionEnd),
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      applyEditResult(handleEnter(editPane.value, editPane.selectionStart, editPane.selectionEnd));
    }
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    const { selectionStart, selectionEnd } = event.target;
    const previous = content;
    if (
      next.length === previous.length + 1 &&
      selectionStart === selectionEnd &&
      selectionStart > 0
    ) {
      const result = handleAutoClose(next, selectionStart, selectionEnd);
      if (result.value !== next || result.selectionStart !== selectionStart) {
        dirtyRef.current = true;
        setContent(result.value);
        requestedSelectionRef.current = result;
        setSelectionVersion((version) => version + 1);
        return;
      }
    }
    dirtyRef.current = true;
    setContent(next);
  }

  useEffect(() => {
    if (kind !== 'markdown' || !dirtyRef.current) return;
    const timer = window.setTimeout(() => {
      saveDraft(formId, contentRef.current);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [content, kind, formId]);

  useEffect(() => {
    return () => {
      if (kindRef.current === 'markdown' && dirtyRef.current) {
        saveDraft(formIdRef.current, contentRef.current);
      }
    };
  }, []);

  function handleDiscardDraft() {
    clearDraft(formId);
    dirtyRef.current = false;
    setHasDraft(false);
    setContent(markdownSavedContent);
  }

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
    const message = messageForInputError(payload, result);
    if (message !== null) {
      setError(message);
      return;
    }
    if (!result.success) return;
    await onSubmit(result.data);
    clearDraft(formId);
    dirtyRef.current = false;
    setHasDraft(false);
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
            <div className="content-pane">
              <span className="content-pane-header">
                Content - Edit
                {hasDraft && (
                  <button type="button" className="quiet" onClick={handleDiscardDraft}>Discard draft</button>
                )}
              </span>
              <textarea
                ref={editPaneRef}
                aria-label="Content - Edit"
                value={content}
                onKeyDown={handleEditorKeyDown}
                onChange={handleContentChange}
              />
            </div>
            <div className="content-pane">
              <span className="content-pane-header">Content - View</span>
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
