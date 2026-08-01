import type { Tag } from '@conjuros/contracts';

export function TagList({
  tags,
  onEdit,
  onDelete,
  onMove,
}: {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onMove: (id: string, order: number) => void;
}) {
  return (
    <section className="tag-panel">
      <h2>Tags</h2>
      <ul className="tag-list">
        {tags.map((tag, index) => (
          <li key={tag.id}>
            <div>
              <span className="tag-name" style={{ color: tag.color }}>
                <span
                  className="tag-swatch"
                  aria-hidden="true"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.tagName}
              </span>
              <span className="tag-category"> {tag.tagCategory}</span>
              <span className="tag-color"> {tag.color}</span>
            </div>
            <button type="button" onClick={() => onEdit(tag)}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(tag)}>
              Delete
            </button>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(tag.id, Math.max(1, tag.order - 1))}
            >
              Move up
            </button>
            <button type="button" onClick={() => onMove(tag.id, tag.order + 1)}>
              Move down
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
