import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { GroupedLeaderboardParticipant } from '../../../../api/publicApi';

// ── Brand palette (podium uses gold/silver/bronze; everything else navy + maroon) ─
const NAVY = 'var(--color-primary)';
const MAROON = '#8E244D';

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

// ── Motion helpers ────────────────────────────────────────────────

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function parseTimeToSeconds(t: string): number | null {
  if (!t || t === '—') return null;
  const parts = t.split(':').map((x) => x.trim());
  if (parts.some((x) => x === '' || Number.isNaN(Number(x)))) return null;
  return parts.reduce((acc, p) => acc * 60 + Number(p), 0);
}

function formatSeconds(total: number, hasHours: boolean): string {
  total = Math.max(0, Math.round(total));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hasHours || h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Count-up on a finish time; snaps to the exact source string when done so the
// final displayed value always matches the data.
function useCountUpSeconds(target: number, enabled: boolean, durationMs = 900) {
  const [state, setState] = useState<{ v: number; done: boolean }>(() => ({ v: enabled ? 0 : target, done: !enabled }));
  useEffect(() => {
    if (!enabled) { setState({ v: target, done: true }); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      if (t < 1) { setState({ v: target * eased, done: false }); raf = requestAnimationFrame(tick); }
      else setState({ v: target, done: true });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, durationMs]);
  return state;
}

function CountUpTime({ time, animate, style }: { time: string; animate: boolean; style?: React.CSSProperties }) {
  const reduced = usePrefersReducedMotion();
  const target = parseTimeToSeconds(time);
  const enabled = animate && !reduced && target != null;
  const hasHours = (time.match(/:/g)?.length ?? 0) >= 2;
  const { v, done } = useCountUpSeconds(target ?? 0, enabled);
  const text = !enabled || done || target == null ? time : formatSeconds(v, hasHours);
  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{text}</span>;
}

// ── Confetti (published results only; subtle, brand colours) ───────

const CONFETTI = [
  { l: '6%', t: '18%', w: 7, h: 3, c: NAVY, r: 20, d: '0s' },
  { l: '14%', t: '52%', w: 6, h: 6, c: '#F5C542', r: 0, d: '0.4s' },
  { l: '22%', t: '10%', w: 8, h: 3, c: MAROON, r: -25, d: '0.9s' },
  { l: '31%', t: '40%', w: 5, h: 5, c: '#9CB4D8', r: 0, d: '0.2s' },
  { l: '40%', t: '14%', w: 7, h: 3, c: '#F5C542', r: 35, d: '1.1s' },
  { l: '49%', t: '55%', w: 6, h: 3, c: NAVY, r: -15, d: '0.6s' },
  { l: '58%', t: '12%', w: 5, h: 5, c: MAROON, r: 0, d: '0.3s' },
  { l: '66%', t: '44%', w: 7, h: 3, c: '#9CB4D8', r: 25, d: '1.3s' },
  { l: '74%', t: '20%', w: 6, h: 6, c: '#F5C542', r: 0, d: '0.75s' },
  { l: '82%', t: '50%', w: 8, h: 3, c: NAVY, r: -30, d: '0.5s' },
  { l: '90%', t: '16%', w: 6, h: 3, c: MAROON, r: 15, d: '1.0s' },
  { l: '95%', t: '46%', w: 5, h: 5, c: '#F5C542', r: 0, d: '0.15s' },
] as const;

function Confetti() {
  return (
    <div aria-hidden className="podium-confetti">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-pc"
          style={{ left: c.l, top: c.t, width: c.w, height: c.h, background: c.c, transform: `rotate(${c.r}deg)`, animationDelay: c.d }}
        />
      ))}
    </div>
  );
}

// ── Laurel (SVG so it renders consistently and takes the gold colour) ──

