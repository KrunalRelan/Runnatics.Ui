import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { ParticipantTimeDetail, ParticipantSplit, ParticipantSearchItem } from '../../../../api/publicApi';

// ── Tab definitions ────────────────────────────────────────────────
type Tab = 'details' | 'splits' | 'comparison' | 'certificate' | 'share';

const TABS: { key: Tab; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'splits', label: 'Split Details' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'share', label: 'Share' },
];

// ── Info card ──────────────────────────────────────────────────────
function InfoCard({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ backgroundColor: '#1A5276', color: '#fff', borderRadius: '8px', padding: '1rem', textAlign: 'center', minWidth: '110px', flex: '1 1 110px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

// ── Rank badge ─────────────────────────────────────────────────────
function RankBadge({ label, rank, total, percentage, color }: { label: string; rank?: number | null; total?: number | null; percentage?: number | null; color: string }) {
  return (
    <div style={{ backgroundColor: color, borderRadius: '10px', padding: '1rem 1.25rem', textAlign: 'center', color: '#fff', flex: '1 1 130px', minWidth: '110px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.875rem', lineHeight: 1, marginBottom: '0.25rem' }}>
        {rank ?? '—'}
      </div>
      {total != null && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)' }}>
          of {total.toLocaleString()}
        </div>
      )}
      {percentage != null && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
          top {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// ── Timing section ─────────────────────────────────────────────────
function TimingSection({ label, detail }: { label: string; detail?: ParticipantTimeDetail }) {
  if (!detail?.time) return null;
  const overallPct = detail.overallRank && detail.totalOverall ? (detail.overallRank / detail.totalOverall) * 100 : null;
  const genderPct = detail.genderRank && detail.totalGender ? (detail.genderRank / detail.totalGender) * 100 : null;
  const categoryPct = detail.categoryRank && detail.totalCategory ? (detail.categoryRank / detail.totalCategory) * 100 : null;

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '0.75rem 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem' }}>
        Timing ({label})
      </div>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>
            {detail.time}
          </div>
          {detail.averagePace && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.5rem' }}>
              Avg Pace: {detail.averagePace} min/km
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <RankBadge label="Overall" rank={detail.overallRank} total={detail.totalOverall} percentage={overallPct} color="#1a56db" />
          <RankBadge label="Gender" rank={detail.genderRank} total={detail.totalGender} percentage={genderPct} color="#C0392B" />
          <RankBadge label="Category" rank={detail.categoryRank} total={detail.totalCategory} percentage={categoryPct} color="#148F77" />
        </div>
      </div>
    </div>
  );
}

// ── Splits table ────────────────────────────────────────────────────
function SplitsTable({ splits }: { splits?: ParticipantSplit[] }) {
  if (!splits || splits.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
        No split data available for this participant.
      </div>
    );
  }
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '0.75rem 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem' }}>
        Split Details
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a56db' }}>
              {['Interval', 'Split Time', 'Race Time', 'Distance', 'Speed (km/h)'].map((h) => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: '#fff', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {splits.map((split, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                  {split.checkpoint}
                </td>
                <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text)' }}>{split.splitTime}</td>
                <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text)' }}>{split.raceTime}</td>
                <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {split.splitDist > 0 ? `${split.splitDist.toFixed(1)} km` : '—'}
                </td>
                <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {split.speed != null && split.speed > 0 ? split.speed.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '0.625rem 0.875rem', backgroundColor: '#F5F7FA', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
        *based on Chip time
      </div>
    </div>
  );
}

// ── Share dropdown ─────────────────────────────────────────────────
function ShareDropdown({ participantId, name, eventName, chipTime, overallRank, totalOverall }: {
  participantId: string;
  name: string;
  eventName?: string;
  chipTime?: string;
  overallRank?: number | null;
  totalOverall?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageUrl = `${window.location.origin}/p/${participantId}`;
  const shareText = [
    `🏃 ${name} finished at ${eventName ?? 'a Racetik event'}!`,
    chipTime ? `⏱ Finish Time: ${chipTime}` : null,
    overallRank && totalOverall ? `🏅 Overall Rank: ${overallRank} of ${totalOverall}` : null,
    `📊 View full results: ${pageUrl}`,
  ].filter(Boolean).join('\n');

  const encoded = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(pageUrl);

  const channels = [
    {
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      href: `https://wa.me/?text=${encoded}`,
    },
    {
      label: 'X / Twitter',
      icon: '𝕏',
      color: '#000',
      href: `https://twitter.com/intent/tweet?text=${encoded}`,
    },
    {
      label: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'Copy Link',
      icon: '🔗',
      color: '#6B7280',
      href: null,
      onClick: () => {
        navigator.clipboard.writeText(pageUrl).catch(() => {});
        setOpen(false);
      },
    },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          backgroundColor: '#1a56db',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          cursor: 'pointer',
        }}
      >
        Share Results ▾
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '0.5rem',
            zIndex: 50,
            minWidth: '180px',
          }}
        >
          {channels.map((ch) =>
            ch.href ? (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-bg-alt)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; }}
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: ch.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9375rem', fontWeight: 700, flexShrink: 0 }}>
                  {ch.icon}
                </span>
                {ch.label}
              </a>
            ) : (
              <button
                key={ch.label}
                onClick={ch.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-alt)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: ch.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9375rem', flexShrink: 0 }}>
                  {ch.icon}
                </span>
                {ch.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Comparison tab ─────────────────────────────────────────────────
function ComparisonTab({ participantId, eventId }: { participantId: string; eventId?: string }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [comparing, setComparing] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const { data: searchResults, loading: searching } = usePublicApi(
    (signal) =>
      debouncedQuery.length >= 2 && eventId
        ? publicApi.searchParticipants(eventId, debouncedQuery, signal).catch(() => ({ participants: [] as ParticipantSearchItem[] }))
        : Promise.resolve({ participants: [] as ParticipantSearchItem[] }),
    [debouncedQuery, eventId],
  );

  const { data: comparison, loading: compLoading, error: compError } = usePublicApi(
    (signal) =>
      comparing && selectedId
        ? publicApi.compareParticipants({ participantId1: participantId, participantId2: selectedId }, signal).catch(() => null as any)
        : Promise.resolve(null as any),
    [comparing, selectedId],
  );

  return (
    <div>
      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #1a56db' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text)', marginBottom: '0.375rem' }}>
          Compare Timings With Another Runner
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Search for another participant in the same event to compare your splits and finish times side-by-side.
        </p>
      </div>

      {!eventId ? (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          Comparison requires event context. This feature will be available soon.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedId(''); setComparing(false); }}
                placeholder="Enter BIB Number / Name…"
                style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', padding: '0.625rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={() => { if (selectedId) setComparing(true); }}
              disabled={!selectedId}
              style={{ padding: '0.625rem 1.5rem', backgroundColor: selectedId ? '#1a56db' : 'var(--color-border)', color: selectedId ? '#fff' : 'var(--color-text-muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', cursor: selectedId ? 'pointer' : 'not-allowed' }}
            >
              Compare
            </button>
          </div>

          {/* Search results dropdown */}
          {searching && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Searching…</div>
          )}
          {!searching && searchResults && searchResults.participants.length > 0 && !selectedId && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
              {searchResults.participants.map((p) => (
                <button
                  key={p.encryptedId}
                  onClick={() => { setSelectedId(p.encryptedId); setQuery(p.name + ' — BIB ' + p.bib); }}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', backgroundColor: '#fff', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', textAlign: 'left' }}
                >
                  <span style={{ fontWeight: 500 }}>{p.name} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>(BIB {p.bib})</span></span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{p.chipTime ?? '—'}</span>
                </button>
              ))}
            </div>
          )}

          {/* Comparison results */}
          {compLoading && <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Loading comparison…</div>}
          {compError && (
            <div style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: '#991B1B' }}>
              Comparison feature is not yet available. Please check back soon.
            </div>
          )}
          {comparison && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a56db', color: '#fff' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600 }}>Checkpoint</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600 }}>{comparison.participant1.name}</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600 }}>{comparison.participant2.name}</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600 }}>Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.differences.map((d: { checkpoint: string; timeDiff: string; faster: 1 | 2 }, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600 }}>{d.checkpoint}</td>
                      <td style={{ padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: d.faster === 1 ? '#148F77' : 'var(--color-text)' }}>
                        {comparison.participant1.splits[i]?.time ?? '—'}
                      </td>
                      <td style={{ padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: d.faster === 2 ? '#148F77' : 'var(--color-text)' }}>
                        {comparison.participant2.splits[i]?.time ?? '—'}
                      </td>
                      <td style={{ padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: d.faster === 1 ? '#148F77' : '#C0392B', fontWeight: 600 }}>
                        {d.timeDiff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Certificate tab ────────────────────────────────────────────────
const CERT_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api$/, '');
const CERT_KEY: string = import.meta.env.VITE_PUBLIC_API_KEY ?? '';

function CertificateTab({ participantId, participantName }: { participantId: string; participantName: string }) {
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `${CERT_BASE}/api/public/participant/${participantId}/certificate`,
          { headers: { 'X-Public-Key': CERT_KEY } },
        );
        if (!res.ok) { setError(true); return; }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setCertUrl(objectUrl);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [participantId]);

  const download = () => {
    if (!certUrl) return;
    const a = document.createElement('a');
    a.href = certUrl;
    a.download = `Certificate_${participantName}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
        Loading certificate…
      </div>
    );
  }

  if (error || !certUrl) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
        Certificate is not available yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 1rem' }}>
      <img
        src={certUrl}
        alt="Race Certificate"
        style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      />
      <button
        onClick={download}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          backgroundColor: '#1a56db',
          color: '#fff',
          borderRadius: '8px',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        ⬇ Download Certificate
      </button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1.5rem' }}>
        <div style={{ ...shimmer, height: '2rem', width: '55%' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ ...shimmer, height: '80px', flex: 1, borderRadius: '8px' }} />)}
        </div>
        <div style={{ ...shimmer, height: '200px', borderRadius: '10px' }} />
        <div style={{ ...shimmer, height: '200px', borderRadius: '10px' }} />
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────
function ParticipantDetailPage() {
  const { participantId } = useParams<{ participantId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const { data, loading, error, refetch } = usePublicApi(
    (signal) => publicApi.getParticipantDetail(participantId!, signal),
    [participantId],
  );

  const chipRank = data?.chipTime?.overallRank;
  const chipTotal = data?.chipTime?.totalOverall;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', padding: 'clamp(1.25rem, 3vw, 2rem) 0 0' }}>
        <Container>
          {/* Back button */}
          <div style={{ marginBottom: '0.5rem' }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.history.back(); }}
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
            >
              ← Back
            </a>
          </div>

          {/* Name + event */}
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.375rem, 3vw, 2rem)', color: '#fff', margin: '0 0 0.25rem' }}>
            {loading ? 'Loading…' : (data?.participant.name ?? 'Participant Results')}
          </h1>
          {!loading && data && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', marginBottom: '1.25rem' }}>
              {data.eventName && <span>{data.eventName}</span>}
              {data.raceDate && <span>{data.raceDate}</span>}
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 0, overflow: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.75rem 1.125rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.key ? '3px solid #EA580C' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div style={{ padding: '1.75rem 0 4rem' }}>
          {loading && <DetailSkeleton />}
          {error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && data && (
            <>
              {/* ── Details tab ────────────────────────────────── */}
              {activeTab === 'details' && (
                <div>
                  {/* Info cards row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <InfoCard label="BIB" value={data.participant.bib} />
                    <InfoCard label="Gender" value={data.participant.gender} />
                    <InfoCard label="Category" value={data.participant.category} />
                    <InfoCard label="Distance" value={data.participant.distance ? `${parseFloat(data.participant.distance).toFixed(1)} km` : '—'} />
                  </div>

                  {/* Timings */}
                  <TimingSection label="Chip Time" detail={data.chipTime} />
                  <TimingSection label="Gun Time" detail={data.gunTime} />

                  {/* Share button */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <ShareDropdown
                      participantId={participantId!}
                      name={data.participant.name}
                      eventName={data.eventName}
                      chipTime={data.chipTime?.time}
                      overallRank={chipRank}
                      totalOverall={chipTotal}
                    />
                  </div>
                </div>
              )}

              {/* ── Split Details tab ───────────────────────────── */}
              {activeTab === 'splits' && (
                <SplitsTable splits={data.splits} />
              )}

              {/* ── Comparison tab ──────────────────────────────── */}
              {activeTab === 'comparison' && (
                <ComparisonTab participantId={participantId!} eventId={data.eventName} />
              )}

              {/* ── Certificate tab ─────────────────────────────── */}
              {activeTab === 'certificate' && (
                <CertificateTab participantId={participantId!} participantName={data.participant.name} />
              )}

              {/* ── Share tab ───────────────────────────────────── */}
              {activeTab === 'share' && (
                <div style={{ padding: '1.5rem 0' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>
                    Share Your Results
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Share your race results with friends and family via your preferred channel.
                  </p>
                  <ShareDropdown
                    participantId={participantId!}
                    name={data.participant.name}
                    eventName={data.eventName}
                    chipTime={data.chipTime?.time}
                    overallRank={chipRank}
                    totalOverall={chipTotal}
                  />

                  {/* Preview card */}
                  <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px', backgroundColor: '#F9FAFB', maxWidth: '480px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Share Preview
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {[
                        `🏃 ${data.participant.name} finished at ${data.eventName ?? 'a Racetik event'}!`,
                        data.chipTime?.time ? `⏱ Finish Time: ${data.chipTime.time}` : null,
                        chipRank && chipTotal ? `🏅 Overall Rank: ${chipRank} of ${chipTotal}` : null,
                        `📊 View full results: ${window.location.origin}/p/${participantId}`,
                      ].filter(Boolean).join('\n')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && !data && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              Participant not found.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default ParticipantDetailPage;
