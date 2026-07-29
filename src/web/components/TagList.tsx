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
    <section>
      <h2>Tags</h2>
      <ul>
        {tags.map((tag, index) => (
          <li key={tag.id}>
            <span>{tag.tagName}</span>
            <span> {tag.color}</span>
            <button onClick={() => onEdit(tag)}>Edit</button>
            <button onClick={() => onDelete(tag)}>Delete</button>
            <button disabled={index === 0} onClick={() => onMove(tag.id, Math.max(1, tag.order - 1))}>
              Move up
            </button>
            <button onClick={() => onMove(tag.id, tag.order + 1)}>Move down</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
