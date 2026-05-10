import { useState } from 'react';
import { ChevronDown, Search, Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { GroupedLeaderboardParticipant } from '../../../../api/publicApi';

// ── Derive podium from grouped data ───────────────────────────────

function derivePodium(genderCategories: { gender: string; categories: { categoryName: string; participants: GroupedLeaderboardParticipant[] }[] }[]) {
  const all = genderCategories.flatMap((gc) => gc.categories.flatMap((c) => c.participants));
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (!p.chipTime || seen.has(p.bib)) return false;
    seen.add(p.bib);
    return true;
  });
  return unique.sort((a, b) => (a.chipTime ?? '').localeCompare(b.chipTime ?? '')).slice(0, 3);
}

// ── Podium display ────────────────────────────────────────────────

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const;
const MEDAL_TEXT = ['#7C5A00', '#4A4A4A', '#5C3000'] as const;
const MEDAL_LABELS = ['1st', '2nd', '3rd'] as const;
const MEDAL_ICONS = ['🥇', '🥈', '🥉'] as const;
const PODIUM_ORDER = [1, 0, 2] as const; // 2nd left, 1st center, 3rd right
const BAR_HEIGHTS = ['80px', '104px', '64px'] as const;

function PodiumSection({ participants }: { participants: GroupedLeaderboardParticipant[] }) {
  if (participants.length < 1) return null;
  const ordered = PODIUM_ORDER.map((i) => participants[i]).filter(Boolean);
  const heights = PODIUM_ORDER.map((i) => BAR_HEIGHTS[i]);
  const colors = PODIUM_ORDER.map((i) => MEDAL_COLORS[i]);
  const textColors = PODIUM_ORDER.map((i) => MEDAL_TEXT[i]);
  const labels = PODIUM_ORDER.map((i) => MEDAL_LABELS[i]);
  const icons = PODIUM_ORDER.map((i) => MEDAL_ICONS[i]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '2rem 1rem 0',
        backgroundColor: 'var(--color-bg-alt)',
        borderRadius: '10px 10px 0 0',
        marginBottom: 0,
      }}
    >
      {ordered.map((p, i) => (
        <div
          key={p?.bib ?? i}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', maxWidth: '220px' }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{icons[i]}</span>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p?.name ?? '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#1a56db', fontWeight: 600 }}>
            BIB {p?.bib ?? '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {p?.chipTime ?? '—'}
          </div>
          <div
            style={{
              width: '100%',
              backgroundColor: colors[i],
              borderRadius: '6px 6px 0 0',
              height: heights[i],
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '0.625rem',
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', color: textColors[i] }}>
              {labels[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Leaderboard table (grouped gender/category) ───────────────────

function CategoryTable({ categoryName, participants }: { categoryName: string; participants: GroupedLeaderboardParticipant[] }) {
  const [expanded, setExpanded] = useState(false);
  const SHOW = 5;
  const displayed = expanded ? participants : participants.slice(0, SHOW);

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ backgroundColor: '#E8F4FD', padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: '#1A5276', borderBottom: '1px solid #BEE3F8' }}>
        {categoryName} — Chip Time
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a56db' }}>
            {['#', 'Name', 'BIB', 'Chip Time'].map((h) => (
              <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((p, i) => (
            <tr key={p.participantDetailUrl || i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: p.rank <= 3 ? ['#B7791F', '#718096', '#9C4221'][p.rank - 1] : 'var(--color-text-muted)', width: '2.5rem' }}>
                {p.rank}
              </td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <a href={p.participantDetailUrl} style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: '#1a56db', textDecoration: 'none' }}>
                  {p.name}
                </a>
              </td>
              <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{p.bib}</td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#1a56db', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '12px' }}>
                  {p.chipTime ?? '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {participants.length > SHOW && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ width: '100%', padding: '0.5rem', background: '#F5F7FA', border: 'none', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#1a56db', cursor: 'pointer', fontWeight: 500 }}
        >
          {expanded ? 'Show less' : `Show all ${participants.length} finishers`}
        </button>
      )}
    </div>
  );
}

// ── Leaderboard view (rendered once event + race selected) ─────────

function LeaderboardView({ eventId, raceId, bracket, search }: { eventId: string; raceId: string; bracket: string; search: string }) {
  const debouncedSearch = useDebounce(search, 350);
  const [showAll, setShowAll] = useState(false);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.getGroupedLeaderboard(
        eventId,
        raceId,
        { search: debouncedSearch || undefined, category: bracket || undefined, showAll },
        signal,
      ),
    [eventId, raceId, debouncedSearch, bracket, showAll],
  );

  const genderCategories = data?.genderCategories ?? [];
  const maleCategories = genderCategories.find((g) => g.gender.toLowerCase() === 'male')?.categories ?? [];
  const femaleCategories = genderCategories.find((g) => g.gender.toLowerCase() === 'female')?.categories ?? [];
  const podiumData = genderCategories.length > 0 ? derivePodium(genderCategories) : [];

  const raceTitle = data?.raceName
    ? data.raceDistance
      ? `${data.raceName} (${data.raceDistance.toFixed(1)} KM)`
      : data.raceName
    : '';

  return (
    <div>
      {/* Leaderboard header */}
      <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '0.875rem 1.25rem', borderRadius: podiumData.length >= 3 ? '10px 10px 0 0' : '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem' }}>Leaderboard</div>
          {raceTitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8, marginTop: '0.125rem' }}>{raceTitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {data?.totalFinishers != null && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8 }}>
              {data.totalFinishers.toLocaleString()} finishers
            </span>
          )}
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{ padding: '0.375rem 0.875rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', backgroundColor: showAll ? '#fff' : 'transparent', color: showAll ? '#1a56db' : '#fff', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {showAll ? 'Top 3' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Podium */}
      {!loading && !error && podiumData.length >= 3 && (
        <PodiumSection participants={podiumData} />
      )}

      {error && (
        <div style={{ padding: '2rem' }}>
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          Loading results…
        </div>
      )}

      {!loading && !error && (
        <div style={{ border: '1px solid var(--color-border)', borderTop: podiumData.length >= 3 ? 'none' : '1px solid var(--color-border)', borderRadius: '0 0 10px 10px', padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Male column */}
            {maleCategories.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a56db' }}>
                  Male
                </div>
                {maleCategories.sort((a, b) => {
                  const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 999; };
                  return n(a.categoryName) - n(b.categoryName);
                }).map(({ categoryName, participants }) => (
                  <CategoryTable key={categoryName} categoryName={categoryName} participants={participants} />
                ))}
              </div>
            )}
            {/* Female column */}
            {femaleCategories.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a56db' }}>
                  Female
                </div>
                {femaleCategories.sort((a, b) => {
                  const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 999; };
                  return n(a.categoryName) - n(b.categoryName);
                }).map(({ categoryName, participants }) => (
                  <CategoryTable key={categoryName} categoryName={categoryName} participants={participants} />
                ))}
              </div>
            )}
            {maleCategories.length === 0 && femaleCategories.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                No results found.
              </div>
            )}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '0.875rem 1rem', backgroundColor: '#F5F7FA', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <strong>*Chip Time:</strong> Your finish time relative to your individual start crossing.{' '}
            <strong>*Gun Time:</strong> Your finish time relative to the official race start.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Select dropdown with chevron ──────────────────────────────────

function FilterSelect({ label, value, onChange, options, disabled }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '160px' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          appearance: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          padding: '0.625rem 2.5rem 0.625rem 1rem',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          backgroundColor: disabled ? 'var(--color-bg-alt)' : '#fff',
          color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        aria-label={label}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown
        size={15}
        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

function GlobalResultsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [eventId, setEventId] = useState('');
  const [raceId, setRaceId] = useState('');
  const [bracket, setBracket] = useState('');
  const [search, setSearch] = useState('');

  // Fetch filter metadata (years + events list)
  const { data: filterData } = usePublicApi(
    (signal) => publicApi.getResultFilters(Number(year), signal).catch(() => ({ years: [], events: [] })),
    [year],
  );

  // Fetch races after event is selected
  const { data: raceData } = usePublicApi(
    (signal) =>
      eventId
        ? publicApi.getResultRaces(eventId, signal).catch(() => ({ races: [] }))
        : Promise.resolve({ races: [] }),
    [eventId],
  );

  // Fetch brackets after race is selected
  const { data: bracketData } = usePublicApi(
    (signal) =>
      eventId && raceId
        ? publicApi.getResultBrackets(eventId, raceId, signal).catch(() => ({ brackets: [] }))
        : Promise.resolve({ brackets: [] }),
    [eventId, raceId],
  );

  const yearRange = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const years = (filterData?.years?.length ? filterData.years : yearRange).map((y) => ({ value: String(y), label: String(y) }));

  const events = [
    { value: '', label: 'Select Event' },
    ...(filterData?.events ?? []).map((e) => ({ value: e.encryptedId, label: e.name })),
  ];

  const races = [
    { value: '', label: 'Select Race' },
    ...(raceData?.races ?? []).map((r) => ({ value: r.encryptedRaceId, label: r.name + (r.distance ? ` (${r.distance})` : '') })),
  ];

  const brackets = [
    { value: '', label: 'All Brackets' },
    ...(bracketData?.brackets ?? []).map((b) => ({ value: b.name, label: b.name })),
  ];

  const handleYearChange = (v: string) => { setYear(v); setEventId(''); setRaceId(''); setBracket(''); };
  const handleEventChange = (v: string) => { setEventId(v); setRaceId(''); setBracket(''); };
  const handleRaceChange = (v: string) => { setRaceId(v); setBracket(''); };

  const showResults = !!(eventId && raceId);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Page header */}
      <div style={{ backgroundColor: 'var(--color-primary)', padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Trophy size={32} color="#EA580C" />
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', margin: 0 }}>
                Result Search
              </h1>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
              Find your race results across all Racetik events
            </p>
          </div>

          {/* Filter bar */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <FilterSelect
              label="Year"
              value={year}
              onChange={handleYearChange}
              options={years}
            />
            <FilterSelect
              label="Event"
              value={eventId}
              onChange={handleEventChange}
              options={events}
            />
            <FilterSelect
              label="Race"
              value={raceId}
              onChange={handleRaceChange}
              options={races}
              disabled={!eventId}
            />
            <FilterSelect
              label="Bracket"
              value={bracket}
              onChange={setBracket}
              options={brackets}
              disabled={!raceId}
            />

            {/* Search input */}
            <div style={{ position: 'relative', flex: '2 1 220px', minWidth: '180px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search BIB / Name…"
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  padding: '0.625rem 1rem 0.625rem 2.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container>
        <div style={{ padding: '2rem 0 4rem' }}>
          {!showResults ? (
            /* Placeholder when no race selected */
            <div
              style={{
                textAlign: 'center',
                padding: 'clamp(3rem, 8vw, 6rem) 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={44} color="#1a56db" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    color: 'var(--color-text)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '0.625rem',
                  }}
                >
                  Result Search
                </div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                  Select an event and race above to view the leaderboard and search for your results.
                </p>
              </div>
            </div>
          ) : (
            <LeaderboardView
              eventId={eventId}
              raceId={raceId}
              bracket={bracket}
              search={search}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export default GlobalResultsPage;
