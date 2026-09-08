import { useState } from 'react';
import type { Tag, TagInput, ThemePreference } from '@conjuros/contracts';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { TagForm } from '../components/TagForm';
import { TagList } from '../components/TagList';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeIcon } from '../components/ThemeIcon';
import { UserWidget } from '../components/UserWidget';
import { useTags } from '../hooks/useTags';
import { useTagCategories } from '../hooks/useTagCategories';

export function TagsPage({
  onBack,
  currentUserLabel,
  theme = 'light',
  onThemeChange,
  onSignOut,
}: {
  onBack: () => void;
  currentUserLabel?: string;
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void | Promise<void>;
  onSignOut?: () => void;
}) {
  const tagsState = useTags();
  const categoriesState = useTagCategories();
  const [formTag, setFormTag] = useState<Tag | null | undefined>(undefined);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [actionError, setActionError] = useState('');
  const [tagQuery, setTagQuery] = useState('');

  const normalizedTagQuery = tagQuery.trim().toLowerCase();
  const visibleTags = tagsState.tags.filter(
    (tag) =>
      !normalizedTagQuery ||
      tag.tagName.toLowerCase().includes(normalizedTagQuery) ||
      tag.tagCategory.toLowerCase().includes(normalizedTagQuery),
  );
  const categoryNames = categoriesState.categories.map((category) => category.name);
  const emptyCategories = categoriesState.categories.filter(
    (category) =>
      category.tagCount === 0 &&
      (!normalizedTagQuery || category.name.toLowerCase().includes(normalizedTagQuery)),
  );

  async function saveTag(input: TagInput) {
    try {
      if (formTag) await tagsState.update({ id: formTag.id, tag: input });
      else await tagsState.create(input);
      setFormTag(undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save tag');
    }
  }

  async function confirmTagDelete() {
    if (!deleteTag) return;
    try {
      await tagsState.remove(deleteTag.id);
      setDeleteTag(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not delete tag');
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Enchantments to charm machines.</p>
          <h1>Conjuros</h1>
        </div>
        <div className="topbar-actions">
          <div className="search-field">
            <svg
              className="icon search-icon"
              role="img"
              aria-hidden="true"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path d="M11 3a8 8 0 1 0 0 16 8 8 0 1 0 0-16Z M21 21l-4.3-4.3" />
            </svg>
            <input
              aria-label="Search tags"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder="Search in name or category..."
            />
            {tagQuery && (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setTagQuery('')}
                aria-label="Clear search"
              >
                <ThemeIcon name="close" />
              </button>
            )}
          </div>
          <button onClick={onBack}>← Collection</button>
          <button onClick={() => setFormTag(null)}>Add tag</button>
          <ThemeToggle theme={theme} onChange={(nextTheme) => onThemeChange?.(nextTheme)} />
          {onSignOut && currentUserLabel && (
            <UserWidget userLabel={currentUserLabel} onSignOut={onSignOut} />
          )}
        </div>
      </header>
      {actionError && <p className="field-error">{actionError}</p>}
      {categoriesState.isLoading && <p className="field-hint">Loading categories…</p>}
      {categoriesState.error && (
        <p className="field-error">Could not load categories: {categoriesState.error.message}</p>
      )}
      <TagList
        tags={visibleTags}
        onEdit={setFormTag}
        onDelete={setDeleteTag}
        onMove={(id, order) =>
          void tagsState
            .reorder({ id, order })
            .catch((cause: unknown) =>
              setActionError(cause instanceof Error ? cause.message : 'Could not reorder tag'),
            )
        }
      />
      {formTag !== undefined && (
        <TagForm
          tag={formTag ?? undefined}
          categories={categoryNames}
          onSubmit={saveTag}
          onCancel={() => setFormTag(undefined)}
        />
      )}
      {!categoriesState.isLoading && emptyCategories.length > 0 && (
        <section className="tag-panel" aria-label="Empty categories">
          <ul className="tag-list">
            {emptyCategories.map((category) => (
              <li key={category.id} className="tag-row" data-testid={`empty-category-${category.id}`}>
                <div className="tag-row-label">
                  <span className="tag-category">{category.name.toLowerCase()}</span>
                  <span className="tag-description">No tags in this category</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {deleteTag && (
        <DeleteConfirmDialog
          title={deleteTag.tagName}
          onConfirm={() => void confirmTagDelete()}
          onCancel={() => setDeleteTag(null)}
        />
      )}
    </main>
  );
}
