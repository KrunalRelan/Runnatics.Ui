import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btnStyle = (active: boolean, disabled = false) => ({
    minWidth: '36px',
    height: '36px',
    padding: '0 0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
    backgroundColor: active ? 'var(--color-accent)' : '#fff',
    color: active ? '#fff' : disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400,
    fontSize: '0.9375rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
      <button
        style={btnStyle(false, page === 1)}
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ ...btnStyle(false), border: 'none', cursor: 'default' }}>…</span>
        ) : (
          <button key={p} style={btnStyle(p === page)} onClick={() => onPageChange(p as number)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}>
            {p}
          </button>
        )
      )}
      <button
        style={btnStyle(false, page === totalPages)}
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