const LAUREL_LEAVES = [
  { x: 9, y: 25, rx: 3.2, ry: 1.7, rot: 38 },
  { x: 7.5, y: 20, rx: 3.2, ry: 1.7, rot: 22 },
  { x: 7.5, y: 15, rx: 3.1, ry: 1.6, rot: 6 },
  { x: 9, y: 10.5, rx: 2.8, ry: 1.5, rot: -12 },
  { x: 11.5, y: 6.5, rx: 2.4, ry: 1.4, rot: -28 },
  { x: 14.5, y: 3.5, rx: 2, ry: 1.2, rot: -42 },
] as const;

function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg width="22" height="30" viewBox="0 0 24 30" aria-hidden style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M11 28 C 6 22, 6 12, 15 3" fill="none" stroke="#C9A227" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      {LAUREL_LEAVES.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill="#C9A227" opacity="0.9" />
      ))}
    </svg>
  );
}

// ── Podium ─────────────────────────────────────────────────────────

// Column layout, left → right: 2nd, 1st (center, elevated), 3rd.
const PODIUM_COLS = [
  {
    place: 2, medal: '🥈', band: 'RUNNER UP', delay: '0.05s',
    bg: 'linear-gradient(165deg,#FCFDFE 0%,#EDF1F4 100%)', ring: '#D8DEE4',
    bandBg: 'linear-gradient(180deg,#C7CDD4,#9AA3AD)', baseH: '42px',
    badgeBg: 'radial-gradient(circle at 35% 28%, #FFFFFF 0%, #D2D8DE 55%, #A9B1BA 100%)',
  },
  {
    place: 1, medal: '🥇', band: 'CHAMPION', delay: '0.18s',
    bg: 'linear-gradient(165deg,#FFFDF4 0%,#FFF2C9 100%)', ring: '#F0D07A',
    bandBg: 'linear-gradient(180deg,#F5C542,#D4A017)', baseH: '58px',
    badgeBg: 'radial-gradient(circle at 35% 28%, #FFFBE6 0%, #F5CE55 55%, #D9A521 100%)',
  },
  {
    place: 3, medal: '🥉', band: 'THIRD PLACE', delay: '0.11s',
    bg: 'linear-gradient(165deg,#FFFAF6 0%,#F6E2D3 100%)', ring: '#E1B08C',
    bandBg: 'linear-gradient(180deg,#CE8E5C,#B87333)', baseH: '32px',
    badgeBg: 'radial-gradient(circle at 35% 28%, #FCE4D2 0%, #D69A6C 55%, #A9662F 100%)',
  },
] as const;

type PodiumCol = (typeof PODIUM_COLS)[number];

