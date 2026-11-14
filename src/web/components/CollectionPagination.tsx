import { ThemeIcon } from './ThemeIcon';

export function CollectionPagination({
  page,
  pageSize,
  total,
  onPrevious,
  onNext,
  onLast,
  isLoading = false,
  hasError = false,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  isLoading?: boolean;
  hasError?: boolean;
}) {
  if (isLoading || hasError || total === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) {
    return null;
  }

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <nav className="collection-pagination" aria-label="Collection pages">
      <p className="collection-range">
        Showing {firstItem}–{lastItem} of {total} items
      </p>
      <div className="collection-pagination-actions">
        <button
          type="button"
          className="pagination-button"
          onClick={onPrevious}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ThemeIcon name="previous-page" />
        </button>
        <button
          type="button"
          className="pagination-button"
          onClick={onNext}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ThemeIcon name="next-page" />
        </button>
        <button
          type="button"
          className="pagination-button"
          onClick={onLast}
          disabled={page >= totalPages}
          aria-label="Last page"
        >
          <ThemeIcon name="last-page" />
        </button>
      </div>
    </nav>
  );
}
