import type { CollectionFilters } from '../hooks/useCollectionFilters';

export function EmptyState({
  filtered,
  filters,
}: {
  filtered: boolean;
  filters?: CollectionFilters;
}) {
  if (filtered && filters) {
    return (
      <section className="empty-state">
        <h2>No se encontraron ítems para '{filters.search}' con las etiquetas seleccionadas.</h2>
        <p>Try adjusting your search or filters.</p>
      </section>
    );
  }
  return (
    <section className="empty-state">
      <h2>{filtered ? 'No matching items' : 'Your collection is empty'}</h2>
      <p>
        {filtered
          ? 'Try adjusting your search or filters.'
          : 'Add a spell or web link to get started.'}
      </p>
    </section>
  );
}