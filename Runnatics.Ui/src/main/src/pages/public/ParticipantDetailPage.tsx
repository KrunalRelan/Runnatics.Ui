import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { publicApi } from '../../../../api/publicApi';
import type { ParticipantTimeDetail, ParticipantSplit } from '../../../../api/publicApi';

// ── Share buttons ──────────────────────────────────────────────────
function ShareButtons({ participantName }: { participantName: string }) {
  const pageUrl = window.location.href;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${participantName}'s race results!`,
  )}&url=${encodeURIComponent(pageUrl)}`;

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1.125rem',
    borderRadius: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnBase, backgroundColor: '#1877F2', color: '#fff' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        Share on Facebook
      </a>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnBase, backgroundColor: '#000', color: '#fff' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on Twitter
      </a>
    </div>
  );
}

// ── Info card ──────────────────────────────────────────────────────
function InfoCard({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div
      style={{
        backgroundColor: '#1A5276',
        color: '#fff',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        minWidth: '120px',
        flex: '1 1 120px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.65)',
          marginBottom: '0.375rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#fff',
        }}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}

// ── Rank badge ─────────────────────────────────────────────────────
function RankBadge({
  label,
  rank,
  total,
  percentage,
  color,
}: {
  label: string;
  rank?: number | null;
  total?: number | null;
  percentage?: number | null;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        textAlign: 'center',
        color: '#fff',
        flex: '1 1 130px',
        minWidth: '120px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '0.375rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '2rem',
          lineHeight: 1,
          marginBottom: '0.25rem',
        }}
      >
        {rank ?? '—'}
      </div>
      {total != null && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          of {total.toLocaleString()}
        </div>
      )}
      {percentage != null && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '0.25rem',
          }}
        >
          top {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// ── Timing section ─────────────────────────────────────────────────
function TimingSection({ label, detail }: { label: string; detail?: ParticipantTimeDetail }) {
  if (!detail?.time) return null;

  const overallPct =
    detail.overallRank && detail.totalOverall
      ? (detail.overallRank / detail.totalOverall) * 100
      : null;
  const genderPct =
    detail.genderRank && detail.totalGender
      ? (detail.genderRank / detail.totalGender) * 100
      : null;
  const categoryPct =
    detail.categoryRank && detail.totalCategory
      ? (detail.categoryRank / detail.totalCategory) * 100
      : null;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.9375rem',
        }}
      >
        Timing ({label})
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div
          style={{
            backgroundColor: '#1A1A2E',
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 800,
              fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
              color: '#fff',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            {detail.time}
          </div>
          {detail.averagePace && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.55)',
                marginTop: '0.625rem',
              }}
            >
              Average Pace: {detail.averagePace} min/km
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
          <RankBadge
            label="Overall"
            rank={detail.overallRank}
            total={detail.totalOverall}
            percentage={overallPct}
            color="#4da1c0"
          />
          <RankBadge
            label="Gender"
            rank={detail.genderRank}
            total={detail.totalGender}
            percentage={genderPct}
            color="#C0392B"
          />
          <RankBadge
            label="Category"
            rank={detail.categoryRank}
            total={detail.totalCategory}
            percentage={categoryPct}
            color="#148F77"
          />
        </div>
      </div>
    </div>
  );
}

// ── Splits table ────────────────────────────────────────────────────
function SplitsTable({ splits }: { splits?: ParticipantSplit[] }) {
  if (!splits || splits.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.9375rem',
        }}
      >
        Splits
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#F5F7FA',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {['Split', 'Split Time', 'Race Time', 'Distance', 'Speed (km/hr)'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '0.625rem 0.875rem',
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
              ))}
            </tr>
          </thead>
          <tbody>
            {splits.map((split, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <td
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {split.checkpoint}
                </td>
                <td
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text)',
                  }}
                >
                  {split.splitTime}
                </td>
                <td
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text)',
                  }}
                >
                  {split.raceTime}
                </td>
                <td
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {split.splitDist > 0 ? `${split.splitDist.toFixed(1)} km` : '—'}
                </td>
                <td
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {split.speed != null && split.speed > 0 ? split.speed.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '0.625rem 0.875rem',
          backgroundColor: '#F5F7FA',
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        *based on Chip time
      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────
function DetailSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '6px',
  } as const;

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...shimmer, height: '2rem', width: '55%' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ ...shimmer, height: '80px', flex: 1, borderRadius: '8px' }} />
          ))}
        </div>
        <div style={{ ...shimmer, height: '200px', borderRadius: '10px' }} />
        <div style={{ ...shimmer, height: '200px', borderRadius: '10px' }} />
        <div style={{ ...shimmer, height: '250px', borderRadius: '10px' }} />
      </div>
    </>
  );
}

// ── Main page ───────────────────────────────────────────────────────
function ParticipantDetailPage() {
  const { participantId } = useParams<{ participantId: string }>();

  const { data, loading, error, refetch } = usePublicApi(
    (signal) => publicApi.getParticipantDetail(participantId!, signal),
    [participantId],
  );

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
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
              }}
            >
              ← Back
            </Link>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              color: '#fff',
              margin: '0 0 0.375rem',
            }}
          >
            {loading ? 'Loading…' : (data?.participant.name ?? 'Participant Results')}
          </h1>
          {!loading && data && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.65)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem 1.5rem',
              }}
            >
              {data.eventName && <span>{data.eventName}</span>}
              {data.raceDate && <span>{data.raceDate}</span>}
            </div>
          )}
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div style={{ padding: '1.5rem 0 4rem' }}>
          {loading && <DetailSkeleton />}
          {error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && data && (
            <>
              {/* Share buttons */}
              <div style={{ marginBottom: '1.5rem' }}>
                <ShareButtons participantName={data.participant.name} />
              </div>

              {/* Info cards */}
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '2rem' }}
              >
                <InfoCard label="Bib Number" value={data.participant.bib} />
                <InfoCard label="Gender" value={data.participant.gender} />
                <InfoCard label="Category" value={data.participant.category} />
                <InfoCard
                  label="Distance"
                  value={
                    data.participant.distance
                      ? `${parseFloat(data.participant.distance).toFixed(1)} km`
                      : '—'
                  }
                />
              </div>

              {/* Chip time */}
              <TimingSection label="Chip time" detail={data.chipTime} />

              {/* Gun time */}
              <TimingSection label="Gun time" detail={data.gunTime} />

              {/* Splits */}
              <SplitsTable splits={data.splits} />
            </>
          )}

          {!loading && !error && !data && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
              }}
            >
              Participant not found.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default ParticipantDetailPage;
