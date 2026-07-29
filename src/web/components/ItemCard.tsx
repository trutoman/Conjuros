import { useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';

export function ItemCard({ item, tags = [], onEdit, onDelete }: { item: CollectionItem; tags?: Tag[]; onEdit: (item: CollectionItem) => void; onDelete: (item: CollectionItem) => void }) {
  const [message, setMessage] = useState('');
  const tagColors = new Map(tags.map((tag) => [tag.tagName, tag.color]));
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setMessage(`${label} copied`); }
    catch { setMessage(`Could not copy ${label.toLowerCase()}`); }
  }
  return <article className={`item-card kind-${item.kind}`}>
    <div className="item-heading"><span className={`kind kind-${item.kind}`}>{item.kind === 'spell' ? 'Spell' : 'Web link'}</span><h2>{item.title}</h2></div>
    {item.description && <p>{item.description}</p>}
    <code>{item.command ?? item.url}</code>
    <div className="tags">{item.tags.map((tag) => <span key={tag} style={tagColors.has(tag) ? { color: tagColors.get(tag), borderColor: tagColors.get(tag) } : undefined}>{tag}</span>)}</div>
    <div className="item-actions">
      <button type="button" onClick={() => copy(item.command ?? item.url ?? '', item.kind === 'spell' ? 'Command' : 'URL')}>Copy {item.kind === 'spell' ? 'command' : 'URL'}</button>
      {item.kind === 'web-link' && item.url && <button type="button" onClick={() => window.open(item.url!, '_blank', 'noopener,noreferrer')}>Open link</button>}
      <button type="button" className="quiet action-secondary" onClick={() => onEdit(item)}>Edit</button><button type="button" className="danger quiet action-secondary" onClick={() => onDelete(item)}>Delete</button>
    </div>
    {message && <p className="action-message" role="status">{message}</p>}
  </article>;
}