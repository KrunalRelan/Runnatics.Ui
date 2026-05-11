import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ChevronDown, MapPin, Search, Users } from 'lucide-react';
import { Container, Section } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type {
  GroupedLeaderboardGender,
  GroupedLeaderboardParticipant,
  GroupedLeaderboardResponse,
} from '../../../../api/publicApi';
import { base64ToDataUrl } from '../../utility';

// ── Types ──────────────────────────────────────────────────────────

type RankedParticipant = GroupedLeaderboardParticipant & { overallRank: number };

// ── Helpers ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** Flatten all gender+category buckets, dedupe by BIB, sort by chip time, assign overall rank. */
function flattenAndRank(genderCategories: GroupedLeaderboardGender[]): RankedParticipant[] {
  const all = genderCategories.flatMap((gc) => gc.categories.flatMap((c) => c.participants));
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (!p.chipTime || seen.has(p.bib)) return false;
    seen.add(p.bib);
    return true;
  });
  return unique
    .sort((a, b) => (a.chipTime ?? '').localeCompare(b.chipTime ?? ''))
    .map((p, i) => ({ ...p, overallRank: i + 1 }));
}

// ── Podium ─────────────────────────────────────────────────────────
// Arrays indexed by column position: [left=2nd, center=1st, right=3rd]

const PODIUM_ORDER     = [1, 0, 2] as const;
const PODIUM_ICONS     = ['🥈', '🥇', '🥉'] as const;
const PODIUM_LABELS    = ['2nd', '1st', '3rd'] as const;
const PODIUM_TEXT      = ['#4A4A4A', '#7C5A00', '#5C3000'] as const;
const PODIUM_BARS      = ['90px', '120px', '70px'] as const;
const PODIUM_GRADIENTS = [
  'linear-gradient(to bottom, #C0C0C0, #A8A8A8)',
  'linear-gradient(to bottom, #FFD700, #FFA500)',
  'linear-gradient(to bottom, #CD7F32, #8B4513)',
] as const;

