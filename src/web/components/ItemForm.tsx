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
  const [content, setContent] = useState(item?.command ?? item?.url ?? ''); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const result = collectionItemInputSchema.safeParse({ kind, title, description, tags, relatedItemIds: [], ...(kind === 'spell' ? { command: content } : { url: content }) });
    if (!result.success) { setError(kind === 'spell' && !content ? 'Command is required for a spell' : result.error.issues[0]?.message ?? 'Check the item details'); return; }
    await onSubmit(result.data);
  }
  return <form className="item-form" onSubmit={submit}><h2>{item ? 'Edit item' : 'Add item'}</h2><ItemTypeSelector value={kind} onChange={setKind} /><FormField label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} /></FormField><FormField label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField><FormField label="Tags"><fieldset><legend className="sr-only">Owned tags</legend>{availableTags.map((tag) => { const normalized = tag.tagName.toLowerCase(); const checked = tags.includes(normalized); return <label key={tag.id}><input type="checkbox" checked={checked} onChange={(event) => { const next = event.target.checked ? [...tags, normalized] : tags.filter((candidate) => candidate !== normalized); setTags([...new Set(next)]); }} />{tag.tagName}</label>; })}</fieldset></FormField><FormField label={kind === 'spell' ? 'Command' : 'URL'} error={error}><textarea value={content} onChange={(event) => setContent(event.target.value)} /></FormField><div className="form-actions"><button type="submit">Save item</button><button type="button" className="quiet" onClick={onCancel}>Cancel</button></div></form>;
}