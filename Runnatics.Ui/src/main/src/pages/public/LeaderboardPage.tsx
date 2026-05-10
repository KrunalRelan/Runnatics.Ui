import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type {
  GroupedLeaderboardCategory,
  GroupedLeaderboardParticipant,
  GroupedLeaderboardGender,
} from '../../../../api/publicApi';

// ── Podium ─────────────────────────────────────────────────────────

function derivePodium(genderCategories: GroupedLeaderboardGender[]): GroupedLeaderboardParticipant[] {
  const all = genderCategories.flatMap((gc) => gc.categories.flatMap((c) => c.participants));
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (!p.chipTime || seen.has(p.bib)) return false;
    seen.add(p.bib);
    return true;
  });
  return unique.sort((a, b) => (a.chipTime ?? '').localeCompare(b.chipTime ?? '')).slice(0, 3);
}

const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_COLORS = ['#C0C0C0', '#FFD700', '#CD7F32'] as const;
const PODIUM_TEXT   = ['#4A4A4A', '#7C5A00', '#5C3000'] as const;
const PODIUM_LABELS = ['2nd', '1st', '3rd'] as const;
const PODIUM_ICONS  = ['🥈', '🥇', '🥉'] as const;
const PODIUM_BARS   = ['80px', '104px', '64px'] as const;