function Podium({ top3 }: { top3: RankedParticipant[] }) {
  if (top3.length < 3) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '2rem 1rem 0',
        backgroundColor: '#F0F4FF',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      {PODIUM_ORDER.map((srcIdx, col) => {
        const p = top3[srcIdx];
        if (!p) return null;
        return (
          <div
            key={p.bib}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', maxWidth: '220px' }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{PODIUM_ICONS[col]}</span>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem', color: '#111827', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#1a56db', fontWeight: 600 }}>
              BIB {p.bib}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>
              {p.chipTime ?? '—'}
            </div>
            <div
              style={{
                width: '100%',
                background: PODIUM_GRADIENTS[col],
                borderRadius: '6px 6px 0 0',
                height: PODIUM_BARS[col],
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '0.625rem',
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: PODIUM_TEXT[col] }}>
                {PODIUM_LABELS[col]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Results table ──────────────────────────────────────────────────

function ResultsTable({ rows }: { rows: RankedParticipant[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#1a56db' }}>
          {['BIB No', 'Name', 'Finished Time', 'Overall Rank'].map((h) => (
            <th
              key={h}
              style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr
            key={`${p.bib}-${p.overallRank}`}
            style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: i % 2 === 0 ? '#fff' : '#F9FAFB' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#EFF6FF'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = i % 2 === 0 ? '#fff' : '#F9FAFB'; }}
          >
            <td style={{ padding: '0.625rem 0.875rem' }}>
              <a
                href={p.participantDetailUrl}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700, color: '#1a56db', textDecoration: 'none' }}
              >
                {p.bib}
              </a>
            </td>
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#111827' }}>
              {p.name}
            </td>
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#374151', fontWeight: 600 }}>
              {p.chipTime ?? '—'}
            </td>
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#6B7280' }}>
              #{p.overallRank}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Pagination ─────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pageNums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const base: React.CSSProperties = {
    padding: '0.375rem 0.625rem',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
  };
  return (
    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 0' }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ ...base, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
      >
        ‹ Prev
      </button>
      {pageNums.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...base,
            backgroundColor: p === page ? '#1a56db' : '#fff',
            color: p === page ? '#fff' : '#374151',
            borderColor: p === page ? '#1a56db' : '#D1D5DB',
            fontWeight: p === page ? 700 : 400,
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{ ...base, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
      >
        Next ›
      </button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────

const shimmer = {
  background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
} as const;

function EventDetailSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ backgroundColor: 'var(--color-primary)', padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
        <Container>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '2.5rem', width: '55%', background: 'rgba(255,255,255,0.15)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' }} />
            <div style={{ height: '1rem', width: '35%', background: 'rgba(255,255,255,0.1)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' }} />
          </div>
        </Container>
      </div>
      <div style={{ backgroundColor: '#fff', padding: '2rem 0' }}>
        <Container>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ ...shimmer, height: '64px' }} />)}
          </div>
        </Container>
      </div>
    </>
  );
}

function LeaderboardLoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1.5rem' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ ...shimmer, height: '44px', borderRadius: '4px' }} />
      ))}
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────

const PAGE_SIZE = 50;
const EMPTY_LB: GroupedLeaderboardResponse = { genderCategories: [] };

// ── Main page ──────────────────────────────────────────────────────

function EventResultsPage() {
  const { eventSlug: eventId = '' } = useParams();
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  // ── Event detail ───────────────────────────────────────────────
  const { data: ev, loading: evLoading, error: evError } = usePublicApi(
    (signal) => publicApi.getEventDetail(eventId, signal),
    [eventId],
  );

  // Normalize race list — API may return races or categories depending on endpoint version
  const races = ev?.races?.length
    ? ev.races
    : (ev?.categories ?? []).map((c) => ({
        encryptedRaceId: c.encryptedRaceId ?? '',
        name: c.name,
        distance: c.distance || null,
        price: null as number | null,
        participantLimit: null as number | null,
        registeredCount: c.count ?? null,
        hasResults: c.hasResults ?? false,
      }));

  // Auto-select first race when event loads; reset on event change
  useEffect(() => {
    if (!ev) return;
    setSelectedRaceId(races[0]?.encryptedRaceId ?? '');
    setPage(1);
    setSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev?.encryptedId]);

  // ── Leaderboard ────────────────────────────────────────────────
  const { data: lb, loading: lbLoading, error: lbError, refetch: lbRefetch } = usePublicApi(
    (signal) =>
      selectedRaceId
        ? publicApi.getGroupedLeaderboard(
            eventId,
            selectedRaceId,
            { search: debouncedSearch || undefined, showAll: true },
            signal,
          )
        : Promise.resolve(EMPTY_LB),
    [eventId, selectedRaceId, debouncedSearch],
  );

  // ── Derived data ───────────────────────────────────────────────
  const allRanked  = flattenAndRank(lb?.genderCategories ?? []);
  const podium     = allRanked.slice(0, 3);
  const tableRows  = allRanked.slice(3);
  const totalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const pagedRows  = tableRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showPodium = !lbLoading && !lbError && podium.length >= 3;

  const raceDistance = lb?.raceDistance;
  const subHeading = raceDistance
    ? `${raceDistance.toFixed(1).replace(/\.0$/, '')} KM – Overall`
    : lb?.raceName
      ? `${lb.raceName} – Overall`
      : 'Overall';

  // ── Loading / error guards ─────────────────────────────────────
  if (evLoading) return <EventDetailSkeleton />;

  if (evError) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '4rem 0' }}>
        <Container>
          <ErrorState message={evError} />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              to="/events"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              ← Back to Events
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (!ev) return null;

  const showBannerBg = ev.showBanner && ev.bannerBase64;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:900px){.er-layout{flex-direction:column !important}.er-sidebar{display:none !important}}
      `}</style>

      {/* ── Dark event header ──────────────────────────────────────── */}
      <Section
        tone="dark"
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0',
          ...(showBannerBg
            ? {
                backgroundImage: `linear-gradient(rgba(10,18,32,0.72),rgba(10,18,32,0.72)),url(${base64ToDataUrl(ev.bannerBase64!)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}),
        }}
      >
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link
              to="/events"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
            >
              ← Back to Events
            </Link>
          </div>
          <h1
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: '#fff', margin: '0 0 0.875rem', lineHeight: 1.15 }}
          >
            {ev.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>
            {ev.eventDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> {formatDate(ev.eventDate)}
              </span>
            )}
            {ev.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} /> {ev.city}
              </span>
            )}
            {ev.participantCount != null && ev.participantCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={15} /> {ev.participantCount.toLocaleString()} participants
              </span>
            )}
          </div>
        </Container>
      </Section>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Container>
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Race dropdown (only when multiple races) */}
            {races.length > 1 && (
              <div style={{ position: 'relative', flex: '0 0 auto' }}>
                <select
                  value={selectedRaceId}
                  onChange={(e) => { setSelectedRaceId(e.target.value); setPage(1); }}
                  style={{ appearance: 'none', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', padding: '0.5rem 2.25rem 0.5rem 0.875rem', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#fff', color: '#111827', cursor: 'pointer', outline: 'none' }}
                >
                  {races.map((r) => (
                    <option key={r.encryptedRaceId} value={r.encryptedRaceId}>
                      {r.name}{r.distance ? ` (${r.distance})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }}
                />
              </div>
            )}
            {races.length === 1 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>
                {races[0].name}{races[0].distance ? ` (${races[0].distance})` : ''}
              </span>
            )}

            {/* BIB / Name search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search BIB / Name…"
                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
              />
            </div>

            {lb?.totalFinishers != null && lb.totalFinishers > 0 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#6B7280', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                {lb.totalFinishers.toLocaleString()} finishers
              </span>
            )}
          </div>
        </Container>
      </div>

      {/* ── Main content + sidebar ─────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: '4rem' }}>
        <Container>
          <div
            className="er-layout"
            style={{ display: 'flex', gap: '2rem', paddingTop: '2rem', alignItems: 'flex-start' }}
          >
            {/* ── Leaderboard ────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>

                {/* Heading */}
                <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '1rem 1rem 0.875rem', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', color: '#111827' }}>
                    Leaderboard
                  </div>
                </div>

                {/* Sub-heading — distance + bracket */}
                {!lbError && (lbLoading || allRanked.length > 0) && (
                  <div style={{ backgroundColor: '#DBEAFE', padding: '0.4rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 500, color: '#1E3A8A', borderBottom: '1px solid #BFDBFE' }}>
                    {lbLoading ? <span style={{ opacity: 0.5 }}>…</span> : subHeading}
                  </div>
                )}

                {/* Loading skeleton */}
                {lbLoading && <LeaderboardLoadingSkeleton />}

                {/* Error */}
                {lbError && (
                  <div style={{ padding: '1.5rem' }}>
                    <ErrorState message={lbError} onRetry={lbRefetch} />
                  </div>
                )}

                {/* Podium + table */}
                {!lbLoading && !lbError && (
                  <>
                    {showPodium && <Podium top3={podium} />}

                    {pagedRows.length > 0 ? (
                      <ResultsTable rows={pagedRows} />
                    ) : (
                      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#6B7280' }}>
                        {search
                          ? 'No results match your search.'
                          : selectedRaceId
                            ? 'No results available yet.'
                            : 'Select a race to view results.'}
                      </div>
                    )}
                  </>
                )}
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {/* ── Sidebar (desktop only) ──────────────────────────── */}
            <aside
              className="er-sidebar"
              style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '1.5rem' }}
            >
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {ev.bannerBase64 && (
                  <img
                    src={base64ToDataUrl(ev.bannerBase64)}
                    alt={ev.name}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#1a56db', marginBottom: '0.625rem', lineHeight: 1.3 }}>
                    {ev.name}
                  </div>
                  {ev.eventDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#EA580C', marginBottom: '0.375rem' }}>
                      <Calendar size={13} /> {formatDate(ev.eventDate)}
                    </div>
                  )}
                  {ev.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280', marginBottom: '0.375rem' }}>
                      <MapPin size={13} /> {ev.city}
                    </div>
                  )}
                  {ev.participantCount != null && ev.participantCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>
                      <Users size={13} /> {ev.participantCount.toLocaleString()} participants
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
}

export default EventResultsPage;
