interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalCount, disabled, onPageChange }: Props) {
  if (totalCount === 0) return null;

  return (
    <nav className="pagination" aria-label="Ticket pages">
      <button
        type="button"
        className="btn"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        ← Prev
      </button>
      <span aria-live="polite">
        Page {page} of {Math.max(totalPages, 1)} · {totalCount} tickets
      </span>
      <button
        type="button"
        className="btn"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Next →
      </button>
    </nav>
  );
}
