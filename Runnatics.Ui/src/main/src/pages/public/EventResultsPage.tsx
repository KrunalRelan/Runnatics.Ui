import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { Container, Section } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type {
  GroupedLeaderboardParticipant,
  GroupedLeaderboardGender,
  GroupedLeaderboardResponse,
} from '../../../../api/publicApi';
import { base64ToDataUrl } from '../../utility';

// ── Helpers ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function getCategoryStartAge(cat: string): number {
  const m = cat.match(/\d+/);
  return m ? parseInt(m[0], 10) : 999;
}

// ── Podium ─────────────────────────────────────────────────────────
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

function Podium({ top3 }: { top3: GroupedLeaderboardParticipant[] }) {
  if (top3.length < 3) return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', justifyContent: 'center', padding: '2rem 1rem 0', backgroundColor: '#F0F4FF', borderBottom: '1px solid #E5E7EB' }}>
      {PODIUM_ORDER.map((srcIdx, col) => {
        const p = top3[srcIdx];
        if (!p) return null;
        return (
          <div key={p.bib} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', maxWidth: '220px' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{PODIUM_ICONS[col]}</span>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem', color: '#111827', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#1a56db', fontWeight: 600 }}>BIB {p.bib}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>
              {(p.chipTime ?? p.gunTime) ?? '—'}
            </div>
            <div style={{ width: '100%', background: PODIUM_GRADIENTS[col], borderRadius: '6px 6px 0 0', height: PODIUM_BARS[col], display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.625rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: PODIUM_TEXT[col] }}>{PODIUM_LABELS[col]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Gender badge ───────────────────────────────────────────────────
function GenderBadge({ gender }: { gender?: string }) {
  const isFemale = gender === 'F' || gender?.toLowerCase() === 'female';
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: isFemale ? '#FCE7F3' : '#DBEAFE',
      color: isFemale ? '#9D174D' : '#1E3A8A',
      fontFamily: 'var(--font-body)',
      fontSize: '0.75rem',
      fontWeight: 700,
      padding: '0.125rem 0.5rem',
      borderRadius: '10px',
    }}>
      {isFemale ? 'F' : 'M'}
    </span>
  );
}

// ── Overall Results table ──────────────────────────────────────────
function OverallTable({ rows, isGunTime }: { rows: GroupedLeaderboardParticipant[]; isGunTime: boolean }) {
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';
  return (
    <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#1a56db' }}>
          {['Rank', 'BIB', 'Name', 'Gender', timeLabel].map((h) => (
            <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr
            key={`${p.bib}-${p.rank}`}
            style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: i % 2 === 0 ? '#fff' : '#F9FAFB' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#EFF6FF'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = i % 2 === 0 ? '#fff' : '#F9FAFB'; }}
          >
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>#{p.rank}</td>
            <td style={{ padding: '0.625rem 0.875rem' }}>
              <a href={p.participantDetailUrl} style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700, color: '#1a56db', textDecoration: 'none' }}>{p.bib}</a>
            </td>
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#111827' }}>{p.name}</td>
            <td style={{ padding: '0.625rem 0.875rem' }}><GenderBadge gender={p.gender} /></td>
            <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#374151', fontWeight: 600 }}>
              {(isGunTime ? p.gunTime : p.chipTime) ?? '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);
  const nums  = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const base: React.CSSProperties = { padding: '0.375rem 0.625rem', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem' };
  return (
    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 0' }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={{ ...base, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>‹ Prev</button>
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{ ...base, backgroundColor: n === page ? '#1a56db' : '#fff', color: n === page ? '#fff' : '#374151', borderColor: n === page ? '#1a56db' : '#D1D5DB', fontWeight: n === page ? 700 : 400 }}>{n}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={{ ...base, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next ›</button>
    </div>
  );
}

// ── Age Category section ───────────────────────────────────────────
function AgeCategorySection({ categories, isGunTime }: { categories: GroupedLeaderboardGender[]; isGunTime: boolean }) {
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';
  const maleCategories   = categories.find((g) => g.gender.toLowerCase() === 'male')?.categories   ?? [];
  const femaleCategories = categories.find((g) => g.gender.toLowerCase() === 'female')?.categories ?? [];

  function GenderColumn({ label, cats }: { label: string; cats: typeof maleCategories }) {
    // BUG-12: never render an "Unknown"/blank category bucket.
    const sorted = [...cats]
      .filter((c) => c.categoryName && c.categoryName.trim().toLowerCase() !== 'unknown')
      .sort((a, b) => getCategoryStartAge(a.categoryName) - getCategoryStartAge(b.categoryName));
    return (
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: '#111827', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a56db' }}>
          {label}
        </div>
        {sorted.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', color: '#6B7280', fontSize: '0.9rem' }}>No results.</p>
        ) : (
          sorted.map(({ categoryName, participants }) => (
            <CategoryCard key={categoryName} categoryName={categoryName} participants={participants} timeLabel={timeLabel} isGunTime={isGunTime} />
          ))
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: '#111827', marginBottom: '1rem' }}>
        Age Category Results
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <GenderColumn label="Male"   cats={maleCategories} />
        <GenderColumn label="Female" cats={femaleCategories} />
      </div>
      <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#F5F7FA', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>
        <strong>*Gun Time:</strong> Your finish time from the official race start. <strong>*Chip Time:</strong> Your finish time from your personal start crossing.
      </div>
    </div>
  );
}

function CategoryCard({ categoryName, participants, timeLabel, isGunTime }: { categoryName: string; participants: GroupedLeaderboardParticipant[]; timeLabel: string; isGunTime: boolean }) {
  // BUG-11: show all finishers (no "Show all" toggle, no row cap).
  const displayed = participants;
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ backgroundColor: '#E8F4FD', padding: '0.625rem 1rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: '#1A5276', borderBottom: '1px solid #BEE3F8' }}>
        {categoryName} — {isGunTime ? 'Gun time' : 'Chip time'}
      </div>
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA', borderBottom: '1px solid #E5E7EB' }}>
            {['#', 'Name', 'BIB', timeLabel].map((h) => (
              <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((p, i) => (
            <tr key={p.participantDetailUrl || i} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: p.rank <= 3 ? ['#B7791F', '#718096', '#9C4221'][p.rank - 1] : '#6B7280', width: '2.5rem' }}>{p.rank}</td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <a href={p.participantDetailUrl} style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: '#4da1c0', textDecoration: 'none' }}>{p.name}</a>
              </td>
              <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}>{p.bib}</td>
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#4da1c0', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '12px' }}>
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

// ── Skeleton ───────────────────────────────────────────────────────
const shimmer = { background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' } as const;

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
    </>
  );
}

function LeaderboardLoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1.5rem' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ ...shimmer, height: '44px', borderRadius: '4px' }} />)}
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
  // BUG-24: Overall and Category sort independently — derive a flag per section.
  const isGunTimeOverall  = (lb?.overallRankBy ?? lb?.rankBy) === 'GunTime';
  const isGunTimeCategory = (lb?.categoryRankBy ?? lb?.rankBy) === 'GunTime';
  const timeLabel      = isGunTimeOverall ? 'Gun Time' : 'Chip Time';
  // BUG-24: honour Show Overall / Show Category toggles (default true when absent).
  const showOverall    = lb?.showOverall !== false;
  const showCategory   = lb?.showCategory !== false;
  const overallResults = lb?.overallResults ?? [];

  // Client-side search filter on overall results (search already applied server-side, but
  // if the user types we wait for the debounce + new fetch — no extra filter needed here)
  // Only carve the top 3 out into the podium when there are MORE than 3 finishers —
  // otherwise a small race (1-3 finishers) would leave the table empty and hide everyone.
  const usePodium  = overallResults.length > 3;
  const podium     = usePodium ? overallResults.slice(0, 3) : [];
  const tableRows  = usePodium ? overallResults.slice(3) : overallResults;
  const totalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const pagedRows  = tableRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showPodium = !lbLoading && !lbError && podium.length >= 3;

  const raceDistance = lb?.raceDistance;
  const subHeading = raceDistance
    ? `${raceDistance.toFixed(1).replace(/\.0$/, '')} KM — Overall (${timeLabel})`
    : lb?.raceName
      ? `${lb.raceName} — Overall (${timeLabel})`
      : `Overall (${timeLabel})`;

  // Reset page when race or search changes
  useEffect(() => { setPage(1); }, [selectedRaceId, debouncedSearch]);

  // ── Loading / error guards ─────────────────────────────────────
  if (evLoading) return <EventDetailSkeleton />;

  if (evError) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '4rem 0' }}>
        <Container>
          <ErrorState message={evError} />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/events" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-primary)', textDecoration: 'none' }}>← Back to Events</Link>
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
            ? { backgroundImage: `linear-gradient(rgba(10,18,32,0.72),rgba(10,18,32,0.72)),url(${base64ToDataUrl(ev.bannerBase64!)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}),
        }}
      >
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link to="/events" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Back to Events</Link>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: '#fff', margin: '0 0 0.875rem', lineHeight: 1.15 }}>{ev.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>
            {ev.eventDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={15} /> {formatDate(ev.eventDate)}</span>}
            {ev.city && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={15} /> {ev.city}</span>}
            {ev.participantCount != null && ev.participantCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={15} /> {ev.participantCount.toLocaleString()} participants</span>}
          </div>
        </Container>
      </Section>

      {/* ── Race tabs + search bar ────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Container>
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Race tabs */}
            {races.length > 1 ? (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {races.map((r) => {
                  const isActive = r.encryptedRaceId === selectedRaceId;
                  return (
                    <button
                      key={r.encryptedRaceId}
                      onClick={() => { setSelectedRaceId(r.encryptedRaceId); setPage(1); setSearch(''); }}
                      style={{
                        padding: '0.4rem 0.875rem',
                        border: `2px solid ${isActive ? '#1a56db' : '#D1D5DB'}`,
                        borderRadius: '20px',
                        backgroundColor: isActive ? '#1a56db' : '#fff',
                        color: isActive ? '#fff' : '#374151',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 400,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.name}{r.distance ? ` (${r.distance})` : ''}
                    </button>
                  );
                })}
              </div>
            ) : races.length === 1 ? (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>
                {races[0].name}{races[0].distance ? ` (${races[0].distance})` : ''}
              </span>
            ) : null}

            {/* BIB / Name search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px', marginLeft: 'auto' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search BIB / Name…"
                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
              />
            </div>

            {lb?.totalFinishers != null && lb.totalFinishers > 0 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {lb.totalFinishers.toLocaleString()} finishers
              </span>
            )}
          </div>
        </Container>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: '4rem' }}>
        <Container>
          <div className="er-layout" style={{ display: 'flex', gap: '2rem', paddingTop: '2rem', alignItems: 'flex-start' }}>

            {/* ── Left: results ──────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* ── SECTION 1: Overall Result ────────────────────── */}
              {showOverall && (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', marginBottom: '0' }}>
                <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '1rem 1rem 0.875rem', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', color: '#111827' }}>Overall Result</div>
                </div>

                {!lbError && (lbLoading || overallResults.length > 0) && (
                  <div style={{ backgroundColor: '#DBEAFE', padding: '0.4rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 500, color: '#1E3A8A', borderBottom: '1px solid #BFDBFE' }}>
                    {lbLoading ? <span style={{ opacity: 0.5 }}>…</span> : subHeading}
                  </div>
                )}

                {lbLoading && <LeaderboardLoadingSkeleton />}

                {lbError && (
                  <div style={{ padding: '1.5rem' }}>
                    <ErrorState message={lbError} onRetry={lbRefetch} />
                  </div>
                )}

                {!lbLoading && !lbError && (
                  <>
                    {showPodium && <Podium top3={podium} />}

                    {overallResults.length > 0 ? (
                      <OverallTable rows={pagedRows} isGunTime={isGunTimeOverall} />
                    ) : (
                      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#6B7280' }}>
                        {search ? 'No results match your search.' : selectedRaceId ? 'No results available yet.' : 'Select a race to view results.'}
                      </div>
                    )}
                  </>
                )}
              </div>
              )}

              {showOverall && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

              {/* ── SECTION 2: Age Category Result ───────────────── */}
              {showCategory && !lbLoading && !lbError && (lb?.genderCategories ?? []).length > 0 && (
                <AgeCategorySection categories={lb!.genderCategories} isGunTime={isGunTimeCategory} />
              )}
            </div>

            {/* ── Sidebar (desktop only) ─────────────────────────── */}
            <aside className="er-sidebar" style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '1.5rem' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {ev.bannerBase64 && (
                  <img src={base64ToDataUrl(ev.bannerBase64)} alt={ev.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#1a56db', marginBottom: '0.625rem', lineHeight: 1.3 }}>{ev.name}</div>
                  {ev.eventDate && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#EA580C', marginBottom: '0.375rem' }}><Calendar size={13} /> {formatDate(ev.eventDate)}</div>}
                  {ev.city && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280', marginBottom: '0.375rem' }}><MapPin size={13} /> {ev.city}</div>}
                  {ev.participantCount != null && ev.participantCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#6B7280' }}><Users size={13} /> {ev.participantCount.toLocaleString()} participants</div>}
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
