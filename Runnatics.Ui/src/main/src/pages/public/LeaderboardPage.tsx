import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { getPublicLeaderboard } from '../../services/publicApi';
import type { PublicLeaderboardEntry } from '../../services/publicApi';

// ── Category order for sorting ─────────────────────────────────────
function getCategoryStartAge(cat: string): number {
  const match = cat.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

function groupByCategory(
  entries: PublicLeaderboardEntry[],
): Array<{ category: string; entries: PublicLeaderboardEntry[] }> {
  const map = new Map<string, PublicLeaderboardEntry[]>();
  for (const entry of entries) {
    const cat = entry.category || 'Open';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => getCategoryStartAge(a) - getCategoryStartAge(b))
    .map(([category, entries]) => ({ category, entries }));
}

// ── Time badge ─────────────────────────────────────────────────────
function TimeBadge({ time }: { time?: string }) {
  if (!time) return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>—</span>;
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
  entries,
  showAll,
  onToggle,
  timeField,
  rankOnNet,
}: {
  category: string;
  entries: PublicLeaderboardEntry[];
  showAll: boolean;
  onToggle: () => void;
  timeField: string;
  rankOnNet: boolean;
}) {
  const SHOW_DEFAULT = 3;
  const displayed = showAll ? entries : entries.slice(0, SHOW_DEFAULT);
  const timeLabel = rankOnNet ? 'Chip time' : 'Gun time';

  return (
    <div
      style={{
        marginBottom: '1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Category header */}
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
        {category} — based on {timeLabel}
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA', borderBottom: '1px solid var(--color-border)' }}>
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
          {displayed.map((entry, i) => (
            <tr
              key={entry.participantId || i}
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
                  color: i === 0 ? '#B7791F' : i === 1 ? '#718096' : i === 2 ? '#9C4221' : 'var(--color-text-muted)',
                  width: '2.5rem',
                }}
              >
                {i + 1}
              </td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <Link
                  to={`/p/${entry.participantId}`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: '#4da1c0',
                    textDecoration: 'none',
                  }}
                >
                  {entry.fullName}
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
                {entry.bib}
              </td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <TimeBadge
                  time={timeField === 'NetTime' ? entry.netTime : entry.gunTime}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show more / less */}
      {entries.length > SHOW_DEFAULT && (
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
          {showAll ? `Show less` : `Show all ${entries.length} finishers`}
        </button>
      )}
    </div>
  );
}

// ── Gender column ───────────────────────────────────────────────────
function GenderColumn({
  label,
  entries,
  timeField,
  rankOnNet,
}: {
  label: string;
  entries: PublicLeaderboardEntry[];
  timeField: string;
  rankOnNet: boolean;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const grouped = groupByCategory(entries);

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
      {grouped.length === 0 && (
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
      {grouped.map(({ category, entries: catEntries }) => (
        <CategorySection
          key={category}
          category={category}
          entries={catEntries}
          showAll={expandedCats.has(category)}
          onToggle={() => toggle(category)}
          timeField={timeField}
          rankOnNet={rankOnNet}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
        }}
      >
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
                <div
                  style={{
                    ...shimmer,
                    height: '2.25rem',
                    borderRadius: 0,
                    backgroundColor: '#E8F4FD',
                  }}
                />
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

  const { data, loading, error, refetch } = usePublicApi(
    (signal) => getPublicLeaderboard(eventId!, raceId!, signal),
    [eventId, raceId],
  );

  const eventName = data?.eventName ?? 'Event';
  const raceName = data?.raceName ?? '';
  const raceDistance = data?.raceDistance;
  const results = data?.results ?? [];
  const settings = data?.displaySettings;
  const timeField = settings?.sortTimeField ?? 'NetTime';
  const rankOnNet = settings?.rankOnNet ?? true;

  const maleEntries = results.filter((r) => r.gender?.toLowerCase() === 'male');
  const femaleEntries = results.filter((r) => r.gender?.toLowerCase() === 'female');

  const raceTitle = raceName
    ? raceDistance
      ? `${raceName} (${raceDistance.toFixed(1)})`
      : raceName
    : '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Breadcrumb + Title */}
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
          ) : (
            <div
              style={{
                height: '2rem',
                width: '50%',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
          )}
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div style={{ padding: '2rem 0 4rem' }}>
          {error && <ErrorState message={error} onRetry={refetch} />}

          {loading && <LeaderboardSkeleton />}

          {!loading && !error && (
            <>
              {/* Two-column leaderboard */}
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
                  entries={maleEntries}
                  timeField={timeField}
                  rankOnNet={rankOnNet}
                />
                <GenderColumn
                  label="Female"
                  entries={femaleEntries}
                  timeField={timeField}
                  rankOnNet={rankOnNet}
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
                time.{' '}
                <strong>*Chip Time:</strong> Your finish time with reference to your starting time.
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

export default LeaderboardPage;
