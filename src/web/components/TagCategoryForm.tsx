import { useState } from 'react';
import { tagCategoryNameSchema, type TagCategory } from '@conjuros/contracts';
import { FormField } from './FormField';
import { ThemeIcon } from './ThemeIcon';

export function TagCategoryForm({
  category,
  onSubmit,
  onCancel,
}: {
  category: TagCategory;
  onSubmit: (name: string) => Promise<unknown> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category.name.toLowerCase());
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const result = tagCategoryNameSchema.safeParse(name);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the category details');
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save category');
    }
  }

  return (
    <form className="item-form" onSubmit={submit}>
      <button type="button" className="form-close" aria-label="Close category form" onClick={onCancel}>
        <ThemeIcon name="close" />
      </button>
      <h2>Rename category</h2>
      <FormField label="Category name" error={error}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value.toLowerCase())}
          placeholder="general"
        />
      </FormField>
      <div className="form-actions">
        <button type="submit">Save category</button>
        <button type="button" className="quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