function PodiumCard({ p, col, rankBy }: { p: GroupedLeaderboardParticipant; col: PodiumCol; rankBy: string }) {
  const isChampion = col.place === 1;
  const badge = isChampion ? 60 : 46;
  return (
    <div
      className="podium-col podium-rise"
      style={{
        flex: 1,
        maxWidth: isChampion ? '240px' : '200px',
        minWidth: 0,
        alignSelf: 'flex-end',
        animationDelay: col.delay,
      }}
    >
      <div
        className={`podium-card${isChampion ? ' podium-card--champion' : ''}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: col.bg,
          border: `1px solid ${col.ring}`,
          borderRadius: '16px',
          padding: isChampion ? '1.35rem 0.95rem 1.05rem' : '1rem 0.8rem 0.85rem',
          boxShadow: isChampion
            ? '0 20px 44px rgba(212,160,23,0.30), 0 8px 18px rgba(11,28,50,0.16)'
            : '0 8px 18px rgba(11,28,50,0.10)',
          transform: isChampion ? 'translateY(-14px) scale(1.03)' : 'none',
          transformOrigin: 'bottom center',
          textAlign: 'center',
        }}
      >
        {isChampion && <span aria-hidden className="champion-sheen" />}
        <div
          className="medal-badge"
          style={{ width: badge, height: badge, background: col.badgeBg, fontSize: badge * 0.56 }}
        >
          {col.medal}
        </div>
        <div
          title={p.name}
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isChampion ? '1.1rem' : '0.9375rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {p.name}
        </div>
        <div style={{ margin: '0.45rem 0' }}>
          <span style={{ display: 'inline-block', backgroundColor: MAROON, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em', padding: '0.18rem 0.72rem', borderRadius: '9999px', boxShadow: '0 2px 6px rgba(142,36,77,0.28)' }}>
            BIB {p.bib}
          </span>
        </div>
        <CountUpTime
          time={timeOf(p, rankBy)}
          animate
          style={{ display: 'inline-block', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontWeight: 700, fontSize: isChampion ? '1.22rem' : '1rem', color: NAVY, letterSpacing: '0.02em' }}
        />
      </div>
      <div style={{ height: col.baseH, background: col.bandBg, borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: isChampion ? '-2px' : '0.5rem', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.06em', color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.18)', whiteSpace: 'nowrap' }}>{col.band}</span>
      </div>
    </div>
  );
}

// Card podium; renders 1–3 finishers gracefully (empty slots become spacers).
function CardPodium({ participants, rankBy, published }: { participants: GroupedLeaderboardParticipant[]; rankBy: string; published: boolean }) {
  if (participants.length < 1) return null;
  const byPlace = (place: number) => participants[place - 1];
  return (
    <div className="podium-stage">
      {published && <Confetti />}
      <div className="podium-row">
        {PODIUM_COLS.map((col) => {
          const p = byPlace(col.place);
          return p
            ? <PodiumCard key={col.place} p={p} col={col} rankBy={rankBy} />
            : <div key={col.place} className="podium-col" style={{ flex: 1, maxWidth: col.place === 1 ? '240px' : '200px' }} aria-hidden />;
        })}
      </div>
    </div>
  );
}

// "TOP 3 WINNERS" header with laurels + a subtitle reflecting the active view.
function PodiumHeader({ subtitle, published }: { subtitle: string; published: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Laurel />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.05em', color: 'var(--color-text)' }}>TOP 3 WINNERS</span>
        <Laurel flip />
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.14em', color: MAROON, marginTop: '0.35rem' }}>
        {subtitle.toUpperCase()} <span style={{ color: '#D4A017' }}>★</span> RESULTS
      </div>
      {published && (
        <div style={{ marginTop: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: NAVY, color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', padding: '0.42rem 1.05rem', borderRadius: '9999px', boxShadow: '0 6px 16px rgba(11,28,50,0.22)' }}>
            <Trophy size={13} /> OFFICIAL RESULTS
          </span>
        </div>
      )}
    </div>
  );
}

// ── Results table (the "rest" below the podium) ───────────────────

// Subtle medal tint keyed by rank (1/2/3). Ranks 1-3 normally live in the podium,
// so this future-proofs / covers the N≤3 edge without changing any logic.
const ROW_TINT: Record<number, string> = {
  1: 'rgba(212,160,23,0.10)',
  2: 'rgba(154,163,173,0.12)',
  3: 'rgba(184,115,51,0.10)',
};

function ResultTable({ participants, rankBy }: { participants: GroupedLeaderboardParticipant[]; rankBy: string }) {
  if (participants.length === 0) return null;
  const isGunTime = rankBy === 'GunTime';
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';

  return (
    <div className="rt-wrap">
      <table className="rt-table">
        <thead>
          <tr>
            {['#', 'Name', 'BIB', timeLabel].map((h) => (
              <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#fff', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => {
            const hasLink = !!p.participantDetailUrl;
            return (
              <tr
                key={p.participantDetailUrl || i}
                className="rt-row"
                style={ROW_TINT[p.rank] ? { background: ROW_TINT[p.rank] } : undefined}
              >
                <td data-label="#" className="rt-rank">{p.rank}</td>
                <td data-label="Name" className="rt-name">
                  {hasLink ? (
                    <a href={p.participantDetailUrl} className="rt-namelink">
                      {p.name}
                      <ChevronRight size={13} className="rt-chevron" />
                    </a>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{p.name}</span>
                  )}
                </td>
                <td data-label="BIB" className="rt-bib">{p.bib}</td>
                <td data-label={timeLabel}>
                  <span className="rt-pill">{timeOf(p, rankBy)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── One gender column: podium (top 3) + table for the rest ────────

function GenderBlock({ label, participants, rankBy, published }: { label: string; participants: GroupedLeaderboardParticipant[]; rankBy: string; published: boolean }) {
  const podium = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${NAVY}` }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text)' }}>{label}</span>
        {participants.length > 0 && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, color: NAVY, background: 'rgba(27,45,90,0.08)', padding: '0.1rem 0.5rem', borderRadius: '9999px' }}>{participants.length}</span>
        )}
      </div>
      {participants.length === 0 ? (
        <div className="empty-gender">
          <Trophy size={26} style={{ opacity: 0.35 }} />
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>No results yet</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>No {label.toLowerCase()} finishers in this view.</div>
        </div>
      ) : (
        <>
          <CardPodium participants={podium} rankBy={rankBy} published={published} />
          <ResultTable participants={rest} rankBy={rankBy} />
        </>
      )}
    </div>
  );
}