function LeaderboardPodium({ genderCategories }: { genderCategories: GroupedLeaderboardGender[] }) {
  const top3 = derivePodium(genderCategories);
  if (top3.length < 3) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '1.75rem 1rem 0',
        backgroundColor: '#F0F4FF',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
      }}
    >
      {PODIUM_ORDER.map((srcIdx, colIdx) => {
        const p = top3[srcIdx];
        if (!p) return null;
        return (
          <div key={p.bib} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', maxWidth: '220px' }}>
            <span style={{ fontSize: '1.875rem', lineHeight: 1 }}>{PODIUM_ICONS[colIdx]}</span>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#1a56db', fontWeight: 600 }}>
              BIB {p.bib}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {p.chipTime ?? '—'}
            </div>
            <div
              style={{
                width: '100%',
                backgroundColor: PODIUM_COLORS[colIdx],
                borderRadius: '6px 6px 0 0',
                height: PODIUM_BARS[colIdx],
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '0.5rem',
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: PODIUM_TEXT[colIdx] }}>
                {PODIUM_LABELS[colIdx]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Category order ─────────────────────────────────────────────────
function getCategoryStartAge(cat: string): number {
  const match = cat.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

// ── Time badge ─────────────────────────────────────────────────────
function TimeBadge({ time }: { time?: string }) {
  if (!time) {
    return (
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>—</span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: '#4da1c0',
        color: '#fff',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        fontWeight: 700,
        padding: '0.2rem 0.75rem',
        borderRadius: '12px',
        whiteSpace: 'nowrap',
      }}
    >
      {time}
    </span>
  );
}

// ── Category section ────────────────────────────────────────────────
function CategorySection({
  category,
  participants,
  showAll,
  onToggle,
}: {
  category: string;
  participants: GroupedLeaderboardParticipant[];
  showAll: boolean;
  onToggle: () => void;
}) {
  const SHOW_DEFAULT = 3;
  const displayed = showAll ? participants : participants.slice(0, SHOW_DEFAULT);

  return (
    <div
      style={{
        marginBottom: '1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: '#E8F4FD',
          padding: '0.625rem 1rem',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#1A5276',
          borderBottom: '1px solid #BEE3F8',
        }}
      >
        {category} — based on Chip time
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              backgroundColor: '#F5F7FA',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {['#', 'Name', 'Bib', 'Chip Time'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '0.5rem 0.75rem',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((p, i) => (
            <tr
              key={p.participantDetailUrl || i}
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA',
              }}
            >
              <td
                style={{
                  padding: '0.625rem 0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color:
                    p.rank === 1
                      ? '#B7791F'
                      : p.rank === 2
                      ? '#718096'
                      : p.rank === 3
                      ? '#9C4221'
                      : 'var(--color-text-muted)',
                  width: '2.5rem',
                }}
              >
                {p.rank}
              </td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <Link
                  to={p.participantDetailUrl}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: '#4da1c0',
                    textDecoration: 'none',
                  }}
                >
                  {p.name}
                </Link>
              </td>
              <td
                style={{
                  padding: '0.625rem 0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {p.bib}
              </td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <TimeBadge time={p.chipTime} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {participants.length > SHOW_DEFAULT && (
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: '#F5F7FA',
            border: 'none',
            borderTop: '1px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: '#4da1c0',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {showAll ? 'Show less' : `Show all ${participants.length} finishers`}
        </button>
      )}
    </div>
  );
}

// ── Gender column ───────────────────────────────────────────────────
function GenderColumn({
  label,
  categories,
  showAll,
}: {
  label: string;
  categories: GroupedLeaderboardCategory[];
  showAll: boolean;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const sorted = [...categories].sort(
    (a, b) => getCategoryStartAge(a.categoryName) - getCategoryStartAge(b.categoryName),
  );

  const toggle = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: 'var(--color-text)',
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid var(--color-primary)',
        }}
      >
        {label}
      </div>
      {sorted.length === 0 && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          No results.
        </p>
      )}
      {sorted.map(({ categoryName, participants }) => (
        <CategorySection
          key={categoryName}
          category={categoryName}
          participants={participants}
          showAll={showAll || expandedCats.has(categoryName)}
          onToggle={() => toggle(categoryName)}
        />
      ))}
    </div>
  );
}

// ── Skeleton loader ─────────────────────────────────────────────────
function LeaderboardSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '6px',
  } as const;

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {[0, 1].map((col) => (
          <div key={col}>
            <div style={{ ...shimmer, height: '1.5rem', width: '40%', marginBottom: '1.5rem' }} />
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                style={{
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...shimmer, height: '2.25rem', borderRadius: 0 }} />
                {[0, 1, 2].map((r) => (
                  <div
                    key={r}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ ...shimmer, height: '0.875rem', width: '1.5rem' }} />
                    <div style={{ ...shimmer, height: '0.875rem', flex: 1 }} />
                    <div style={{ ...shimmer, height: '0.875rem', width: '3rem' }} />
                    <div style={{ ...shimmer, height: '0.875rem', width: '5rem' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main page ───────────────────────────────────────────────────────
function LeaderboardPage() {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  const [searchInput, setSearchInput] = useState('');
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 350);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.getGroupedLeaderboard(
        eventId!,
        raceId!,
        {
          search: debouncedSearch || undefined,
          showAll,
        },
        signal,
      ),
    [eventId, raceId, debouncedSearch, showAll],
  );

  const eventName = data?.eventName ?? 'Event';
  const raceName = data?.raceName ?? '';
  const raceDistance = data?.raceDistance;
  const genderCategories = data?.genderCategories ?? [];

  const maleCategories =
    genderCategories.find((g) => g.gender.toLowerCase() === 'male')?.categories ?? [];
  const femaleCategories =
    genderCategories.find((g) => g.gender.toLowerCase() === 'female')?.categories ?? [];

  const raceTitle = raceName
    ? raceDistance
      ? `${raceName} (${raceDistance.toFixed(1)})`
      : raceName
    : '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem) 0 1.5rem',
        }}
      >
        <Container>
          {/* Breadcrumb */}
          <nav
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '0.875rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              alignItems: 'center',
            }}
          >
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Home
            </Link>
            <span>/</span>
            {eventId && (
              <>
                <Link
                  to={`/e/${eventId}`}
                  style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                >
                  {eventName}
                </Link>
                <span>/</span>
              </>
            )}
            {raceName && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{raceName}</span>
                <span>/</span>
              </>
            )}
            <span style={{ color: '#fff' }}>Leaderboard</span>
          </nav>

          {/* Title */}
          {raceTitle ? (
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: '#fff',
                margin: 0,
              }}
            >
              {raceTitle} Leaderboard
            </h1>
          ) : loading ? (
            <div
              style={{
                height: '2rem',
                width: '50%',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
          ) : null}
        </Container>
      </div>

      {/* Search + Show All controls */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Container>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 0',
              flexWrap: 'wrap',
            }}
          >
            {/* Search input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search participant name…"
                style={{
                  width: '100%',
                  paddingLeft: '2.25rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Show All toggle */}
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                padding: '0.5rem 1.125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: showAll ? 'var(--color-primary)' : '#fff',
                color: showAll ? '#fff' : 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: showAll ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {showAll ? 'Show Top 3' : 'Show All'}
            </button>

            {!loading && data?.totalFinishers != null && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginLeft: 'auto',
                }}
              >
                {data.totalFinishers.toLocaleString()} finishers
              </span>
            )}
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div style={{ padding: '2rem 0 4rem' }}>
          {error && <ErrorState message={error} onRetry={refetch} />}
          {loading && <LeaderboardSkeleton />}

          {!loading && !error && (
            <>
              {/* Podium — top 3 overall by chip time */}
              {genderCategories.length > 0 && (
                <LeaderboardPodium genderCategories={genderCategories} />
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2.5rem',
                  alignItems: 'start',
                }}
              >
                <GenderColumn
                  label="Male"
                  categories={maleCategories}
                  showAll={showAll}
                />
                <GenderColumn
                  label="Female"
                  categories={femaleCategories}
                  showAll={showAll}
                />
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#F5F7FA',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                }}
              >
                <strong>*Gun Time:</strong> Your finish time with reference to the race starting
                time. <strong>*Chip Time:</strong> Your finish time with reference to your starting
                time.
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

export default LeaderboardPage;
