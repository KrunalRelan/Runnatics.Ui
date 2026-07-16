import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { GroupedLeaderboardParticipant } from '../../../../api/publicApi';

// ── Small helpers ─────────────────────────────────────────────────

// Age categories sort by their leading number ("18-29" → 18); non-numeric last.
function getCategoryStartAge(name: string): number {
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : 999;
}

function timeOf(p: GroupedLeaderboardParticipant, rankBy: string): string {
  return (rankBy === 'GunTime' ? p.gunTime : p.chipTime) ?? '—';
}

// Cap a per-gender / per-category list to N and RENUMBER 1..N (per-gender position,
// not the overall/category-wide stored rank) so the podium reads 1/2/3.
function takeRanked(list: GroupedLeaderboardParticipant[], n: number): GroupedLeaderboardParticipant[] {
  return list.slice(0, Math.max(0, n)).map((p, i) => ({ ...p, rank: i + 1 }));
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

function PodiumSection({ participants, rankBy }: { participants: GroupedLeaderboardParticipant[]; rankBy: string }) {
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
            {p ? timeOf(p, rankBy) : '—'}
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

// ── Results table (the "rest" below the podium) ───────────────────

function ResultTable({ participants, rankBy }: { participants: GroupedLeaderboardParticipant[]; rankBy: string }) {
  if (participants.length === 0) return null;
  const isGunTime = rankBy === 'GunTime';
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', marginTop: '0.5rem' }}>
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
            {participants.map((p, i) => (
              <tr key={p.participantDetailUrl || i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-muted)', width: '2.5rem' }}>
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
                    {timeOf(p, rankBy)}
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

// ── One gender column: podium (top 3) + table for the rest ────────

function GenderBlock({ label, participants, rankBy }: { label: string; participants: GroupedLeaderboardParticipant[]; rankBy: string }) {
  const podium = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text)', textAlign: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a56db' }}>
        {label}
      </div>
      {participants.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          No results.
        </div>
      ) : (
        <>
          <PodiumSection participants={podium} rankBy={rankBy} />
          <ResultTable participants={rest} rankBy={rankBy} />
        </>
      )}
    </div>
  );
}

// ── Leaderboard view (rendered once event + race selected) ─────────

function LeaderboardView({ eventId, raceId, search }: { eventId: string; raceId: string; search: string }) {
  const debouncedSearch = useDebounce(search, 350);
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.getGroupedLeaderboard(
        eventId,
        raceId,
        // showAll:true → full lists so we can cap PER GENDER client-side.
        { search: debouncedSearch || undefined, showAll: true },
        signal,
      ),
    [eventId, raceId, debouncedSearch],
  );

  const genderCategories = data?.genderCategories ?? [];
  const overallResults = data?.overallResults ?? [];
  // BUG-24: overall and category sort independently; each section has its own setting.
  const overallRankBy = data?.overallRankBy ?? data?.rankBy ?? 'ChipTime';
  const categoryRankBy = data?.categoryRankBy ?? data?.rankBy ?? 'ChipTime';
  // BUG-24: honour Show Overall / Show Category toggles (default true when absent).
  const showOverall = data?.showOverall !== false;
  const showCategory = data?.showCategory !== false;

  // Per-gender caps from LeaderboardSettings (podium counts toward N); default 5 when unset.
  const overallN = data?.numberOfResultsToShowOverall && data.numberOfResultsToShowOverall > 0
    ? data.numberOfResultsToShowOverall : 5;
  const categoryN = data?.numberOfResultsToShowCategory && data.numberOfResultsToShowCategory > 0
    ? data.numberOfResultsToShowCategory : 5;

  // Category dropdown options — case-INSENSITIVE distinct across both genders. The raw
  // AgeCategory can carry inconsistent casing ("... yrs" vs "... Yrs"); collapse to one entry
  // per logical category. key = lowercased (used for filtering); label = most common casing.
  const categoryOptions = useMemo(() => {
    const variants = new Map<string, Map<string, number>>();
    genderCategories.forEach((g) =>
      g.categories.forEach((c) => {
        const raw = (c.categoryName ?? '').trim();
        if (!raw || raw.toLowerCase() === 'unknown') return;
        const key = raw.toLowerCase();
        const inner = variants.get(key) ?? new Map<string, number>();
        // Weight by runners so the dominant casing wins; +1 so a zero-runner variant still counts.
        inner.set(raw, (inner.get(raw) ?? 0) + (c.participants?.length ?? 0) + 1);
        variants.set(key, inner);
      }),
    );
    return Array.from(variants.entries())
      .map(([key, inner]) => {
        let label = key;
        let best = -1;
        inner.forEach((cnt, raw) => { if (cnt > best) { best = cnt; label = raw; } });
        return { key, label };
      })
      .sort((a, b) => getCategoryStartAge(a.label) - getCategoryStartAge(b.label));
  }, [genderCategories]);

  const selectedLabel = categoryOptions.find((o) => o.key === selectedCategory)?.label ?? selectedCategory;

  // If the selected category isn't present for this race (e.g. after a race switch), fall back to Overall.
  useEffect(() => {
    if (selectedCategory && !categoryOptions.some((o) => o.key === selectedCategory)) setSelectedCategory('');
  }, [categoryOptions, selectedCategory]);

  const inCategoryView = selectedCategory !== '';

  // Overall: split the flat overall list by gender, cap per gender, renumber.
  const maleOverall = takeRanked(overallResults.filter((p) => (p.gender ?? '').toUpperCase().startsWith('M')), overallN);
  const femaleOverall = takeRanked(overallResults.filter((p) => (p.gender ?? '').toUpperCase().startsWith('F')), overallN);

  // Category: MERGE every casing variant of the selected category (case-insensitive) per gender,
  // so a category split across spellings shows all its runners; then cap + renumber.
  const catFor = (genderLabel: string) => {
    const g = genderCategories.find((x) => x.gender.toLowerCase() === genderLabel);
    if (!g) return [];
    const merged = g.categories
      .filter((c) => (c.categoryName ?? '').trim().toLowerCase() === selectedCategory)
      .flatMap((c) => c.participants ?? [])
      .sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999));
    return takeRanked(merged, categoryN);
  };
  const maleCat = inCategoryView ? catFor('male') : [];
  const femaleCat = inCategoryView ? catFor('female') : [];

  const maleList = inCategoryView ? maleCat : maleOverall;
  const femaleList = inCategoryView ? femaleCat : femaleOverall;
  const activeRankBy = inCategoryView ? categoryRankBy : overallRankBy;
  const sectionVisible = inCategoryView ? showCategory : showOverall;
  const headingText = inCategoryView ? selectedLabel : 'Overall';

  const raceTitle = data?.raceName
    ? data.raceDistance
      ? `${data.raceName} (${data.raceDistance.toFixed(1)} KM)`
      : data.raceName
    : '';

  return (
    <div>
      {/* Heading band — CENTERED; "Overall" by default, category name when one is selected */}
      <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '0.875rem 1.25rem', borderRadius: '10px 10px 0 0', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem' }}>{headingText}</div>
        {raceTitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8, marginTop: '0.125rem' }}>{raceTitle}</div>}
      </div>

      {/* Category selector — dynamic from the race's actual categories */}
      {showCategory && categoryOptions.length > 0 && !loading && !error && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.625rem', padding: '1rem', backgroundColor: 'var(--color-bg-alt)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>View</span>
          <div style={{ minWidth: '220px' }}>
            <FilterSelect
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[{ value: '', label: 'Overall' }, ...categoryOptions.map((o) => ({ value: o.key, label: o.label }))]}
            />
          </div>
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

      {!loading && !error && (
        <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '1.5rem' }}>
          {!sectionVisible ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              {inCategoryView ? 'Category results are not available for this race.' : 'Overall results are not available for this race.'}
            </div>
          ) : maleList.length === 0 && femaleList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              No results found.
            </div>
          ) : (
            /* Male + Female ALWAYS both shown, side by side */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <GenderBlock label="Male" participants={maleList} rankBy={activeRankBy} />
              <GenderBlock label="Female" participants={femaleList} rankBy={activeRankBy} />
            </div>
          )}

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

  const handleYearChange = (v: string) => { setYear(v); setEventId(''); setRaceId(''); };
  const handleEventChange = (v: string) => { setEventId(v); setRaceId(''); };
  const handleRaceChange = (v: string) => { setRaceId(v); };

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
              search={search}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export default GlobalResultsPage;
