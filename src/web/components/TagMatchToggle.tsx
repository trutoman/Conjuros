export function TagMatchToggle({
  mode,
  onChange,
}: {
  mode: 'all' | 'any';
  onChange: (mode: 'all' | 'any') => void;
}) {
  return (
    <div className="tag-match-toggle-wrapper">
      <span className="filter-label">Match</span>
      <div className="tag-match-toggle" role="group" aria-label="Tag match mode">
        <button
          type="button"
          aria-label="Match any tag"
          aria-pressed={mode === 'any'}
          onClick={() => onChange('any')}
        >
          <span aria-hidden="true">&#8746;</span>
        </button>
        <button
          type="button"
          aria-label="Match all tags"
          aria-pressed={mode === 'all'}
          onClick={() => onChange('all')}
        >
          <span aria-hidden="true">&#8745;</span>
        </button>
      </div>
    </div>
  );
}
