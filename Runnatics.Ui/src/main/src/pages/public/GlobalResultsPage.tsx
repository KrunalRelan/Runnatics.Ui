import { useState } from 'react';
import { ChevronDown, Search, Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { GroupedLeaderboardParticipant, GroupedLeaderboardCategory } from '../../../../api/publicApi';

// ── Derive podium from grouped data ───────────────────────────────

function derivePodiumForGender(
  genderCategories: { gender: string; categories: { categoryName: string; participants: GroupedLeaderboardParticipant[] }[] }[],
  targetGender: string,
  overallRankBy: string,
) {
  const filtered = targetGender
    ? genderCategories.filter((gc) => gc.gender.toLowerCase() === targetGender.toLowerCase())
    : genderCategories;
  const all = filtered.flatMap((gc) => gc.categories.flatMap((c) => c.participants));
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (seen.has(p.bib)) return false;
    seen.add(p.bib);
    return true;
  });
  const isGun = overallRankBy === 'GunTime';
  return unique
    .filter((p) => (isGun ? !!p.gunTime : !!p.chipTime))
    .sort((a, b) => (isGun ? (a.gunTime ?? '') : (a.chipTime ?? '')).localeCompare(isGun ? (b.gunTime ?? '') : (b.chipTime ?? '')))
    .slice(0, 3);
}

// ── Podium display ────────────────────────────────────────────────

// All arrays indexed by COLUMN position: [left=2nd, center=1st, right=3rd]
const PODIUM_ORDER   = [1, 0, 2] as const;
const COL_ICONS      = ['🥈', '🥇', '🥉'] as const;
const COL_LABELS     = ['2nd', '1st', '3rd'] as const;
const COL_HEIGHTS    = ['90px', '120px', '70px'] as const;
const COL_TEXT       = ['#4A4A4A', '#7C5A00', '#5C3000'] as const;
const COL_GRADIENTS  = [
  'linear-gradient(to bottom, #C0C0C0, #A8A8A8)',
  'linear-gradient(to bottom, #FFD700, #FFA500)',
  'linear-gradient(to bottom, #CD7F32, #8B4513)',
] as const;

function PodiumSection({ participants }: { participants: GroupedLeaderboardParticipant[] }) {
  if (participants.length < 1) return null;
  const ordered = PODIUM_ORDER.map((i) => participants[i]).filter(Boolean);

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
      {ordered.map((p, col) => (
        <div
          key={p?.bib ?? col}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', maxWidth: '220px' }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{COL_ICONS[col]}</span>
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
              background: COL_GRADIENTS[col],
              borderRadius: '6px 6px 0 0',
              height: COL_HEIGHTS[col],
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '0.625rem',
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', color: COL_TEXT[col] }}>
              {COL_LABELS[col]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Leaderboard table (grouped gender/category) ───────────────────

function CategoryTable({ categoryName, participants, rankBy = 'ChipTime' }: { categoryName: string; participants: GroupedLeaderboardParticipant[]; rankBy?: string }) {
  // BUG-11: show all finishers (no "Show all" toggle, no row cap).
  const displayed = participants;
  const isGunTime = rankBy === 'GunTime';
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ backgroundColor: '#E8F4FD', padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: '#1A5276', borderBottom: '1px solid #BEE3F8' }}>
        {categoryName} — {timeLabel}
      </div>
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a56db' }}>
            {['#', 'Name', 'BIB', timeLabel].map((h) => (
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
                  {(isGunTime ? p.gunTime : p.chipTime) ?? '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Leaderboard view (rendered once event + race selected) ─────────

function LeaderboardView({ eventId, raceId, gender, search }: { eventId: string; raceId: string; gender: string; search: string }) {
  const debouncedSearch = useDebounce(search, 350);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.getGroupedLeaderboard(
        eventId,
        raceId,
        { search: debouncedSearch || undefined, gender: gender || undefined },
        signal,
      ),
    [eventId, raceId, debouncedSearch, gender],
  );

  const genderCategories = data?.genderCategories ?? [];
  // BUG-24: overall and category sort independently; each section has its own setting.
  const overallRankBy = data?.overallRankBy ?? data?.rankBy ?? 'ChipTime';
  const categoryRankBy = data?.categoryRankBy ?? data?.rankBy ?? 'ChipTime';
  // BUG-24: honour Show Overall / Show Category toggles (default true when absent).
  const showOverall = data?.showOverall !== false;
  const showCategory = data?.showCategory !== false;
  // BUG-12: never render an "Unknown"/blank category bucket.
  const isRealCategory = (c: GroupedLeaderboardCategory) =>
    !!c.categoryName && c.categoryName.trim().toLowerCase() !== 'unknown';
  const maleCategories = (genderCategories.find((g) => g.gender.toLowerCase() === 'male')?.categories ?? []).filter(isRealCategory);
  const femaleCategories = (genderCategories.find((g) => g.gender.toLowerCase() === 'female')?.categories ?? []).filter(isRealCategory);
  const malePodium = derivePodiumForGender(genderCategories, 'male', overallRankBy);
  const femalePodium = derivePodiumForGender(genderCategories, 'female', overallRankBy);
  const anyPodium = malePodium.length >= 3 || femalePodium.length >= 3;

  const raceTitle = data?.raceName
    ? data.raceDistance
      ? `${data.raceName} (${data.raceDistance.toFixed(1)} KM)`
      : data.raceName
    : '';

  return (
    <div>
      {/* Leaderboard header */}
      <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '0.875rem 1.25rem', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem' }}>Leaderboard</div>
          {raceTitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8, marginTop: '0.125rem' }}>{raceTitle}</div>}
        </div>
      </div>

      {/* Podium — Male and Female side by side (or single when gender filter active) */}
      {showOverall && !loading && !error && anyPodium && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', backgroundColor: 'var(--color-bg-alt)', padding: '0 1rem' }}>
          {(gender === '' || gender.toLowerCase() === 'male') && malePodium.length >= 3 && (
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', textAlign: 'center', paddingTop: '1rem' }}>Male</div>
              <PodiumSection participants={malePodium} />
            </div>
          )}
          {(gender === '' || gender.toLowerCase() === 'female') && femalePodium.length >= 3 && (
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', textAlign: 'center', paddingTop: '1rem' }}>Female</div>
              <PodiumSection participants={femalePodium} />
            </div>
          )}
        </div>
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

      {showCategory && !loading && !error && (
        <div style={{ border: '1px solid var(--color-border)', borderTop: anyPodium ? 'none' : '1px solid var(--color-border)', borderRadius: '0 0 10px 10px', padding: '1.5rem' }}>
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
                  <CategoryTable key={categoryName} categoryName={categoryName} participants={participants} rankBy={categoryRankBy} />
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
                  <CategoryTable key={categoryName} categoryName={categoryName} participants={participants} rankBy={categoryRankBy} />
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
  const [gender, setGender] = useState('');
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

  const genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  const handleYearChange = (v: string) => { setYear(v); setEventId(''); setRaceId(''); setGender(''); };
  const handleEventChange = (v: string) => { setEventId(v); setRaceId(''); setGender(''); };
  const handleRaceChange = (v: string) => { setRaceId(v); setGender(''); };

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
              label="Gender"
              value={gender}
              onChange={setGender}
              options={genderOptions}
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
              gender={gender}
              search={search}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export default GlobalResultsPage;
