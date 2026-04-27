import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Section, Container, Heading } from '../../components/public/ui';
import FilterBar from '../../components/public/FilterBar';
import Podium from '../../components/public/Podium';
import ResultsTable from '../../components/public/ResultsTable';
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
import {
  getEventResults,
  getEventDetail,
  getPastEvents,
  DEFAULT_LEADERBOARD_SETTINGS,
} from '../../services/publicApi';
import type { ResultRow } from '../../services/publicApi';

export type { ResultRow };

const PAGE_SIZE = 50;

type ResultTab = 'overall' | 'category' | 'gender' | 'ageGroup';

// ── Event selector (no slug) ──────────────────────────────────────────────────
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
            Browse results from all past events.
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

// ── Leaderboard sidebar info card (uses eventDetail) ─────────────────────────
function SidebarEventCard({ slug }: { slug: string }) {
  const { data: ev } = usePublicApi((signal) => getEventDetail(slug, signal), [slug]);
  const [showRules, setShowRules] = useState(false);

  if (!ev) return null;

  return (
    <>
      {/* Event banner card */}
      <div
        style={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          backgroundColor: '#fff',
        }}
      >
        {ev.bannerBase64 && (
          <img
            src={base64ToDataUrl(ev.bannerBase64)}
            alt={ev.name}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{ padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.375rem' }}>
            {ev.name}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            {ev.date}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {ev.city}{ev.venue ? `, ${ev.venue}` : ''}
          </div>
          {ev.participants > 0 && (
            <div style={{ marginTop: '0.625rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              {ev.participants.toLocaleString()}+ participants
            </div>
          )}
        </div>
      </div>

      {/* Race rules accordion */}
      {ev.categories.length > 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
            Race Rules
          </div>
          {ev.categories.map((cat, i) => {
            const isLast = i === ev.categories.length - 1;
            return (
              <div key={cat.name} style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setShowRules(showRules === cat.name as any ? false : cat.name as any)}
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
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'inline-block', transform: (showRules as any) === cat.name ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {(showRules as any) === cat.name && (
                  <div style={{ padding: '0.75rem 1rem 1rem', backgroundColor: 'var(--color-bg-alt)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div>Distance: {cat.distance}</div>
                    <div>Entry Fee: {cat.price}</div>
                    <div>Participants: {cat.count.toLocaleString()}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Event results view ────────────────────────────────────────────────────────
function EventResults({ slug }: { slug: string }) {
  const [search, setSearch] = useState('');
  const [race, setRace] = useState('All');
  const [gender, setGender] = useState('All');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ResultTab>('overall');

  const debouncedSearch = useDebounce(search, 350);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      getEventResults(
        slug,
        { race: race === 'All' ? undefined : race, gender: gender === 'All' ? undefined : gender, search: debouncedSearch || undefined, page, pageSize: PAGE_SIZE },
        signal,
      ),
    [slug, race, gender, debouncedSearch, page],
  );

  const settings = data?.leaderboardSettings ?? DEFAULT_LEADERBOARD_SETTINGS;
  const results = data?.results ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const availableRaces = data?.races ?? [];
  const isPublished = data?.isPublished ?? true;
  const statusMessage = data?.statusMessage;

  // ── Available tabs from settings ──────────────────────────────────────────
  const availableTabs: { key: ResultTab; label: string }[] = [];
  if (settings.showOverallResults) availableTabs.push({ key: 'overall', label: 'Overall' });
  if (settings.showCategoryResults) availableTabs.push({ key: 'category', label: 'Category' });
  if (settings.showGenderResults) availableTabs.push({ key: 'gender', label: 'Gender' });
  if (settings.showAgeGroupResults) availableTabs.push({ key: 'ageGroup', label: 'Age Group' });

  // Ensure activeTab is always a valid option
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find((t) => t.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [settings.showOverallResults, settings.showCategoryResults, settings.showGenderResults, settings.showAgeGroupResults]);

  // ── Auto-refresh for live leaderboard ─────────────────────────────────────
  useEffect(() => {
    if (refreshRef.current) clearInterval(refreshRef.current);
    if (settings.enableLiveLeaderboard && settings.autoRefreshIntervalSec > 0) {
      refreshRef.current = setInterval(() => refetch(), settings.autoRefreshIntervalSec * 1000);
    }
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [settings.enableLiveLeaderboard, settings.autoRefreshIntervalSec]);

  // ── Sort field and time label ──────────────────────────────────────────────
  const sortField = activeTab === 'overall'
    ? (settings.sortByOverallChipTime ? 'netTime' : 'gunTime')
    : (settings.sortByCategoryChipTime ? 'netTime' : 'gunTime');
  const timeLabel = sortField === 'netTime' ? 'Net Time' : 'Gun Time';

  // ── Cap results ────────────────────────────────────────────────────────────
  const maxForTab = activeTab === 'overall'
    ? settings.numberOfResultsToShowOverall
    : settings.numberOfResultsToShowCategory;
  const cappedResults = maxForTab > 0 ? results.slice(0, maxForTab) : results;

  const podiumRows = !loading && !error && isPublished && cappedResults.length >= 3 && page === 1
    ? cappedResults.slice(0, 3)
    : null;
  const tableRows = podiumRows ? cappedResults.slice(3) : cappedResults;

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRace = (v: string) => { setRace(v); setPage(1); };
  const handleGender = (v: string) => { setGender(v); setPage(1); };

  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link to="/results" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              ← Back to Events
            </Link>
          </div>
          <Heading level={1} style={{ color: '#fff' }}>Race Results</Heading>
          {settings.enableLiveLeaderboard && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              Live
            </span>
          )}
        </Container>
      </Section>

      {/* Filter bar */}
      <FilterBar
        search={search}
        race={race}
        gender={gender}
        races={availableRaces}
        onSearchChange={handleSearch}
        onRaceChange={handleRace}
        onGenderChange={handleGender}
      />

      {/* Main + Sidebar */}
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
            {/* ── Main column ────────────────────────────────────────── */}
            <div>
              {/* Not published state */}
              {!loading && !error && !isPublished && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '1.0625rem' }}>
                  {statusMessage ?? 'Results not yet published for this event.'}
                </div>
              )}

              {isPublished && (
                <>
                  {/* Leaderboard header band */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      padding: '0.875rem 1.25rem',
                      borderRadius: availableTabs.length > 0 ? '10px 10px 0 0' : '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
                      Leaderboard
                    </span>
                    {!loading && totalCount > 0 && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8 }}>
                        {totalCount.toLocaleString()} finishers
                      </span>
                    )}
                  </div>

                  {/* Tabs */}
                  {availableTabs.length > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        backgroundColor: 'var(--color-bg-alt)',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {availableTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => { setActiveTab(tab.key); setPage(1); }}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9375rem',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Category sub-header (when race filter active) */}
                  {race !== 'All' && (
                    <div
                      style={{
                        backgroundColor: '#E8F4FD',
                        padding: '0.625rem 1.25rem',
                        borderBottom: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {race} — {availableTabs.find((t) => t.key === activeTab)?.label ?? 'Overall'}
                    </div>
                  )}

                  {/* Podium */}
                  {podiumRows && settings.showMedalIcon && (
                    <Podium top3={podiumRows} showMedal={settings.showMedalIcon} timeLabel={timeLabel} />
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
                                {['Rank', 'BIB', 'Name', 'Race', 'Gender', timeLabel, 'Cat Rank', 'Gen Rank'].map((h) => (
                                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <TableSkeleton rows={10} cols={8} />
                          </table>
                        </div>
                      ) : (
                        <ResultsTable
                          results={tableRows}
                          startRank={podiumRows ? 4 : 1}
                          timeLabel={timeLabel}
                          showSplitTimes={settings.showSplitTimes}
                          showPace={settings.showPace}
                        />
                      )}

                      {!loading && totalPages > 1 && (
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Sidebar ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SidebarEventCard slug={slug} />
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
