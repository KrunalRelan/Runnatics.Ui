import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Section, Container } from '../../components/public/ui';
import { ErrorState, TableSkeleton } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { getEventDetail, getEventResults } from '../../services/publicApi';
import type { ResultRow } from '../../services/publicApi';

// ── Disclaimer banner ──────────────────────────────────────────────
function DisclaimerBanner() {
  return (
    <div
      style={{
        backgroundColor: '#FEF9C3',
        borderTop: '1px solid #FDE68A',
        borderBottom: '1px solid #FDE68A',
        padding: '0.75rem 0',
      }}
    >
      <Container>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: '#78350F',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          <strong>Results Disclaimer:</strong> Results shown are preliminary and subject to official
          verification. Chip times reflect net finish time from individual start. Gun times are
          measured from the official race start signal.
        </p>
      </Container>
    </div>
  );
}

// ── Participant search result card ─────────────────────────────────
function ParticipantCard({ row }: { row: ResultRow }) {
  const timeLabel = row.netTime ? 'Chip Time' : 'Gun Time';
  const time = row.netTime ?? row.gunTime;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {row.bibNumber}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--color-text)',
            }}
          >
            {row.participantName}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              marginTop: '0.2rem',
            }}
          >
            {row.raceName}
            {row.gender ? ` · ${row.gender}` : ''}
            {row.ageGroup ? ` · ${row.ageGroup}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {time && (
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#4da1c0',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
              }}
            >
              {time}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.2rem',
                textAlign: 'center',
              }}
            >
              {timeLabel}
            </div>
          </div>
        )}
        {row.participantId && (
          <Link
            to={`/p/${row.participantId}`}
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '6px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Race tab strip ─────────────────────────────────────────────────
function RaceTab({
  name,
  active,
  onSelect,
  eventId,
  raceId,
}: {
  name: string;
  active: boolean;
  onSelect: () => void;
  eventId?: string;
  raceId?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 0',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
      }}
    >
      <button
        onClick={onSelect}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
          fontWeight: active ? 700 : 500,
          fontSize: '1rem',
          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          padding: 0,
        }}
      >
        {name}
      </button>
      {eventId && raceId && (
        <Link
          to={`/c/${eventId}/${raceId}/l`}
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#4da1c0',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          Leaderboard
        </Link>
      )}
    </div>
  );
}

// ── Search bar ─────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative', maxWidth: '480px' }}>
      <span
        style={{
          position: 'absolute',
          left: '0.875rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        Search:
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Name or Bib"
        style={{
          width: '100%',
          padding: '0.75rem 1rem 0.75rem 5.5rem',
          border: '1.5px solid var(--color-border)',
          borderRadius: '8px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          color: 'var(--color-text)',
          backgroundColor: '#fff',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#4da1c0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      />
    </div>
  );
}

// ── Event results body ─────────────────────────────────────────────
function EventResultsBody({ slug }: { slug: string }) {
  const [selectedRace, setSelectedRace] = useState<string>('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { data: ev, loading: evLoading } = usePublicApi(
    (signal) => getEventDetail(slug, signal),
    [slug],
  );

  const { data, loading: resultsLoading, error, refetch } = usePublicApi(
    (signal) =>
      getEventResults(
        slug,
        {
          race: selectedRace === 'All' ? undefined : selectedRace,
          search: debouncedSearch || undefined,
        },
        signal,
      ),
    [slug, selectedRace, debouncedSearch],
  );

  const races = data?.races ?? [];
  const results = data?.results ?? [];
  const isSearching = debouncedSearch.trim().length > 0;

  const activeRace = selectedRace === 'All' ? races[0] ?? 'All' : selectedRace;

  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
        <Container>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              to="/events"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
              }}
            >
              ← Events
            </Link>
          </div>
          {evLoading ? (
            <div
              style={{
                height: '2rem',
                width: '60%',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
          ) : (
            <>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  color: '#fff',
                  margin: '0 0 0.5rem',
                  lineHeight: 1.15,
                }}
              >
                {ev?.name ?? 'Event Results'}
              </h1>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'rgba(255,255,255,0.65)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem 1.5rem',
                }}
              >
                {ev?.date && <span>{ev.date}</span>}
                {ev?.city && <span>{ev.city}</span>}
                {ev?.venue && <span>{ev.venue}</span>}
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Search + Race tabs */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Container>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              padding: '1rem 0',
            }}
          >
            <SearchBar value={search} onChange={setSearch} />

            {/* Race tabs */}
            {races.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                  flexWrap: 'wrap',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {races.map((race) => {
                  const cat = ev?.categories.find((c) => c.name === race);
                  return (
                    <RaceTab
                      key={race}
                      name={race}
                      active={
                        selectedRace === race ||
                        (selectedRace === 'All' && race === races[0])
                      }
                      onSelect={() => setSelectedRace(race)}
                      eventId={ev?.id}
                      raceId={cat?.raceId}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Results */}
      <Section tone="light" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Container>
          {error && <ErrorState message={error} onRetry={refetch} />}

          {!error && isSearching && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                {resultsLoading
                  ? 'Searching…'
                  : `${results.length} result${results.length === 1 ? '' : 's'} for "${debouncedSearch}"`}
              </div>
              {!resultsLoading && results.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem',
                  }}
                >
                  No participants found matching "{debouncedSearch}".
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.map((row, i) => (
                  <ParticipantCard key={`${row.bibNumber}-${i}`} row={row} />
                ))}
              </div>
            </div>
          )}

          {!error && !isSearching && !resultsLoading && data?.isPublished === false && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                fontSize: '1rem',
              }}
            >
              {data?.statusMessage ?? 'Results have not been published yet.'}
            </div>
          )}

          {!error && !isSearching && (data?.isPublished ?? true) && (
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {/* Table header */}
              <div
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {activeRace !== 'All' ? activeRace : 'Results'}
                </span>
                {!resultsLoading && data?.totalCount != null && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      opacity: 0.7,
                    }}
                  >
                    {data.totalCount.toLocaleString()} finishers
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F5F7FA',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {['#', 'Bib', 'Name', 'Gender', 'Category', 'Chip Time', 'Gun Time'].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: '0.75rem 1rem',
                              textAlign: 'left',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  {resultsLoading ? (
                    <TableSkeleton rows={8} cols={7} />
                  ) : (
                    <tbody>
                      {results.map((row, i) => (
                        <tr
                          key={`${row.bibNumber}-${i}`}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA',
                          }}
                        >
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-muted)',
                              fontWeight: 600,
                            }}
                          >
                            {row.overallRank ?? i + 1}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {row.bibNumber}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 500,
                              fontSize: '0.9375rem',
                              color: 'var(--color-text)',
                            }}
                          >
                            {row.participantId ? (
                              <Link
                                to={`/p/${row.participantId}`}
                                style={{ color: '#4da1c0', textDecoration: 'none', fontWeight: 600 }}
                              >
                                {row.participantName}
                              </Link>
                            ) : (
                              row.participantName
                            )}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {row.gender ?? '—'}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {row.ageGroup ?? '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {row.netTime ? (
                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#4da1c0',
                                  color: '#fff',
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '0.8125rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.625rem',
                                  borderRadius: '12px',
                                }}
                              >
                                {row.netTime}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '0.875rem',
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {row.gunTime ?? '—'}
                          </td>
                        </tr>
                      ))}
                      {!resultsLoading && results.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: '3rem',
                              textAlign: 'center',
                              fontFamily: 'var(--font-body)',
                              color: 'var(--color-text-muted)',
                              fontSize: '0.9375rem',
                            }}
                          >
                            No results available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function EventResultsPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  if (!eventSlug) return null;
  return <EventResultsBody slug={eventSlug} />;
}

export default EventResultsPage;
