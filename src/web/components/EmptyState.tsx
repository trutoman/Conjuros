export function EmptyState({ filtered }: { filtered: boolean }) {
  return <section className="empty-state"><h2>{filtered ? 'No matching items' : 'Your collection is empty'}</h2><p>{filtered ? 'Try adjusting your search or filters.' : 'Add a spell or web link to get started.'}</p></section>;
}