// ── Shimmer skeleton (shown while loading) ────────────────────────

function ResultsSkeleton() {
  return (
    <div className="lb-body" aria-hidden>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {[0, 1].map((g) => (
          <div key={g}>
            <div className="sk sk-shimmer" style={{ height: 20, width: '40%', margin: '0 auto 1.25rem', borderRadius: 6 }} />
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '1rem' }}>
              {[64, 96, 48].map((h, i) => (
                <div key={i} style={{ flex: 1, maxWidth: 200 }}>
                  <div className="sk sk-shimmer" style={{ height: 150, borderRadius: 16 }} />
                  <div className="sk sk-shimmer" style={{ height: h, borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                </div>
              ))}
            </div>
            {[0, 1, 2].map((r) => (
              <div key={r} className="sk sk-shimmer" style={{ height: 40, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Global styles for this page ───────────────────────────────────

const STYLES = `
  .lb-sticky { position: sticky; top: 64px; z-index: 6; }
  .lb-headband { background: ${'var(--color-primary)'}; color: #fff; padding: 0.9rem 1.25rem; border-radius: 10px 10px 0 0; text-align: center; }
  .lb-eventname { font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; }
  .lb-viewname { font-family: var(--font-heading); font-weight: 800; font-size: 1.2rem; }
  .lb-racetitle { font-family: var(--font-body); font-size: 0.85rem; opacity: 0.8; margin-top: 0.1rem; }
  .lb-selectbar { display: flex; justify-content: center; align-items: center; gap: 0.625rem; padding: 0.85rem 1rem; background: var(--color-bg-alt); border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); box-shadow: 0 6px 12px -8px rgba(11,28,50,0.25); }
  .lb-body { border: 1px solid var(--color-border); border-top: none; border-radius: 0 0 12px 12px; padding: 1.75rem 1.5rem; background: #fff; }
  .lb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; align-items: start; }

  @keyframes lb-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .lb-view { animation: lb-fade-in 300ms ease both; }

  .podium-stage { position: relative; overflow: hidden; border-radius: 14px 14px 0 0; padding: 1.75rem 0.5rem 0; background-color: var(--color-bg-alt); background-image: radial-gradient(rgba(27,45,90,0.10) 1.5px, transparent 1.5px), radial-gradient(rgba(142,36,77,0.10) 1.5px, transparent 1.5px); background-size: 22px 22px, 22px 22px; background-position: 0 0, 11px 11px; }
  .podium-row { position: relative; z-index: 1; display: flex; gap: 0.7rem; align-items: flex-end; justify-content: center; }

  @keyframes podium-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
  .podium-rise { animation: podium-rise 520ms cubic-bezier(.2,.7,.3,1) both; }
  .podium-card { transition: box-shadow 220ms ease, transform 220ms ease; }
  .podium-card:hover { box-shadow: 0 14px 30px rgba(11,28,50,0.20); }
  .podium-card--champion:hover { box-shadow: 0 24px 50px rgba(212,160,23,0.36), 0 10px 20px rgba(11,28,50,0.18); }

  .medal-badge { border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.45rem; box-shadow: 0 6px 14px rgba(11,28,50,0.22), inset 0 1px 2px rgba(255,255,255,0.75), inset 0 -3px 6px rgba(0,0,0,0.12); }

  @keyframes champion-shine { 0% { transform: translateX(-120%) rotate(8deg); } 60%, 100% { transform: translateX(220%) rotate(8deg); } }
  .champion-sheen { position: absolute; top: 0; left: 0; width: 45%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent); animation: champion-shine 3.2s ease-in-out 0.6s infinite; pointer-events: none; }

  @keyframes confetti-float { 0% { transform: translateY(0) rotate(0deg); opacity: 0.55; } 50% { transform: translateY(-8px) rotate(18deg); opacity: 0.8; } 100% { transform: translateY(0) rotate(0deg); opacity: 0.55; } }
  .podium-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .confetti-pc { position: absolute; border-radius: 1px; opacity: 0.6; animation: confetti-float 4s ease-in-out infinite; }

  .rt-wrap { border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; margin-top: 0.75rem; }
  .rt-table { width: 100%; border-collapse: collapse; }
  .rt-table thead tr { background: ${'var(--color-primary)'}; }
  .rt-row { border-bottom: 1px solid var(--color-border); transition: background 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
  .rt-row:nth-child(even) { background: rgba(27,45,90,0.02); }
  .rt-row:hover { background: rgba(27,45,90,0.06); box-shadow: 0 2px 10px rgba(11,28,50,0.08); transform: translateY(-1px); }
  .rt-rank { padding: 0.7rem 0.85rem; font-family: var(--font-body); font-weight: 800; font-size: 0.875rem; color: var(--color-text-muted); width: 2.5rem; }
  .rt-name { padding: 0.7rem 0.85rem; }
  .rt-namelink { display: inline-flex; align-items: center; gap: 0.15rem; font-family: var(--font-body); font-weight: 600; font-size: 0.9rem; color: ${'var(--color-primary)'}; text-decoration: none; }
  .rt-namelink:hover { text-decoration: underline; }
  .rt-chevron { opacity: 0; transform: translateX(-3px); transition: opacity 150ms ease, transform 150ms ease; }
  .rt-namelink:hover .rt-chevron { opacity: 1; transform: translateX(0); }
  .rt-bib { padding: 0.7rem 0.85rem; font-family: var(--font-body); font-size: 0.8125rem; color: var(--color-text-muted); }
  .rt-pill { display: inline-block; min-width: 84px; text-align: center; background: ${'var(--color-primary)'}; color: #fff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.02em; padding: 0.22rem 0.7rem; border-radius: 9999px; box-shadow: 0 2px 6px rgba(11,28,50,0.18); }

  .empty-gender { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; padding: 2rem 1rem; border: 1px dashed var(--color-border); border-radius: 12px; background: var(--color-bg-alt); }

  .sk { background: #E9EDF2; }
  @keyframes sk-shimmer { 0% { background-position: -420px 0; } 100% { background-position: 420px 0; } }
  .sk-shimmer { background-image: linear-gradient(90deg, #E9EDF2 0px, #F4F7FA 200px, #E9EDF2 420px); background-size: 840px 100%; animation: sk-shimmer 1.3s linear infinite; }

  @media (max-width: 760px) {
    .lb-grid { grid-template-columns: 1fr; gap: 2rem; }
  }
  @media (max-width: 640px) {
    .rt-table thead { display: none; }
    .rt-table, .rt-table tbody, .rt-table tr, .rt-table td { display: block; width: 100%; }
    .rt-wrap { border: none; }
    .rt-row { border: 1px solid var(--color-border); border-radius: 10px; margin-bottom: 0.6rem; padding: 0.35rem 0.75rem; }
    .rt-row:hover { transform: none; }
    .rt-table td { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.35rem 0; border: none; }
    .rt-table td::before { content: attr(data-label); font-family: var(--font-body); font-weight: 700; font-size: 0.72rem; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-muted); }
    .rt-name { order: -1; }
    .rt-name::before { display: none; }
    .rt-namelink, .rt-name span { font-size: 1rem !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .lb-view, .podium-rise, .champion-sheen, .confetti-pc, .sk-shimmer { animation: none !important; }
    .podium-card, .rt-row, .rt-chevron { transition: none !important; }
  }
`;

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
  const published = data?.resultsPublished === true;

  const raceTitle = data?.raceName
    ? data.raceDistance
      ? `${data.raceName} (${data.raceDistance.toFixed(1)} KM)`
      : data.raceName
    : '';

  return (
    <div>
      <style>{STYLES}</style>

      {/* Sticky context bar — event name + view + category selector stay visible */}
      <div className="lb-sticky">
        <div className="lb-headband">
          {data?.eventName && <div className="lb-eventname">{data.eventName}</div>}
          <div className="lb-viewname">{headingText}</div>
          {raceTitle && <div className="lb-racetitle">{raceTitle}</div>}
        </div>
        {showCategory && categoryOptions.length > 0 && !loading && !error && (
          <div className="lb-selectbar">
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
      </div>

      {error && (
        <div style={{ padding: '2rem', border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 12px 12px', background: '#fff' }}>
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {loading && !error && <ResultsSkeleton />}

      {!loading && !error && (
        <div className="lb-body">
          {!sectionVisible ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              {inCategoryView ? 'Category results are not available for this race.' : 'Overall results are not available for this race.'}
            </div>
          ) : maleList.length === 0 && femaleList.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              No results found.
            </div>
          ) : (
            /* Male + Female ALWAYS both shown, side by side (stacks on mobile) */
            <div className="lb-view" key={selectedCategory || 'overall'}>
              <PodiumHeader subtitle={headingText} published={published} />
              <div className="lb-grid">
                <GenderBlock label="Male" participants={maleList} rankBy={activeRankBy} published={published} />
                <GenderBlock label="Female" participants={femaleList} rankBy={activeRankBy} published={published} />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.75rem', padding: '0.9rem 1rem', backgroundColor: '#F5F7FA', borderRadius: '10px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
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
  // When reached at /results/:eventId the event is fixed by the URL (a tile click);
  // Year/Event pickers are hidden and only the race selector remains.
  const { eventId: eventIdParam } = useParams<{ eventId?: string }>();
  const isEventScoped = !!eventIdParam;

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [eventId, setEventId] = useState(eventIdParam ?? '');
  const [raceId, setRaceId] = useState('');
  const [search, setSearch] = useState('');

  // Keep the scoped event id in sync with the route param.
  useEffect(() => {
    if (eventIdParam) {
      setEventId(eventIdParam);
      setRaceId('');
    }
  }, [eventIdParam]);

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

  // On an event-scoped page, auto-select the race when there's exactly one.
  useEffect(() => {
    if (isEventScoped && !raceId && raceData?.races?.length === 1) {
      setRaceId(raceData.races[0].encryptedRaceId);
    }
  }, [isEventScoped, raceId, raceData]);

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
            {!isEventScoped && (
              <>
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
              </>
            )}
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
                  backgroundColor: '#EFF2F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={44} color="var(--color-primary)" />
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
                  {isEventScoped
                    ? 'Select a race above to view the leaderboard and search for your results.'
                    : 'Select an event and race above to view the leaderboard and search for your results.'}
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
