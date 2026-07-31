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
    <div className="search-field">
      <svg className="icon icon-filled search-icon" role="img" aria-hidden="true" viewBox="0 -960 960 960" focusable="false"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
      <input aria-label="Search collection" value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Title, command, URL, tag..." />
    </div>
    <label className="inline-label">Type<select value={filters.kind ?? ''} onChange={(event) => onChange({ ...filters, kind: (event.target.value || undefined) as ItemKind | undefined })}><option value="">All types</option><option value="spell">Spells</option><option value="web-link">Web links</option></select></label>
    <fieldset className="tag-filter-bar">
      <legend>Tag filter</legend>
      {availableTags.map((tag) => {
        const normalized = tag.tagName.toLowerCase();
        const isChecked = selected.has(normalized);
        return (
          <label
            key={tag.id}
            className="tag-filter-pill"
            style={{ color: tag.color, borderColor: tag.color, background: isChecked ? `color-mix(in srgb, ${tag.color} 20%, var(--surface))` : `color-mix(in srgb, ${tag.color} 8%, var(--surface))` }}
          >
            <input
              type="checkbox"
              aria-label={tag.tagName}
              checked={isChecked}
              onChange={(event) => {
                const tags = event.target.checked
                  ? [...filters.tags, normalized]
                  : filters.tags.filter((candidate) => candidate !== normalized);
                onChange({ ...filters, tags: [...new Set(tags)] });
              }}
            />
            {tag.tagName}
          </label>
        );
      })}
    </fieldset>
    <label className="inline-label">Mode<select value={filters.tagFilterMode} onChange={(event) => onChange({ ...filters, tagFilterMode: event.target.value as 'all' | 'any' })}><option value="all">Match all</option><option value="any">Match any</option></select></label>
  </div>;
}