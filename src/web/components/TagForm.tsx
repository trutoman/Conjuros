import { useState } from 'react';
import { tagInputSchema, type Tag, type TagInput } from '@conjuros/contracts';
import { FormField } from './FormField';

export function TagForm({
  tag,
  onSubmit,
  onCancel,
}: {
  tag?: Tag;
  onSubmit: (input: TagInput) => Promise<unknown> | void;
  onCancel: () => void;
}) {
  const [tagName, setTagName] = useState(tag?.tagName ?? '');
  const [description, setDescription] = useState(tag?.description ?? '');
  const [color, setColor] = useState(tag?.color ?? '#1A73E8');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const result = tagInputSchema.safeParse({ tagName, description, color });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the tag details');
      return;
    }

    await onSubmit(result.data);
  }

  return (
    <form className="item-form" onSubmit={submit}>
      <h2>{tag ? 'Edit tag' : 'Add tag'}</h2>
      <FormField label="Tag name">
        <input value={tagName} onChange={(event) => setTagName(event.target.value)} />
      </FormField>
      <FormField label="Description">
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </FormField>
      <FormField label="Color" error={error}>
        <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="#RRGGBB" />
      </FormField>
      <div className="form-actions">
        <button type="submit">Save tag</button>
        <button type="button" className="quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
