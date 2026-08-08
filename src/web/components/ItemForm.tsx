import { useState } from 'react';
import { collectionItemInputSchema, type CollectionItem, type CollectionItemInput, type ItemKind, type Tag } from '@conjuros/contracts';
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
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? 'spell');
  const [title, setTitle] = useState(item?.title ?? ''); const [description, setDescription] = useState(item?.description ?? ''); const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [content, setContent] = useState(item?.command ?? item?.url ?? item?.content ?? ''); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const result = collectionItemInputSchema.safeParse({ kind, title, description, tags, relatedItemIds: [], ...(kind === 'spell' ? { command: content } : kind === 'web-link' ? { url: content } : { content }) });
    if (!result.success) { setError(kind === 'spell' && !content ? 'Command is required for a spell' : kind === 'markdown' && !content ? 'Content is required for a markdown note' : result.error.issues[0]?.message ?? 'Check the item details'); return; }
    await onSubmit(result.data);
  }
  return <form className="item-form" onSubmit={submit}><button type="button" className="form-close" aria-label="Close item form" onClick={onCancel}>✕</button><h2>{item ? 'Edit item' : 'Add item'}</h2><ItemTypeSelector value={kind} onChange={setKind} /><FormField label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} /></FormField><FormField label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField><FormField label={kind === 'spell' ? 'Command' : kind === 'web-link' ? 'URL' : 'Content'} error={error}><textarea value={content} onChange={(event) => setContent(event.target.value)} /></FormField><fieldset className="item-form-tags"><legend>Tags</legend>{availableTags.map((tag) => { const normalized = tag.tagName.toLowerCase(); const checked = tags.includes(normalized); return <label key={tag.id} className="tag-filter-pill" style={{ color: tag.color, borderColor: tag.color, background: `color-mix(in srgb, ${tag.color} ${checked ? 20 : 8}%, var(--surface))` }}><input type="checkbox" aria-label={normalized} checked={checked} onChange={(event) => { const next = event.target.checked ? [...tags, normalized] : tags.filter((candidate) => candidate !== normalized); setTags([...new Set(next)]); }} />{normalized}</label>; })}</fieldset><div className="form-actions"><button type="submit">Save item</button><button type="button" className="quiet" onClick={onCancel}>Cancel</button></div></form>;
}