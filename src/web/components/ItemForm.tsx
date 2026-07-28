import { useState } from 'react';
import { collectionItemInputSchema, type CollectionItem, type CollectionItemInput, type ItemKind } from '@conjuros/contracts';
import { FormField } from './FormField';
import { ItemTypeSelector } from './ItemTypeSelector';

export function ItemForm({ item, onSubmit, onCancel }: { item?: CollectionItem; onSubmit: (input: CollectionItemInput) => Promise<unknown> | void; onCancel: () => void }) {
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? 'spell');
  const [title, setTitle] = useState(item?.title ?? ''); const [description, setDescription] = useState(item?.description ?? ''); const [tags, setTags] = useState(item?.tags.join(', ') ?? '');
  const [content, setContent] = useState(item?.command ?? item?.url ?? ''); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const result = collectionItemInputSchema.safeParse({ kind, title, description, tags: tags.split(','), relatedItemIds: [], ...(kind === 'spell' ? { command: content } : { url: content }) });
    if (!result.success) { setError(kind === 'spell' && !content ? 'Command is required for a spell' : result.error.issues[0]?.message ?? 'Check the item details'); return; }
    await onSubmit(result.data);
  }
  return <form className="item-form" onSubmit={submit}><h2>{item ? 'Edit item' : 'Add item'}</h2><ItemTypeSelector value={kind} onChange={setKind} /><FormField label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} /></FormField><FormField label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField><FormField label="Tags"><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="git, terminal" /></FormField><FormField label={kind === 'spell' ? 'Command' : 'URL'} error={error}><textarea value={content} onChange={(event) => setContent(event.target.value)} /></FormField><div className="form-actions"><button type="submit">Save item</button><button type="button" className="quiet" onClick={onCancel}>Cancel</button></div></form>;
}