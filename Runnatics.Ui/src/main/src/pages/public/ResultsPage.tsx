import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Section, Container, Heading } from '../../components/public/ui';
import ResultFilters from '../../components/public/results/ResultFilters';
import ResultsTable from '../../components/public/results/ResultsTable';
import Pagination from '../../components/public/shared/Pagination';
import EventCard from '../../components/public/events/EventCard';
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { base64ToDataUrl } from '../../utility';
import useDebounce from '../../hooks/useDebounce';
import { getEventResults, getEventDetail, getPastEvents } from '../../services/publicApi';
import type { ResultRow } from '../../services/publicApi';

export type { ResultRow };

const PAGE_SIZE = 20;

const MEDAL = [
  { place: 2, label: '2nd', color: '#C0C0C0', textColor: '#4A4A4A', barHeight: '80px' },
  { place: 1, label: '1st', color: '#FFD700', textColor: '#7C5A00', barHeight: '100px' },
  { place: 3, label: '3rd', color: '#CD7F32', textColor: '#5C3000', barHeight: '64px' },
];

function EventSelector() {
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getPastEvents(signal),
    [],
  );
  const list = events ?? [];

  return (
    <>
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Race Results</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', marginTop: '0.75rem', fontSize: '1.125rem' }}>
            Browse results from all past events. Search by event, name, or BIB number.
          </p>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          {loading && <CardGridSkeleton count={6} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && list.length === 0 && (
            <EmptyState title="No past events yet" subtitle="Results from completed events will appear here." />
          )}
          {!loading && !error && list.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {list.map((ev) => <EventCard key={ev.slug} event={ev} />)}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function EventResults({ slug }: { slug: string }) {
  const [search, setSearch] = useState('');
  const [race, setRace] = useState('All');
  const [gender, setGender] = useState('All');
  const [page, setPage] = useState(1);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      getEventResults(
        slug,
        { race, gender, search: debouncedSearch, page, pageSize: PAGE_SIZE },
        signal,
      ),
    [slug, race, gender, debouncedSearch, page],
  );

  const { data: eventDetail } = usePublicApi(
    (signal) => getEventDetail(slug, signal),
    [slug],
  );

  const results = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;
  const availableRaces = data?.races ?? [];
  const podium = !loading && !error && page === 1 && results.length >= 3 ? results.slice(0, 3) : null;

  const handleSearch = (s: string) => { setSearch(s); setPage(1); };
  const handleRace = (r: string) => { setRace(r); setPage(1); };
  const handleGender = (g: string) => { setGender(g); setPage(1); };

  return (
    <>
      {/* Hero */}
      <Section
        tone="dark"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 0',
          ...(eventDetail?.bannerBase64 ? {
            backgroundImage: `linear-gradient(rgba(10,18,32,0.75), rgba(10,18,32,0.75)), url(${base64ToDataUrl(eventDetail.bannerBase64)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
      >
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link
              to="/results"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
            >
              ← Back to Events
            </Link>
          </div>
          <Heading level={1} style={{ color: '#fff' }}>Race Results</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', textTransform: 'capitalize' }}>
            {eventDetail?.name ?? slug.replace(/-/g, ' ')}
          </p>
        </Container>
      </Section>

      {/* Filters */}
      <ResultFilters
        search={search}
        race={race}
        gender={gender}
        races={availableRaces}
        onSearchChange={handleSearch}
        onRaceChange={handleRace}
        onGenderChange={handleGender}
      />

      {/* Main content + sidebar */}
      <Section tone="light">
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) clamp(240px, 28%, 320px)',
              gap: '2rem',
              alignItems: 'start',
            }}
          >
            {/* ── Left: leaderboard + table ── */}
            <div>
              {/* Leaderboard header band + podium */}
              {podium && (
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '10px 10px 0 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
                      Leaderboard
                    </span>
                    {data && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8 }}>
                        {data.totalCount.toLocaleString()} finishers
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-alt)',
                      borderRadius: '0 0 10px 10px',
                      padding: '1.5rem 1rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    {MEDAL.map(({ place, label, color, textColor, barHeight }) => {
                      const r = podium[place - 1];
                      return (
                        <div
                          key={place}
                          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', maxWidth: '180px' }}
                        >
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                            }}
                          >
                            {r.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {r.netTime}
                          </div>
                          <div
                            style={{
                              width: '100%',
                              backgroundColor: color,
                              borderRadius: '6px 6px 0 0',
                              height: barHeight,
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              paddingTop: '0.5rem',
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: textColor }}>
                              {label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Results table */}
              {error && <ErrorState message={error} onRetry={refetch} />}

              {!error && (
                <>
                  {loading ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                            {['Rank', 'Bib', 'Name', 'Race', 'Gender', 'Gun Time', 'Net Time', 'Cat Rank', 'Gen Rank', ''].map((h) => (
                              <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <TableSkeleton rows={10} cols={10} />
                      </table>
                    </div>
                  ) : (
                    <ResultsTable results={results} />
                  )}

                  {!loading && totalPages > 1 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  )}
                </>
              )}
            </div>

            {/* ── Right: event card + race rules ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Event info card */}
              {eventDetail && (
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff',
                  }}
                >
                  {eventDetail.bannerBase64 && (
                    <img
                      src={base64ToDataUrl(eventDetail.bannerBase64)}
                      alt={eventDetail.name}
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--color-text)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {eventDetail.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      {eventDetail.date}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {eventDetail.city}{eventDetail.venue ? `, ${eventDetail.venue}` : ''}
                    </div>
                    {eventDetail.participants > 0 && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          color: 'var(--color-accent)',
                          fontWeight: 600,
                        }}
                      >
                        {eventDetail.participants.toLocaleString()}+ participants
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Race rules accordion */}
              {eventDetail && eventDetail.categories.length > 0 && (
                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-bg-alt)',
                      borderBottom: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--color-text)',
                    }}
                  >
                    Race Rules
                  </div>
                  {eventDetail.categories.map((cat, i) => (
                    <div
                      key={cat.name}
                      style={{
                        borderBottom: i < eventDetail.categories.length - 1 ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      <button
                        onClick={() => setOpenCat(openCat === cat.name ? null : cat.name)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9375rem',
                          color: 'var(--color-text)',
                          textAlign: 'left',
                        }}
                      >
                        <span>{cat.name}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                            display: 'inline-block',
                            transform: openCat === cat.name ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        >
                          ▼
                        </span>
                      </button>
                      {openCat === cat.name && (
                        <div
                          style={{
                            padding: '0.75rem 1rem 1rem',
                            backgroundColor: 'var(--color-bg-alt)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.375rem',
                          }}
                        >
                          <div>Distance: {cat.distance}</div>
                          <div>Entry Fee: {cat.price}</div>
                          <div>Participants: {cat.count.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ResultsPage() {
  const { slug } = useParams();
  return slug ? <EventResults slug={slug} /> : <EventSelector />;
}

export default ResultsPage;
