import { useState } from 'react';
import type { CollectionItem } from '@conjuros/contracts';

export function ItemCard({ item, onEdit, onDelete }: { item: CollectionItem; onEdit: (item: CollectionItem) => void; onDelete: (item: CollectionItem) => void }) {
  const [message, setMessage] = useState('');
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setMessage(`${label} copied`); }
    catch { setMessage(`Could not copy ${label.toLowerCase()}`); }
  }
  return <article className="item-card">
    <div className="item-heading"><span className={`kind kind-${item.kind}`}>{item.kind === 'spell' ? 'Spell' : 'Web link'}</span><h2>{item.title}</h2></div>
    {item.description && <p>{item.description}</p>}
    <code>{item.command ?? item.url}</code>
    <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    <div className="item-actions">
      <button type="button" onClick={() => copy(item.command ?? item.url ?? '', item.kind === 'spell' ? 'Command' : 'URL')}>Copy {item.kind === 'spell' ? 'command' : 'URL'}</button>
      {item.kind === 'web-link' && item.url && <button type="button" onClick={() => window.open(item.url!, '_blank', 'noopener,noreferrer')}>Open link</button>}
      <button type="button" className="quiet" onClick={() => onEdit(item)}>Edit</button><button type="button" className="danger quiet" onClick={() => onDelete(item)}>Delete</button>
    </div>
    {message && <p className="action-message" role="status">{message}</p>}
  </article>;
}