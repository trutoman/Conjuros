import { useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';

function Icon({ label, path, title }: { label: string; path: string; title: string }) {
  return (
    <svg
      className="icon"
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden={false}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}

export function ItemCard({
  item,
  tags = [],
  onEdit,
  onDelete,
}: {
  item: CollectionItem;
  tags?: Tag[];
  onEdit: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
}) {
  const [message, setMessage] = useState('');
  const tagColors = new Map(tags.map((tag) => [tag.tagName, tag.color]));
  const isSpell = item.kind === 'spell';

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
    } catch {
      setMessage(`Could not copy ${label.toLowerCase()}`);
    }
  }

  const openUrl = item.kind === 'web-link' ? (item.url ?? undefined) : undefined;

  return (
    <article className={`item-card kind-${item.kind}`}>
      <div className="item-header">
        <div className="item-title-group">
          <div
            className={`item-type-badge kind-${item.kind}`}
            aria-label={isSpell ? 'Spell' : 'Web link'}
          >
            {isSpell ? (
              <Icon
                label="Spell"
                title="Spell"
                path="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
              />
            ) : (
              <Icon
                label="Web link"
                title="Web link"
                path="M10 5h-4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4m-6-6h6v6m-8 2l8-8"
              />
            )}
          </div>
          <div className="item-title-block">
            <h2>{item.title}</h2>
            <div className="item-meta">
              <span>{isSpell ? 'Spell' : 'Web link'}</span>
              {item.tags.length > 0 && (
                <div className="tags" aria-label="Item tags">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-pill"
                      style={
                        tagColors.has(tag)
                          ? { color: tagColors.get(tag), borderColor: tagColors.get(tag) }
                          : undefined
                      }
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="item-actions" aria-label="Item actions">
          {isSpell && (
            <button
              type="button"
              className="icon-action"
              aria-label="Copy command"
              onClick={() => copy(item.command ?? '', 'Command')}
            >
              <Icon
                label="Copy"
                title="Copy"
                path="M8 7h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 0V5a2 2 0 0 1 2-2h8"
              />
            </button>
          )}
          {item.kind === 'web-link' && openUrl && (
            <button
              type="button"
              className="icon-action"
              aria-label="Open link"
              onClick={() => window.open(openUrl, '_blank', 'noopener,noreferrer')}
            >
              <Icon label="Open" title="Open" path="M14 3h7v7m0-7L10 14m7-11v4m0 0h-4" />
            </button>
          )}
          <button
            type="button"
            className="icon-action action-secondary"
            aria-label="Edit"
            onClick={() => onEdit(item)}
          >
            <Icon
              label="Edit"
              title="Edit"
              path="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
            />
          </button>
          <button
            type="button"
            className="icon-action action-secondary danger"
            aria-label="Delete"
            onClick={() => onDelete(item)}
          >
            <Icon
              label="Delete"
              title="Delete"
              path="M4 7h16M9 7V4h6v3m-2 4v6m-4-6v6m8-6v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
            />
          </button>
        </div>
      </div>
      {item.description && <p className="item-description">{item.description}</p>}
      <div className="item-body">
        <code>{item.command ?? item.url}</code>
      </div>
      {message && (
        <p className="action-message" role="status">
          {message}
        </p>
      )}
    </article>
  );
}
