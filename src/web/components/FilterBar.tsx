import type { ItemKind, Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../hooks/useCollectionFilters';

export function FilterBar({
  filters,
  availableTags,
  onChange,
}: {
  filters: CollectionFilters;
  availableTags: Tag[];
  onChange: (filters: CollectionFilters) => void;
}) {
  const selected = new Set(filters.tags);

  return <div className="filter-bar">
    <label className="search-field">Search collection<input aria-label="Search collection" value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Title, command, URL, tag..." /></label>
    <label>Type<select value={filters.kind ?? ''} onChange={(event) => onChange({ ...filters, kind: (event.target.value || undefined) as ItemKind | undefined })}><option value="">All types</option><option value="spell">Spells</option><option value="web-link">Web links</option></select></label>
    <label>Tag mode<select value={filters.tagFilterMode} onChange={(event) => onChange({ ...filters, tagFilterMode: event.target.value as 'all' | 'any' })}><option value="all">Match all</option><option value="any">Match any</option></select></label>
    <fieldset>
      <legend>Tags</legend>
      {availableTags.map((tag) => (
        <label key={tag.id}>
          <input
            type="checkbox"
            checked={selected.has(tag.tagName.toLowerCase())}
            onChange={(event) => {
              const normalized = tag.tagName.toLowerCase();
              const tags = event.target.checked
                ? [...filters.tags, normalized]
                : filters.tags.filter((candidate) => candidate !== normalized);
              onChange({ ...filters, tags: [...new Set(tags)] });
            }}
          />
          {tag.tagName}
        </label>
      ))}
    </fieldset>
  </div>;
}