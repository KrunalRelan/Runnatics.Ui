import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import usePublicApi from '../../hooks/usePublicApi';
import { getEventsPaged } from '../../services/publicApi';
import EventCard from '../../components/public/events/EventCard';
import { CardGridSkeleton, ErrorState, EmptyState } from '../../components/public/shared/ApiStates';
import ResultsDisclaimer from '../../components/public/shared/ResultsDisclaimer';

// Results landing — tiles for EVERY past event, most recent first, paginated.
// The list is unbounded (it grows with every event), so the page walks it a page
// at a time server-side rather than capping it. "View Result" on each tile is
// still shown only when that event's results are published (EventCard's rule).
const PAGE_SIZE = 12;

// Compact page list with ellipses: 1 … 4 5 [6] 7 8 … 20
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));

  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

function ResultsLandingPage() {
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) => getEventsPaged({ status: 'past', page, pageSize: PAGE_SIZE }, signal),
    [page],
  );

  const events = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const goTo = (next: number) => {
    if (next < 1 || (totalPages > 0 && next > totalPages) || next === page) return;
    setPage(next);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <style>{PAGER_STYLES}</style>

      {/* Page header */}
      <div style={{ backgroundColor: 'var(--color-primary)', padding: 'clamp(2.5rem, 5vw, 4rem) 0 2.5rem' }}>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Trophy size={32} color="#EA580C" />
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', margin: 0 }}>
                Results
              </h1>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
              Browse leaderboards from every past event
            </p>
          </div>
        </Container>
      </div>

      {/* Event tiles */}
      <Container>
        <div ref={gridTopRef} style={{ padding: '2rem 0 4rem', scrollMarginTop: '80px' }}>
          {loading && <CardGridSkeleton count={PAGE_SIZE} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && events.length === 0 && (
            <EmptyState
              title="No results yet"
              subtitle="Leaderboards from completed events will appear here."
            />
          )}
          {!loading && !error && events.length > 0 && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {events.map((ev) => (
                  <EventCard key={ev.encryptedId || ev.slug} event={ev} portrait />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pg-nav" aria-label="Results pages">
                  <button
                    type="button"
                    className="pg-btn"
                    onClick={() => goTo(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {pageWindow(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span key={`gap-${i}`} className="pg-gap" aria-hidden>…</span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        className={`pg-btn${p === page ? ' pg-btn--active' : ''}`}
                        onClick={() => goTo(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    className="pg-btn"
                    onClick={() => goTo(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}

              {totalCount > 0 && (
                <div className="pg-count">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} events
                </div>
              )}
            </>
          )}
          {!loading && !error && <ResultsDisclaimer />}
        </div>
      </Container>
    </div>
  );
}

const PAGER_STYLES = `
  .pg-nav {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 0.375rem; margin-top: 2.5rem;
  }
  .pg-btn {
    min-width: 38px; height: 38px; padding: 0 0.6rem;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid var(--color-border); border-radius: 8px; background: #fff;
    font-family: var(--font-body); font-size: 0.875rem; font-weight: 600;
    color: var(--color-text); cursor: pointer;
    transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
  }
  .pg-btn:hover:not(:disabled):not(.pg-btn--active) { border-color: var(--color-primary); color: var(--color-primary); }
  .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .pg-btn--active {
    background: var(--color-primary); border-color: var(--color-primary);
    color: #fff; cursor: default;
  }
  .pg-gap { padding: 0 0.15rem; font-family: var(--font-body); color: var(--color-text-muted); }
  .pg-count {
    margin-top: 0.9rem; text-align: center;
    font-family: var(--font-body); font-size: 0.8125rem; color: var(--color-text-muted);
  }
  @media (prefers-reduced-motion: reduce) { .pg-btn { transition: none; } }
`;

export default ResultsLandingPage;
