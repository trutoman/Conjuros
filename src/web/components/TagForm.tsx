import { useState } from 'react';
import { tagInputSchema, type Tag, type TagInput } from '@conjuros/contracts';
import { normalizedHex } from '../lib/applyTheme';
import { FormField } from './FormField';

export function TagForm({
  tag,
  onSubmit,
  onCancel,
  palette = [],
}: {
  tag?: Tag;
  onSubmit: (input: TagInput) => Promise<unknown> | void;
  onCancel: () => void;
  palette?: string[] | null;
}) {
  const [tagName, setTagName] = useState(tag?.tagName.toLowerCase() ?? '');
  const [tagCategory, setTagCategory] = useState(tag?.tagCategory.toLowerCase() ?? '');
  const [description, setDescription] = useState(tag?.description ?? '');
  const [color, setColor] = useState(tag?.color ?? palette?.[0] ?? '#1A73E8');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (palette && palette.length > 0 && !palette.some((entry) => normalizedHex(entry) === normalizedHex(color))) {
      setError('Tag color must be part of the active theme palette');
      return;
    }

    const result = tagInputSchema.safeParse({ tagName, tagCategory, description, color });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the tag details');
      return;
    }

    await onSubmit(result.data);
  }

  return (
    <form className="item-form" onSubmit={submit}>
      <button type="button" className="form-close" aria-label="Close tag form" onClick={onCancel}>
        ✕
      </button>
      <h2>{tag ? 'Edit tag' : 'Add tag'}</h2>
      <FormField label="Tag name">
        <input
          value={tagName}
          onChange={(event) => setTagName(event.target.value.toLowerCase())}
        />
      </FormField>
      <FormField label="Tag category">
        <input
          value={tagCategory}
          onChange={(event) => setTagCategory(event.target.value.toLowerCase())}
        />
      </FormField>
      <FormField label="Description">
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </FormField>
      <FormField label="Color" error={error}>
        <div className="color-field">
          {palette && palette.length > 0 && (
            <div className="color-swatches" role="group" aria-label="Tag color palette">
              {palette.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className={`color-swatch${normalizedHex(entry) === normalizedHex(color) ? ' selected' : ''}`}
                  style={{ backgroundColor: entry }}
                  aria-label={`Select color ${entry}`}
                  aria-pressed={normalizedHex(entry) === normalizedHex(color)}
                  onClick={() => setColor(entry)}
                />
              ))}
            </div>
          )}
          <input
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Tag color"
            placeholder="#RRGGBB"
          />
          <span className="color-preview" aria-hidden="true" style={{ backgroundColor: color }} />
        </div>
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
