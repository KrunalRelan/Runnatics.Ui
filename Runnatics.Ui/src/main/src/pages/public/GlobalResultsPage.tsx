import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, Trophy, Share2, Link2, Check } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import ResultsDisclaimer from '../../components/public/shared/ResultsDisclaimer';
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
function useCountUpSeconds(target: number, enabled: boolean, durationMs = 950) {
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

// ── Share (WhatsApp-first; high value for India virality) ─────────

function absoluteUrl(u?: string): string {
  if (!u) return window.location.href;
  if (/^https?:\/\//i.test(u)) return u;
  return window.location.origin + (u.startsWith('/') ? u : '/' + u);
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.9 9.9 0 0 0 5.64 1.74h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.05-.98.24-3.3-.68-2.78-1.1-4.55-3.9-4.68-4.08-.14-.18-1.12-1.5-1.12-2.86 0-1.36.72-2.03.97-2.3.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.6.46.24.55.8 1.9.87 2.04.07.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.9 1.06.94 1.95 1.24 2.23 1.38.28.14.44.12.6-.07.18-.2.7-.8.88-1.08.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.14.44.2.5.32.06.11.06.64-.18 1.32z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#000" aria-hidden>
      <path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L.9 2h7l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.75-1.6 1.5V12h2.7l-.43 2.9h-2.3v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function ShareMenu({ name, rank, total, rankLabel, time, event, detailUrl, tone = 'light' }:
  { name: string; rank: number; total: number; rankLabel: string; time: string; event: string; detailUrl?: string; tone?: 'light' | 'gold' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(detailUrl);
  const rankPart = total > 0 ? ` — ${rankLabel} ${rank} of ${total}` : '';
  const timePart = time && time !== '—' ? ` • ${time}` : '';
  const eventPart = event ? ` • ${event}` : '';
  const text = `🏅 ${name}${rankPart}${timePart}${eventPart}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const go = (u: string) => { window.open(u, '_blank', 'noopener,noreferrer'); setOpen(false); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className={`share-btn share-btn--${tone}`}
        aria-label={`Share ${name}'s result`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Share2 size={14} />
      </button>
      {open && (
        <>
          <div className="share-scrim" onClick={() => setOpen(false)} aria-hidden />
          <div className="share-pop" role="menu">
            <button type="button" className="share-item" role="menuitem" onClick={() => go(wa)}><WhatsAppIcon /> WhatsApp</button>
            <button type="button" className="share-item" role="menuitem" onClick={copy}>{copied ? <Check size={15} color="#16A34A" /> : <Link2 size={15} />} {copied ? 'Copied!' : 'Copy link'}</button>
            <button type="button" className="share-item" role="menuitem" onClick={() => go(tw)}><XIcon /> X</button>
            <button type="button" className="share-item" role="menuitem" onClick={() => go(fb)}><FacebookIcon /> Facebook</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Confetti (published results only; settles once, then rests) ────

const CONFETTI = [
  { l: '6%', t: '20%', w: 7, h: 3, c: NAVY, r: 20, d: '0.05s' },
  { l: '14%', t: '54%', w: 6, h: 6, c: '#F5C542', r: 0, d: '0.35s' },
  { l: '22%', t: '12%', w: 8, h: 3, c: MAROON, r: -25, d: '0.5s' },
  { l: '31%', t: '42%', w: 5, h: 5, c: '#9CB4D8', r: 0, d: '0.2s' },
  { l: '40%', t: '16%', w: 7, h: 3, c: '#F5C542', r: 35, d: '0.6s' },
  { l: '49%', t: '56%', w: 6, h: 3, c: NAVY, r: -15, d: '0.3s' },
  { l: '58%', t: '13%', w: 5, h: 5, c: MAROON, r: 0, d: '0.55s' },
  { l: '66%', t: '46%', w: 7, h: 3, c: '#9CB4D8', r: 25, d: '0.15s' },
  { l: '74%', t: '22%', w: 6, h: 6, c: '#F5C542', r: 0, d: '0.45s' },
  { l: '82%', t: '52%', w: 8, h: 3, c: NAVY, r: -30, d: '0.25s' },
  { l: '90%', t: '18%', w: 6, h: 3, c: MAROON, r: 15, d: '0.4s' },
  { l: '95%', t: '48%', w: 5, h: 5, c: '#F5C542', r: 0, d: '0.1s' },
] as const;

function Confetti() {
  return (
    <div aria-hidden className="podium-confetti">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-pc"
          style={{ left: c.l, top: c.t, width: c.w, height: c.h, background: c.c, ['--r' as string]: `${c.r}deg`, animationDelay: c.d }}
        />
      ))}
    </div>
  );
}

// ── Decorative depth layer behind the podium ──────────────────────

function PodiumBackdrop() {
  return (
    <div aria-hidden className="podium-backdrop">
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <span className="blob blob-c" />
      <svg className="track-motif" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="var(--color-primary)" strokeWidth="1.2" opacity="0.5">
          <ellipse cx="200" cy="150" rx="150" ry="52" />
          <ellipse cx="200" cy="150" rx="120" ry="42" />
          <ellipse cx="200" cy="150" rx="90" ry="32" />
        </g>
      </svg>
    </div>
  );
}

// ── Medal (SVG: ribbon + glossy disc + star) ──────────────────────

const MEDAL_COLORS: Record<number, { light: string; mid: string; dark: string }> = {
  1: { light: '#FFF3C4', mid: '#F5C542', dark: '#C99A16' },
  2: { light: '#FFFFFF', mid: '#D2D8DE', dark: '#9AA3AD' },
  3: { light: '#F3D3BC', mid: '#CE8E5C', dark: '#9E5F2C' },
};

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function Medal({ place, size }: { place: number; size: number }) {
  const c = MEDAL_COLORS[place];
  const gid = `medal-grad-${place}`;
  return (
    <svg width={size} height={size * 1.32} viewBox="0 0 40 53" aria-hidden style={{ display: 'block', filter: 'drop-shadow(0 4px 5px rgba(11,28,50,0.28))' }}>
      <defs>
        <radialGradient id={gid} cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="55%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
      </defs>
      {/* ribbons */}
      <path d="M11 1 L20 21 L14.5 23 L7 3 Z" fill={NAVY} />
      <path d="M29 1 L20 21 L25.5 23 L33 3 Z" fill={MAROON} />
      {/* disc */}
      <circle cx="20" cy="37" r="13.5" fill={`url(#${gid})`} stroke={c.dark} strokeWidth="1" />
      <circle cx="20" cy="37" r="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <polygon points={starPoints(20, 37.5, 6, 2.6)} fill="rgba(255,255,255,0.9)" />
      {/* gloss */}
      <ellipse cx="15.5" cy="31.5" rx="4.5" ry="2.6" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// ── Podium platform (SVG 3D block) ────────────────────────────────

const PLAT: Record<number, { h: number; top: string; front: string; frontDark: string; side: string; delay: string }> = {
  2: { h: 108, top: '#E7ECF0', front: '#C2C9D1', frontDark: '#98A1AB', side: '#8A929C', delay: '0.05s' },
  1: { h: 138, top: '#FFECB0', front: '#F0C33C', frontDark: '#C99A16', side: '#B58611', delay: '0.18s' },
  3: { h: 88, top: '#EBC7AC', front: '#CE8E5C', frontDark: '#A5652F', side: '#95591F', delay: '0.11s' },
};

function PodiumPlatform({ place }: { place: number }) {
  const s = PLAT[place];
  const gid = `plat-${place}`;
  const H = s.h;
  return (
    <svg width="100%" height={H} viewBox={`0 0 128 ${H}`} preserveAspectRatio="xMidYMax meet" style={{ display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.front} />
          <stop offset="100%" stopColor={s.frontDark} />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy={H - 3} rx="58" ry="6" fill="rgba(11,28,50,0.16)" />
      {/* top + right faces for depth */}
      <polygon points={`12,14 27,3 124,3 108,14`} fill={s.top} />
      <polygon points={`108,14 124,3 124,${H - 15} 108,${H - 4}`} fill={s.side} />
      {/* front face */}
      <rect x="12" y="14" width="96" height={H - 18} rx="2" fill={`url(#${gid})`} />
      {/* sheen */}
      <rect x="19" y="19" width="7" height={H - 27} rx="3" fill="rgba(255,255,255,0.16)" />
      {/* place number, embossed */}
      <text x="60" y={14 + (H - 14) / 2 + 11} textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="34" fill="rgba(0,0,0,0.12)">{place}</text>
      <text x="60" y={14 + (H - 14) / 2 + 9} textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="34" fill="rgba(255,255,255,0.92)">{place}</text>
    </svg>
  );
}

// ── Podium ─────────────────────────────────────────────────────────

// Column order, left → right: 2nd, 1st (center, elevated), 3rd.
const PODIUM_ORDER = [2, 1, 3] as const;

const CARD_BG: Record<number, { bg: string; ring: string }> = {
  1: { bg: 'linear-gradient(165deg,#FFFDF4 0%,#FFF2C9 100%)', ring: '#F0D07A' },
  2: { bg: 'linear-gradient(165deg,#FCFDFE 0%,#EDF1F4 100%)', ring: '#D8DEE4' },
  3: { bg: 'linear-gradient(165deg,#FFFAF6 0%,#F6E2D3 100%)', ring: '#E1B08C' },
};

function PodiumColumn({ p, place, rankBy, total, rankLabel, event }:
  { p: GroupedLeaderboardParticipant; place: number; rankBy: string; total: number; rankLabel: string; event: string }) {
  const isChampion = place === 1;
  const card = CARD_BG[place];
  const time = timeOf(p, rankBy);
  return (
    <div className="podium-col podium-rise" style={{ flex: 1, maxWidth: isChampion ? '270px' : '224px', minWidth: 0, alignSelf: 'flex-end', animationDelay: PLAT[place].delay }}>
      <div
        className={`podium-card${isChampion ? ' podium-card--champion' : ''}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: card.bg,
          border: `1px solid ${card.ring}`,
          borderRadius: '16px',
          padding: isChampion ? '2.1rem 1.1rem 1.15rem' : '1.8rem 0.95rem 1rem',
          marginBottom: '-4px',
          boxShadow: isChampion ? '0 20px 44px rgba(212,160,23,0.28), 0 8px 18px rgba(11,28,50,0.16)' : '0 8px 18px rgba(11,28,50,0.10)',
          transform: isChampion ? 'translateY(-14px) scale(1.03)' : 'none',
          transformOrigin: 'bottom center',
          textAlign: 'center',
        }}
      >
        {isChampion && <span aria-hidden className="champion-sheen" />}
        <div style={{ position: 'absolute', top: isChampion ? '-30px' : '-26px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <Medal place={place} size={isChampion ? 46 : 38} />
        </div>
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
          <ShareMenu name={p.name} rank={p.rank} total={total} rankLabel={rankLabel} time={time} event={event} detailUrl={p.participantDetailUrl} tone={isChampion ? 'gold' : 'light'} />
        </div>
        {p.participantDetailUrl ? (
          <a
            href={p.participantDetailUrl}
            title={p.name}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isChampion ? '1.1rem' : '0.9375rem', lineHeight: 1.2, color: 'var(--color-text)', textDecoration: 'none', cursor: 'pointer' }}
          >
            {p.name}
          </a>
        ) : (
          <div
            title={p.name}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isChampion ? '1.1rem' : '0.9375rem', lineHeight: 1.2, color: 'var(--color-text)' }}
          >
            {p.name}
          </div>
        )}
        <div style={{ margin: '0.4rem 0 0.35rem' }}>
          <span style={{ display: 'inline-block', backgroundColor: MAROON, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em', padding: '0.18rem 0.72rem', borderRadius: '9999px', boxShadow: '0 2px 6px rgba(142,36,77,0.28)' }}>
            BIB {p.bib}
          </span>
        </div>
        <CountUpTime time={time} animate style={{ display: 'block', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontWeight: 700, fontSize: isChampion ? '1.22rem' : '1rem', color: NAVY, letterSpacing: '0.02em' }} />
      </div>
      <PodiumPlatform place={place} />
    </div>
  );
}

// Card podium; renders 1–3 finishers gracefully (empty slots become spacers).
function CardPodium({ participants, rankBy, published, total, rankLabel, event }:
  { participants: GroupedLeaderboardParticipant[]; rankBy: string; published: boolean; total: number; rankLabel: string; event: string }) {
  if (participants.length < 1) return null;
  const byPlace = (place: number) => participants[place - 1];
  return (
    <div className="podium-stage">
      <PodiumBackdrop />
      {published && <Confetti />}
      <div className="podium-row">
        {PODIUM_ORDER.map((place) => {
          const p = byPlace(place);
          return p
            ? <PodiumColumn key={place} p={p} place={place} rankBy={rankBy} total={total} rankLabel={rankLabel} event={event} />
            : <div key={place} className="podium-col" style={{ flex: 1, maxWidth: place === 1 ? '270px' : '224px' }} aria-hidden />;
        })}
      </div>
    </div>
  );
}

// "TOP 3 WINNERS" header with laurels + a subtitle reflecting the active view.
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

function PodiumHeader({ subtitle, published }: { subtitle: string; published: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
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

function ResultTable({ participants, rankBy, total, rankLabel, event }:
  { participants: GroupedLeaderboardParticipant[]; rankBy: string; total: number; rankLabel: string; event: string }) {
  if (participants.length === 0) return null;
  const isGunTime = rankBy === 'GunTime';
  const timeLabel = isGunTime ? 'Gun Time' : 'Chip Time';

  return (
    <div className="rt-wrap">
      <table className="rt-table">
        <thead>
          <tr>
            {['#', 'Name', 'BIB', timeLabel, ''].map((h, i) => (
              <th key={i} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#fff', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => {
            const hasLink = !!p.participantDetailUrl;
            const time = timeOf(p, rankBy);
            return (
              <tr key={p.participantDetailUrl || i} className="rt-row" style={ROW_TINT[p.rank] ? { background: ROW_TINT[p.rank] } : undefined}>
                <td data-label="#" className="rt-rank">
                  <span style={{ fontWeight: 800 }}>{p.rank}</span>
                  {total > 0 && <span className="rt-of"> of {total}</span>}
                </td>
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
                  <span className="rt-pill">{time}</span>
                </td>
                <td data-label="Share" className="rt-share">
                  <ShareMenu name={p.name} rank={p.rank} total={total} rankLabel={rankLabel} time={time} event={event} detailUrl={p.participantDetailUrl} />
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

function GenderBlock({ label, participants, rankBy, published, total, rankLabel, event }:
  { label: string; participants: GroupedLeaderboardParticipant[]; rankBy: string; published: boolean; total: number; rankLabel: string; event: string }) {
  const podium = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.75rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${NAVY}` }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text)' }}>{label}</span>
      </div>
      {participants.length === 0 ? (
        <div className="empty-gender">
          <Trophy size={26} style={{ opacity: 0.35 }} />
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>No results yet</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>No {label.toLowerCase()} finishers in this view.</div>
        </div>
      ) : (
        <>
          <CardPodium participants={podium} rankBy={rankBy} published={published} total={total} rankLabel={rankLabel} event={event} />
          <ResultTable participants={rest} rankBy={rankBy} total={total} rankLabel={rankLabel} event={event} />
        </>
      )}
    </div>
  );
}

// ── Shimmer skeleton (shown while loading) ────────────────────────

function ResultsSkeleton() {
  return (
    <div className="lb-body" aria-hidden>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {[0, 1].map((g) => (
          <div key={g}>
            <div className="sk sk-shimmer" style={{ height: 20, width: '40%', margin: '0 auto 1.75rem', borderRadius: 6 }} />
            <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '1rem' }}>
              {[70, 100, 54].map((h, i) => (
                <div key={i} style={{ flex: 1, maxWidth: 224 }}>
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
  .lb-headband { background: var(--color-primary); color: #fff; padding: 0.9rem 1.25rem; border-radius: 10px 10px 0 0; text-align: center; }
  .lb-eventname { font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; }
  .lb-viewname { font-family: var(--font-heading); font-weight: 800; font-size: 1.2rem; }
  .lb-racetitle { font-family: var(--font-body); font-size: 0.85rem; opacity: 0.8; margin-top: 0.1rem; }
  .lb-selectbar { display: flex; justify-content: center; align-items: center; gap: 0.625rem; padding: 0.85rem 1rem; background: var(--color-bg-alt); border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); box-shadow: 0 6px 12px -8px rgba(11,28,50,0.25); }
  .lb-body { border: 1px solid var(--color-border); border-top: none; border-radius: 0 0 12px 12px; padding: 2rem 1.5rem; background: #fff; }
  .lb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; align-items: start; }

  @keyframes lb-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .lb-view { animation: lb-fade-in 320ms ease both; }

  .podium-stage { position: relative; overflow: hidden; border-radius: 16px 16px 0 0; padding: 2.75rem 0.5rem 0; background: linear-gradient(180deg, var(--color-bg-alt), #fff); }
  .podium-row { position: relative; z-index: 2; display: flex; gap: 0.7rem; align-items: flex-end; justify-content: center; }

  .podium-backdrop { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
  .podium-backdrop .blob { position: absolute; border-radius: 50%; filter: blur(42px); opacity: 0.16; }
  .podium-backdrop .blob-a { width: 220px; height: 220px; left: -40px; top: -30px; background: var(--color-primary); }
  .podium-backdrop .blob-b { width: 200px; height: 200px; right: -30px; top: -10px; background: ${MAROON}; }
  .podium-backdrop .blob-c { width: 240px; height: 240px; left: 40%; bottom: -80px; background: #F5C542; opacity: 0.12; }
  .podium-backdrop .track-motif { position: absolute; left: 0; right: 0; bottom: -10px; width: 100%; height: 70%; opacity: 0.06; }

  @keyframes podium-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
  .podium-rise { animation: podium-rise 560ms cubic-bezier(.2,.7,.3,1) both; }
  .podium-card { transition: box-shadow 220ms ease, transform 220ms ease; }
  .podium-card:hover { box-shadow: 0 14px 30px rgba(11,28,50,0.20); }
  .podium-card--champion:hover { box-shadow: 0 24px 50px rgba(212,160,23,0.34), 0 10px 20px rgba(11,28,50,0.18); }

  @keyframes champion-shine { 0% { transform: translateX(-120%) rotate(8deg); } 60%, 100% { transform: translateX(240%) rotate(8deg); } }
  .champion-sheen { position: absolute; top: 0; left: 0; width: 42%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent); animation: champion-shine 3.4s ease-in-out 0.7s infinite; pointer-events: none; }

  @keyframes confetti-settle { 0% { transform: translateY(-46px) rotate(0deg); opacity: 0; } 55% { opacity: 0.72; } 100% { transform: translateY(0) rotate(var(--r, 0deg)); opacity: 0.62; } }
  .podium-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .confetti-pc { position: absolute; border-radius: 1px; opacity: 0.62; animation: confetti-settle 1.15s ease-out both; }

  .share-btn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--color-border); background: #fff; color: var(--color-text-muted); cursor: pointer; transition: color 150ms ease, border-color 150ms ease, background 150ms ease; }
  .share-btn:hover { color: var(--color-primary); border-color: var(--color-primary); }
  .share-btn--gold { background: rgba(255,255,255,0.7); border-color: rgba(201,162,39,0.5); }
  .share-scrim { position: fixed; inset: 0; z-index: 40; }
  .share-pop { position: absolute; top: 30px; right: 0; z-index: 41; background: #fff; border: 1px solid var(--color-border); border-radius: 10px; box-shadow: 0 12px 30px rgba(11,28,50,0.20); padding: 0.3rem; min-width: 150px; display: flex; flex-direction: column; }
  .share-item { display: flex; align-items: center; gap: 0.55rem; padding: 0.5rem 0.65rem; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 0.85rem; font-weight: 600; color: var(--color-text); border-radius: 7px; text-align: left; }
  .share-item:hover { background: var(--color-bg-alt); }

  .rt-wrap { border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; margin-top: 0.75rem; }
  .rt-table { width: 100%; border-collapse: collapse; }
  .rt-table thead tr { background: var(--color-primary); }
  .rt-row { border-bottom: 1px solid var(--color-border); transition: background 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
  .rt-row:nth-child(even) { background: rgba(27,45,90,0.02); }
  .rt-row:hover { background: rgba(27,45,90,0.06); box-shadow: 0 2px 10px rgba(11,28,50,0.08); transform: translateY(-1px); }
  .rt-rank { padding: 0.7rem 0.85rem; font-family: var(--font-body); font-size: 0.9rem; color: var(--color-text); white-space: nowrap; }
  .rt-of { font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600; }
  .rt-name { padding: 0.7rem 0.85rem; }
  .rt-namelink { display: inline-flex; align-items: center; gap: 0.15rem; font-family: var(--font-body); font-weight: 600; font-size: 0.9rem; color: var(--color-primary); text-decoration: none; }
  .rt-namelink:hover { text-decoration: underline; }
  .rt-chevron { opacity: 0; transform: translateX(-3px); transition: opacity 150ms ease, transform 150ms ease; }
  .rt-namelink:hover .rt-chevron { opacity: 1; transform: translateX(0); }
  .rt-bib { padding: 0.7rem 0.85rem; font-family: var(--font-body); font-size: 0.8125rem; color: var(--color-text-muted); }
  .rt-share { padding: 0.4rem 0.6rem; text-align: right; width: 1%; }
  .rt-pill { display: inline-block; min-width: 84px; text-align: center; background: var(--color-primary); color: #fff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.02em; padding: 0.22rem 0.7rem; border-radius: 9999px; box-shadow: 0 2px 6px rgba(11,28,50,0.18); }

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
    .rt-share { text-align: left; width: auto; }
  }

  @media (prefers-reduced-motion: reduce) {
    .lb-view, .podium-rise, .champion-sheen, .confetti-pc, .sk-shimmer { animation: none !important; }
    .podium-card, .rt-row, .rt-chevron, .share-btn { transition: none !important; }
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
  const maleOverallAll = overallResults.filter((p) => (p.gender ?? '').toUpperCase().startsWith('M'));
  const femaleOverallAll = overallResults.filter((p) => (p.gender ?? '').toUpperCase().startsWith('F'));
  const maleOverall = takeRanked(maleOverallAll, overallN);
  const femaleOverall = takeRanked(femaleOverallAll, overallN);

  // Category: MERGE every casing variant of the selected category (case-insensitive) per gender,
  // so a category split across spellings shows all its runners; then cap + renumber.
  const catAll = (genderLabel: string) => {
    const g = genderCategories.find((x) => x.gender.toLowerCase() === genderLabel);
    if (!g) return [];
    return g.categories
      .filter((c) => (c.categoryName ?? '').trim().toLowerCase() === selectedCategory)
      .flatMap((c) => c.participants ?? [])
      .sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999));
  };
  const maleCatAll = inCategoryView ? catAll('male') : [];
  const femaleCatAll = inCategoryView ? catAll('female') : [];
  const maleCat = takeRanked(maleCatAll, categoryN);
  const femaleCat = takeRanked(femaleCatAll, categoryN);

  const maleList = inCategoryView ? maleCat : maleOverall;
  const femaleList = inCategoryView ? femaleCat : femaleOverall;
  // Totals (Y in "X of Y") — full uncapped finisher counts per gender/view. Display only.
  const maleTotal = inCategoryView ? maleCatAll.length : maleOverallAll.length;
  const femaleTotal = inCategoryView ? femaleCatAll.length : femaleOverallAll.length;
  const rankLabel = inCategoryView ? 'Category Rank' : 'Gender Rank';
  const activeRankBy = inCategoryView ? categoryRankBy : overallRankBy;
  const sectionVisible = inCategoryView ? showCategory : showOverall;
  const headingText = inCategoryView ? selectedLabel : 'Overall';
  const published = data?.resultsPublished === true;

  const raceTitle = data?.raceName
    ? data.raceDistance
      ? `${data.raceName} (${data.raceDistance.toFixed(1)} KM)`
      : data.raceName
    : '';
  const shareEvent = [data?.eventName, data?.raceName].filter(Boolean).join(' • ');

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
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>View Leaderboard</span>
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
                <GenderBlock label="Male" participants={maleList} rankBy={activeRankBy} published={published} total={maleTotal} rankLabel={rankLabel} event={shareEvent} />
                <GenderBlock label="Female" participants={femaleList} rankBy={activeRankBy} published={published} total={femaleTotal} rankLabel={rankLabel} event={shareEvent} />
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
            <>
              <LeaderboardView
                eventId={eventId}
                raceId={raceId}
                search={search}
              />
              <ResultsDisclaimer />
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

export default GlobalResultsPage;
