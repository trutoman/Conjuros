import { tagCatalog, type ItemKind, type Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../hooks/useCollectionFilters';

export function FilterBar({ filters, onChange }: { filters: CollectionFilters; onChange: (filters: CollectionFilters) => void }) {
  return <div className="filter-bar">
    <label className="search-field">Search collection<input aria-label="Search collection" value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Title, command, URL, tag..." /></label>
    <label>Type<select value={filters.kind ?? ''} onChange={(event) => onChange({ ...filters, kind: (event.target.value || undefined) as ItemKind | undefined })}><option value="">All types</option><option value="spell">Spells</option><option value="web-link">Web links</option></select></label>
    <label>Tag<select value={filters.tag ?? ''} onChange={(event) => onChange({ ...filters, tag: (event.target.value || undefined) as Tag | undefined })}><option value="">All tags</option>{tagCatalog.map((tag) => <option key={tag}>{tag}</option>)}</select></label>
  </div>;
}