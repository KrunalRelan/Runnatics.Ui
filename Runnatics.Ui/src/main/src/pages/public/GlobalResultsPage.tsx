import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, Trophy, Share2, Link2, Check, User } from 'lucide-react';
import { Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import ResultsDisclaimer from '../../components/public/shared/ResultsDisclaimer';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';
import type { GroupedLeaderboardParticipant, GroupedLeaderboardResponse } from '../../../../api/publicApi';

// ── Brand palette (podium uses gold/silver/bronze; everything else navy) ─
const NAVY = 'var(--color-primary)';

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

// Multi-colour party palette, matching the reference art — the brand navy/maroon
// alone read as corporate wallpaper rather than celebration.
const C_RED = '#E4322B';
const C_BLUE = '#2F6FE4';
const C_YELLOW = '#F5C542';
const C_GREEN = '#34A853';
const C_PURPLE = '#8B5CF6';
const C_PINK = '#EC4899';

// Denser toward the TOP of the stage, thinning out lower down, so it reads as
// falling celebration rather than an even wallpaper.
const CONFETTI = [
  { l: '4%',  t: '6%',  w: 7, h: 3, c: C_BLUE,   r: 20,  d: '0.05s' },
  { l: '11%', t: '14%', w: 6, h: 6, c: C_YELLOW, r: 0,   d: '0.35s' },
  { l: '18%', t: '4%',  w: 8, h: 3, c: C_RED,    r: -25, d: '0.50s' },
  { l: '24%', t: '19%', w: 5, h: 5, c: C_GREEN,  r: 0,   d: '0.20s' },
  { l: '31%', t: '8%',  w: 7, h: 3, c: C_PURPLE, r: 35,  d: '0.60s' },
  { l: '38%', t: '16%', w: 6, h: 3, c: C_YELLOW, r: -15, d: '0.30s' },
  { l: '45%', t: '5%',  w: 5, h: 5, c: C_PINK,   r: 0,   d: '0.55s' },
  { l: '52%', t: '13%', w: 7, h: 3, c: C_BLUE,   r: 25,  d: '0.15s' },
  { l: '59%', t: '7%',  w: 6, h: 6, c: C_RED,    r: 0,   d: '0.45s' },
  { l: '66%', t: '17%', w: 8, h: 3, c: C_GREEN,  r: -30, d: '0.25s' },
  { l: '73%', t: '5%',  w: 6, h: 3, c: C_YELLOW, r: 15,  d: '0.40s' },
  { l: '80%', t: '15%', w: 5, h: 5, c: C_PURPLE, r: 0,   d: '0.10s' },
  { l: '87%', t: '9%',  w: 7, h: 3, c: C_BLUE,   r: -20, d: '0.32s' },
  { l: '94%', t: '18%', w: 6, h: 3, c: C_RED,    r: 28,  d: '0.48s' },
  // sparser lower band
  { l: '8%',  t: '38%', w: 5, h: 5, c: C_YELLOW, r: 0,   d: '0.22s' },
  { l: '29%', t: '44%', w: 6, h: 3, c: C_PINK,   r: 18,  d: '0.52s' },
  { l: '55%', t: '41%', w: 5, h: 5, c: C_GREEN,  r: 0,   d: '0.18s' },
  { l: '78%', t: '46%', w: 6, h: 3, c: C_BLUE,   r: -22, d: '0.38s' },
  { l: '92%', t: '39%', w: 5, h: 5, c: C_RED,    r: 0,   d: '0.28s' },
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

// ── Rank metals ───────────────────────────────────────────────────
// One source for every metallic surface: the card frame, the medal disc, the
// footer band and the avatar fill all key off the same entry, so a rank can
// never render gold in one place and bronze in another.

interface Metal {
  /** Card frame / footer band gradient — must read as metal, not flat colour. */
  frame: string;
  light: string;
  mid: string;
  dark: string;
  /** Avatar fill (light metal) — initials sit on this in dark navy. */
  avatarFill: string;
  ring: string;
  /** Text colour that clears AA on the footer band. */
  bandText: string;
  bandLabel: string;
  bandIcon: string;
}

const METAL: Record<number, Metal> = {
  1: {
    frame: 'linear-gradient(135deg,#D4A017 0%,#F0C24B 38%,#D4A017 62%,#B8860B 100%)',
    light: '#FFF3C4', mid: '#F0C24B', dark: '#B8860B',
    avatarFill: 'linear-gradient(160deg,#FFF3C4 0%,#F0C24B 100%)',
    ring: '#B8860B',
    bandText: '#3B2A00', bandLabel: 'CHAMPION', bandIcon: '🏆',
  },
  2: {
    frame: 'linear-gradient(135deg,#A8A8A8 0%,#D8D8D8 38%,#A8A8A8 62%,#8C8C8C 100%)',
    light: '#FFFFFF', mid: '#D8D8D8', dark: '#8C8C8C',
    avatarFill: 'linear-gradient(160deg,#FFFFFF 0%,#D8D8D8 100%)',
    ring: '#8C8C8C',
    bandText: '#2B2B2B', bandLabel: 'RUNNER UP', bandIcon: '🎖',
  },
  3: {
    frame: 'linear-gradient(135deg,#A0672F 0%,#C88A4A 38%,#A0672F 62%,#8A5526 100%)',
    light: '#F3D3BC', mid: '#C88A4A', dark: '#8A5526',
    avatarFill: 'linear-gradient(160deg,#F3D3BC 0%,#C88A4A 100%)',
    ring: '#8A5526',
    bandText: '#FFFFFF', bandLabel: 'THIRD PLACE', bandIcon: '⭐',
  },
};

const RED = '#C8102E';
const BASE_NAVY = '#1B2D5A';

// ── Ornate medal: laurel disc + red ribbon tail ───────────────────
// Rendered so the DISC sits half above the card's top edge and the ribbon tail
// hangs down over the frame.

function laurelLeaf(cx: number, cy: number, rot: number, key: string) {
  return <ellipse key={key} cx={cx} cy={cy} rx={5.2} ry={2.6} transform={`rotate(${rot} ${cx} ${cy})`} fill="rgba(255,255,255,0.55)" />;
}

function OrnateMedal({ place }: { place: number }) {
  const m = METAL[place];
  const gid = `medal-${place}`;
  const rid = `medalring-${place}`;
  // viewBox 100x150: disc centred at (50,48) r=46, ribbon tails below.
  // Size comes from CSS (.podium-medal svg) so it scales with the clamp() vars.
  return (
    <svg viewBox="0 0 100 150" aria-hidden>
      <defs>
        <radialGradient id={gid} cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor={m.light} />
          <stop offset="55%" stopColor={m.mid} />
          <stop offset="100%" stopColor={m.dark} />
        </radialGradient>
        <linearGradient id={rid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0142F" />
          <stop offset="100%" stopColor="#960B22" />
        </linearGradient>
      </defs>

      {/* RED ribbon tails, drawn first so the disc overlaps them */}
      <path d="M34 70 L26 142 L42 132 L50 96 Z" fill={`url(#${rid})`} />
      <path d="M66 70 L74 142 L58 132 L50 96 Z" fill={`url(#${rid})`} />
      <path d="M34 70 L50 96 L42 132 L38 96 Z" fill="rgba(0,0,0,0.14)" />

      {/* disc */}
      <circle cx="50" cy="48" r="46" fill={`url(#${gid})`} stroke={m.dark} strokeWidth="2.5" />
      <circle cx="50" cy="48" r="37" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />

      {/* laurel-wreath detail flanking the numeral */}
      <path d="M28 66 C 18 54, 20 36, 32 26" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 66 C 82 54, 80 36, 68 26" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      {[
        [24, 58, 40], [22, 48, 18], [24, 38, 0], [29, 29, -22],
      ].map(([x, y, r], i) => laurelLeaf(x, y, r, `l${i}`))}
      {[
        [76, 58, -40], [78, 48, -18], [76, 38, 0], [71, 29, 22],
      ].map(([x, y, r], i) => laurelLeaf(x, y, r, `r${i}`))}

      {/* rank numeral, embossed */}
      <text x="50" y="64" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="42" fill="rgba(0,0,0,0.22)">{place}</text>
      <text x="50" y="62" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="42" fill="#FFFFFF">{place}</text>

      {/* gloss */}
      <ellipse cx="36" cy="30" rx="14" ry="8" fill="rgba(255,255,255,0.42)" transform="rotate(-24 36 30)" />
    </svg>
  );
}

// ── Initials avatar (we hold no runner photos, so the circle carries initials) ──

// First letter of the first name + first letter of the last name, uppercased.
// Single-word name → one letter. Empty/blank → '' (caller renders a neutral glyph).
// Array.from() splits by CODE POINT, so surrogate pairs and combining scripts are never
// cut in half the way name[0] would; toLocaleUpperCase respects locale-specific casing.
function initialsOf(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const firstCodePoint = (s: string) => Array.from(s)[0] ?? '';
  const letters =
    parts.length === 1
      ? firstCodePoint(parts[0])
      : firstCodePoint(parts[0]) + firstCodePoint(parts[parts.length - 1]);
  return letters.toLocaleUpperCase();
}

// Light rank-tinted fill with DARK navy initials — the reverse of white-on-metal,
// which can't clear contrast on a light gold at any weight.
function InitialsAvatar({ name, place }: { name: string; place: number }) {
  const m = METAL[place];
  const initials = initialsOf(name);
  return (
    <div aria-hidden className="podium-avatar" style={{ background: m.avatarFill, borderColor: m.ring }}>
      {initials || <User size={34} strokeWidth={2.2} color={BASE_NAVY} />}
    </div>
  );
}

// ── Podium ─────────────────────────────────────────────────────────

// Column order, left → right: 2nd, 1st (centre, elevated), 3rd.
const PODIUM_ORDER = [2, 1, 3] as const;

function PodiumColumn({ p, place, rankBy, total, rankLabel, event }:
  { p: GroupedLeaderboardParticipant; place: number; rankBy: string; total: number; rankLabel: string; event: string }) {
  const isChampion = place === 1;
  const m = METAL[place];
  const time = timeOf(p, rankBy);

  return (
    <div className={`podium-col podium-rise${isChampion ? ' podium-col--champion' : ''}`}>
      {/* Thick metallic FRAME; the white panel lives inside it. overflow stays
          visible so the medal can hang above the top edge. */}
      <div className="podium-frame" style={{ background: m.frame }}>
        <div className="podium-medal">
          <OrnateMedal place={place} />
        </div>

        {/* Share sits on the FRAME, not inside the panel: the panel clips to its
            rounded corners (overflow:hidden) and would swallow the popup menu. */}
        <div className="podium-share">
          <ShareMenu name={p.name} rank={p.rank} total={total} rankLabel={rankLabel} time={time} event={event} detailUrl={p.participantDetailUrl} tone={isChampion ? 'gold' : 'light'} />
        </div>

        <div className="podium-panel">
          <InitialsAvatar name={p.name} place={place} />

          {p.participantDetailUrl ? (
            <a href={p.participantDetailUrl} title={p.name} className="podium-name">{p.name}</a>
          ) : (
            <div title={p.name} className="podium-name">{p.name}</div>
          )}

          <div className="podium-caplabel">BIB NO.</div>
          <div className="podium-bib">{p.bib}</div>

          <div className="podium-divider" />

          <div className="podium-caplabel">FINISHED TIME</div>
          <div className="podium-time">
            <CountUpTime time={time} animate />
          </div>

          {/* Footer band — full width at the panel's bottom */}
          <div className="podium-band" style={{ background: m.frame, color: m.bandText }}>
            <span aria-hidden>{m.bandIcon}</span> {m.bandLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3D podium base ────────────────────────────────────────────────
// Matches the reference art: one WIDE flat-bottomed drum spanning past the
// cards, a second raised pedestal under the champion, the thin red accent
// line near the BOTTOM of the drum, and the status pill riding over it.
// The cards stand ON the top face (the row overlaps the base via negative
// margin), not floating above it.

function PodiumBase() {
  return (
    <div className="podium-base">
      <svg viewBox="0 0 900 150" preserveAspectRatio="none" aria-hidden className="podium-base-svg">
        {/* main drum — full stage width, flat bottom (runs off the stage edge) */}
        <rect x="0" y="70" width="900" height="80" fill={BASE_NAVY} />
        <ellipse cx="450" cy="70" rx="450" ry="26" fill="#24406F" />
        <ellipse cx="450" cy="70" rx="450" ry="26" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />

        {/* thin RED accent line near the bottom of the drum */}
        <rect x="0" y="120" width="900" height="6" fill={RED} />

        {/* centre pedestal — the raised second tier the champion stands on */}
        <rect x="283" y="18" width="334" height="62" fill={BASE_NAVY} />
        <ellipse cx="450" cy="18" rx="167" ry="13" fill="#24406F" />
        <ellipse cx="450" cy="18" rx="167" ry="13" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {/* soft shadow where the pedestal meets the drum */}
        <ellipse cx="450" cy="80" rx="185" ry="10" fill="rgba(0,0,0,0.18)" />
      </svg>
    </div>
  );
}

// ── Gender tab (segmented pill) ───────────────────────────────────
// Replaces the side-by-side dual podium: one gender's podium + table at a time.

type Gender = 'male' | 'female';
const GENDER_TABS: { key: Gender; label: string; glyph: string }[] = [
  { key: 'male', label: 'Male', glyph: '♂' },
  { key: 'female', label: 'Female', glyph: '♀' },
];

function GenderTabs({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  // Left/Right arrows move between tabs, per the tablist pattern.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = GENDER_TABS.findIndex((t) => t.key === value);
    const next = e.key === 'ArrowRight' ? (i + 1) % GENDER_TABS.length : (i - 1 + GENDER_TABS.length) % GENDER_TABS.length;
    onChange(GENDER_TABS[next].key);
  };

  return (
    <div className="gt-wrap" role="tablist" aria-label="Result gender" onKeyDown={onKeyDown}>
      {GENDER_TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            type="button"
            key={t.key}
            role="tab"
            id={`gt-tab-${t.key}`}
            aria-selected={active}
            aria-controls={`gt-panel-${t.key}`}
            tabIndex={active ? 0 : -1}
            className={`gt-tab${active ? ' gt-tab--active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <span className="gt-glyph" aria-hidden>{t.glyph}</span>
            {t.label}
          </button>
        );
      })}
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
      {published && <Confetti />}
      <div className="podium-row">
        {PODIUM_ORDER.map((place) => {
          const p = byPlace(place);
          return p
            ? <PodiumColumn key={place} p={p} place={place} rankBy={rankBy} total={total} rankLabel={rankLabel} event={event} />
            : <div key={place} className={`podium-col${place === 1 ? ' podium-col--champion' : ''}`} aria-hidden />;
        })}
      </div>
      <PodiumBase />
      {/* Direct child of the stage (NOT inside the base) so it can paint above
          the cards; same publish gate as the confetti. */}
      {published && (
        <div className="podium-badge">
          <span className="podium-badge-dot" aria-hidden />
          Provisional Results
        </div>
      )}
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
    <svg className="podium-laurel" width="30" height="40" viewBox="0 0 24 30" aria-hidden style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M11 28 C 6 22, 6 12, 15 3" fill="none" stroke="#C9A227" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
      {LAUREL_LEAVES.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill="#C9A227" opacity="0.95" />
      ))}
    </svg>
  );
}

// The PROVISIONAL RESULTS badge lives on the podium BASE, not here. The gender
// tab sits directly beneath the subtitle.
function PodiumHeader({ subtitle, gender, onGenderChange }:
  { subtitle: string; gender: Gender; onGenderChange: (g: Gender) => void }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
        <Laurel />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.35rem, 3.2vw, 1.9rem)', letterSpacing: '0.05em', color: NAVY, textTransform: 'uppercase' }}>
          Top 3 Winners
        </span>
        <Laurel flip />
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.18em', color: NAVY, marginTop: '0.4rem', textTransform: 'uppercase' }}>
        {subtitle} <span style={{ color: '#D4A017' }}>★</span> Results
      </div>
      <GenderTabs value={gender} onChange={onGenderChange} />
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
                {/* Rank only — the field total ("4 of 95") is deliberately NOT shown on
                    the results landing page; it belongs on the participant's own page. */}
                <td data-label="#" className="rt-rank">
                  <span style={{ fontWeight: 800 }}>{p.rank}</span>
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

// ── The active gender's block: podium (top 3) + table for the rest ─
// One at a time — the tab above names it, so the block carries no heading.

function GenderBlock({ label, participants, rankBy, published, total, rankLabel, event }:
  { label: string; participants: GroupedLeaderboardParticipant[]; rankBy: string; published: boolean; total: number; rankLabel: string; event: string }) {
  const podium = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div>
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

// One column — the tabbed layout shows a single gender at a time.
function ResultsSkeleton() {
  return (
    <div className="lb-body" aria-hidden>
      <div className="sk sk-shimmer" style={{ height: 26, width: 260, margin: '0 auto 0.75rem', borderRadius: 6 }} />
      <div className="sk sk-shimmer" style={{ height: 44, width: 330, margin: '0 auto 2rem', borderRadius: 12 }} />
      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '1.5rem', maxWidth: 760, marginInline: 'auto' }}>
        {[[236, 260], [252, 300], [236, 260]].map(([w, h], i) => (
          <div key={i} style={{ flex: 1, maxWidth: w, marginBottom: i === 1 ? 24 : 0 }}>
            <div className="sk sk-shimmer" style={{ height: h, borderRadius: 16 }} />
          </div>
        ))}
      </div>
      {[0, 1, 2, 3].map((r) => (
        <div key={r} className="sk sk-shimmer" style={{ height: 40, borderRadius: 8, marginBottom: 8 }} />
      ))}
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
  .lb-selectbar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.625rem; padding: 0.85rem 1rem; background: var(--color-bg-alt); border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); box-shadow: 0 6px 12px -8px rgba(11,28,50,0.25); }
  .lb-body { border: 1px solid var(--color-border); border-top: none; border-radius: 0 0 12px 12px; padding: 2rem 1.5rem; background: #fff; }

  @keyframes lb-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .lb-view { animation: lb-fade-in 320ms ease both; }

  /* ── Gender tab: segmented pill, navy active / white inactive ─── */
  .gt-wrap {
    display: inline-flex; margin-top: 1.15rem;
    background: #fff; border: 1.5px solid ${BASE_NAVY};
    border-radius: 12px; padding: 4px; gap: 4px;
    box-shadow: 0 4px 14px rgba(11,28,50,0.12);
  }
  .gt-tab {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    min-width: 150px; padding: 0.7rem 1.6rem;
    border: none; border-radius: 8px; background: transparent; cursor: pointer;
    font-family: var(--font-heading); font-weight: 800;
    font-size: 0.9375rem; letter-spacing: 0.09em; text-transform: uppercase;
    color: ${BASE_NAVY};
    transition: background 180ms ease, color 180ms ease;
  }
  .gt-tab:hover:not(.gt-tab--active) { background: rgba(27,45,90,0.07); }
  .gt-tab:focus-visible { outline: 2px solid ${RED}; outline-offset: 2px; }
  .gt-tab--active { background: ${BASE_NAVY}; color: #fff; cursor: default; }
  .gt-glyph { font-size: 1.05em; line-height: 1; }

  /* ── Podium stage ─────────────────────────────────────────────
     Every size is a clamp()-driven custom property: the whole podium scales
     proportionally with the viewport instead of breaking at fixed px sizes.
     Three across at EVERY width (grid, min-width:0), total height capped so
     the results table stays above the fold on a 1080p screen. */
  .podium-stage {
    /* The height budget (the hard cap) DRIVES every element size: each var
       interpolates linearly from its 320px minimum to its desktop maximum as
       the budget goes 240px → 400px. That keeps the natural content height
       under the cap at EVERY width — independent vw slopes don't. */
    --budget: clamp(240px, 42vw, 400px);
    --medal: calc(40px + (var(--budget) - 240px) * 0.30);   /* 40 → 88px */
    --avatar: calc(40px + (var(--budget) - 240px) * 0.30);  /* 40 → 88px */
    --name: calc(0.65rem + (var(--budget) - 240px) * 0.04);      /* → 1.05rem */
    --bibfs: calc(0.6rem + (var(--budget) - 240px) * 0.0275);    /* → 0.875rem */
    --time: calc(0.7rem + (var(--budget) - 240px) * 0.065);      /* → 1.35rem */
    --bandfs: calc(0.5rem + (var(--budget) - 240px) * 0.025);    /* → 0.75rem */
    --caplabel: calc(0.45rem + (var(--budget) - 240px) * 0.015); /* → 0.6rem */
    --pad: calc(6px + (var(--budget) - 240px) * 0.0875);    /* 6 → 20px */
    --frame: calc(4px + (var(--budget) - 240px) * 0.025);   /* 4 → 8px */
    --champ-lift: calc(8px + (var(--budget) - 240px) * 0.0375); /* 8 → 14px */
    --baseh: calc(40px + (var(--budget) - 240px) * 0.15);   /* 40 → 64px */
    --radius: clamp(8px, 1.5vw, 16px);
    position: relative;
    max-height: var(--budget);
    border-radius: 16px 16px 0 0;
    /* headroom for the champion medal hanging above the card top */
    padding: calc(var(--medal) * 0.6) clamp(4px, 1vw, 12px) 0;
    background: linear-gradient(180deg, #FBFCFE 0%, #FFFFFF 100%);
  }
  /* THREE ACROSS AT EVERY BREAKPOINT — grid never wraps or scrolls.
     align-items:end so 2nd and 3rd sit LOW while the champion is lifted. */
  .podium-row {
    position: relative; z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: end;
    gap: clamp(4px, 1vw, 16px);
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
  }

  /* min-width:0 is what lets a grid child SHRINK instead of overflowing */
  .podium-col { min-width: 0; display: flex; }
  .podium-col--champion { margin-bottom: var(--champ-lift); }

  /* Thick metallic frame; overflow visible so the medal can hang above it */
  .podium-frame {
    position: relative;
    width: 100%;
    min-width: 0;
    padding: var(--frame);
    border-radius: var(--radius);
    box-shadow: 0 14px 30px rgba(11,28,50,0.18);
    display: flex;
  }
  .podium-col--champion .podium-frame { box-shadow: 0 22px 46px rgba(212,160,23,0.30), 0 10px 22px rgba(11,28,50,0.18); }

  /* White panel inside the frame. NO overflow:hidden here — content must never
     be clipped; decoration layers do their own clipping. */
  .podium-panel {
    position: relative;
    flex: 1;
    min-width: 0;
    background: #FFFFFF;
    border-radius: calc(var(--radius) / 2);
    padding: calc(var(--medal) * 0.3) var(--pad) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  /* Champion card reads slightly taller: extra headroom under its bigger medal */
  .podium-col--champion .podium-panel { padding-top: calc(var(--medal) * 0.38); }

  /* Medal: disc overlaps the card's top edge, horizontally centred */
  .podium-medal { position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); z-index: 3; pointer-events: none; }
  .podium-medal svg { display: block; width: var(--medal); height: calc(var(--medal) * 1.5); filter: drop-shadow(0 6px 10px rgba(11,28,50,0.32)); }
  .podium-col--champion .podium-medal svg { width: calc(var(--medal) * 1.05); height: calc(var(--medal) * 1.575); }
  /* On the frame (not the panel) so the popup isn't clipped */
  .podium-share { position: absolute; top: calc(var(--frame) + 0.35rem); right: calc(var(--frame) + 0.35rem); z-index: 5; }

  .podium-avatar {
    width: var(--avatar); height: var(--avatar);
    border-radius: 50%;
    border: calc(2px + (var(--budget) - 240px) * 0.0125) solid;
    box-shadow: 0 4px 12px rgba(11,28,50,0.18), inset 0 2px 0 rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    color: #1B2D5A;
    font-family: var(--font-heading); font-weight: 800;
    font-size: calc(var(--avatar) * 0.38);
    line-height: 1; letter-spacing: 0.02em; user-select: none;
    margin-bottom: clamp(3px, 0.7vw, 5px); flex-shrink: 0;
  }
  .podium-avatar > svg { width: calc(var(--avatar) * 0.42); height: calc(var(--avatar) * 0.42); }

  /* Names wrap INSIDE the card (never widen it), capped at two lines;
     the title attribute carries the full name. */
  .podium-name {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
    font-family: var(--font-heading); font-weight: 800;
    font-size: var(--name); line-height: 1.2;
    color: #1B2D5A; text-transform: uppercase; letter-spacing: 0.01em;
    text-decoration: none;
    overflow-wrap: break-word; word-break: break-word; hyphens: auto;
    margin-bottom: clamp(3px, 0.7vw, 5px);
  }
  a.podium-name:hover { text-decoration: underline; }

  .podium-caplabel {
    font-family: var(--font-body); font-weight: 700;
    font-size: var(--caplabel); letter-spacing: 0.12em; text-transform: uppercase;
    color: #8A94A6; margin-bottom: clamp(2px, 0.5vw, 4px);
  }
  .podium-bib {
    display: inline-block; background: #C8102E; color: #fff;
    font-family: var(--font-body); font-weight: 800; font-size: var(--bibfs);
    letter-spacing: 0.03em; padding: clamp(2px, 0.5vw, 5px) clamp(8px, 2vw, 17px); border-radius: 9999px;
    box-shadow: 0 3px 8px rgba(200,16,46,0.32); margin-bottom: clamp(3px, 0.9vw, 7px);
    overflow-wrap: anywhere; max-width: 100%;
  }
  .podium-divider { width: 72%; height: 1px; background: #E3E8EF; margin: 0 auto clamp(3px, 0.9vw, 7px); }

  /* Digital-style hero time — the card's visual anchor */
  .podium-time {
    font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace;
    font-weight: 700; font-size: var(--time); color: #1B2D5A;
    letter-spacing: 0.06em; font-variant-numeric: tabular-nums;
    white-space: nowrap;
    line-height: 1.1; margin-bottom: clamp(4px, 1vw, 8px); max-width: 100%;
  }

  /* Footer band pinned to the panel's bottom, full width; carries its own
     bottom radius now that the panel no longer clips */
  .podium-band {
    margin-top: auto;
    width: calc(100% + 2 * var(--pad));
    margin-left: calc(-1 * var(--pad)); margin-right: calc(-1 * var(--pad));
    padding: clamp(4px, 0.8vw, 8px) 0.4rem;
    border-radius: 0 0 calc(var(--radius) / 2) calc(var(--radius) / 2);
    font-family: var(--font-heading); font-weight: 800;
    font-size: var(--bandfs); letter-spacing: 0.12em;
    display: flex; align-items: center; justify-content: center; gap: 0.35rem;
    white-space: nowrap;
  }

  /* ── 3D navy base (pure decoration + status badge) ──────────────
     margin-top tucks the drum UP under the cards so they stand on its top
     face; negative inline margins stretch it wider than the card row. */
  .podium-base { position: relative; margin-top: calc(var(--baseh) * -0.97); margin-inline: clamp(-12px, -1vw, -4px); z-index: 1; pointer-events: none; }
  .podium-base-svg { display: block; width: 100%; height: var(--baseh); }

  /* Status pill riding over the red accent line at the drum's bottom;
     z-index above the card row so the champion card can't hide it */
  .podium-badge {
    position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); z-index: 4;
    display: inline-flex; align-items: center; gap: 0.45rem;
    white-space: nowrap;
    background: #fff; color: ${BASE_NAVY};
    border-radius: 9999px; padding: 0.4rem 1.1rem;
    font-family: var(--font-body); font-weight: 800;
    font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;
    box-shadow: 0 4px 12px rgba(0,0,0,0.28);
  }
  .podium-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: ${RED}; flex-shrink: 0; }

  @keyframes podium-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
  .podium-rise { animation: podium-rise 560ms cubic-bezier(.2,.7,.3,1) both; }
  .podium-frame { transition: box-shadow 220ms ease, transform 220ms ease; }
  .podium-col:hover .podium-frame { transform: translateY(-3px); }

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

  /* Below sm: decoration (confetti, laurels, navy base drum) disappears —
     the three cards keep ALL their fields and stay three across. The
     Provisional Results badge is information, not decoration: it drops into
     normal flow, centred under the cards. */
  @media (max-width: 639px) {
    .podium-confetti { display: none; }
    .podium-base-svg { display: none; }
    .podium-laurel { display: none; }
    .podium-base { margin-top: 0; margin-inline: 0; }
    /* In flow below the cards (the drum it rides on is hidden here) */
    .podium-badge { position: static; transform: none; display: table; margin: 0.2rem auto 0; font-size: 0.58rem; letter-spacing: 0.1em; padding: 0.2rem 0.7rem; box-shadow: 0 2px 8px rgba(0,0,0,0.18); border: 1px solid var(--color-border); }
    .podium-caplabel { letter-spacing: 0.08em; }
    /* Tab must never overflow the viewport — it shrinks rather than clipping */
    .gt-wrap { display: flex; width: 100%; max-width: 380px; margin-inline: auto; }
    .gt-tab { flex: 1 1 0; min-width: 0; padding: 0.6rem 0.5rem; font-size: 0.8125rem; letter-spacing: 0.05em; }
  }
  @media (max-width: 400px) {
    .gt-tab { font-size: 0.75rem; gap: 0.3rem; }
    .podium-band { letter-spacing: 0.03em; gap: 0.2rem; }
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
    .lb-view, .podium-rise, .confetti-pc, .sk-shimmer { animation: none !important; }
    .podium-frame, .rt-row, .rt-chevron, .share-btn { transition: none !important; }
    .podium-col:hover .podium-frame { transform: none; }
  }
`;

// ── Leaderboard view (rendered once event + race selected) ─────────

function LeaderboardView({ eventId, raceId, search }: { eventId: string; raceId: string; search: string }) {
  const debouncedSearch = useDebounce(search, 350);
  const searchTerm = debouncedSearch.trim();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  // The leaderboard itself is ALWAYS unfiltered: the podium and the table below
  // never change while a search is active (matches render in the panel under the
  // search box instead), and clearing the search needs no refetch.
  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.getGroupedLeaderboard(
        eventId,
        raceId,
        // showAll:true → full lists so we can cap PER GENDER client-side.
        { showAll: true },
        signal,
      ),
    [eventId, raceId],
  );

  // Search matches for the panel under the search box. A SEPARATE hook instance:
  // its state can never clobber the leaderboard's, and usePublicApi aborts the
  // previous in-flight request (and refuses aborted setState) whenever the term
  // changes — a slow older response cannot overwrite a newer one.
  const { data: searchData, loading: searchLoading } = usePublicApi<GroupedLeaderboardResponse | null>(
    (signal) =>
      searchTerm
        ? publicApi.getGroupedLeaderboard(eventId, raceId, { search: searchTerm, showAll: true }, signal)
        : Promise.resolve(null),
    [eventId, raceId, searchTerm],
  );

  // Overall list when present; the grouped category lists as a fallback for
  // events whose Overall section is toggled off (deduped — a runner appears in
  // both gender and category buckets).
  const searchMatches = useMemo(() => {
    if (!searchTerm || !searchData) return [];
    if (searchData.overallResults?.length) return searchData.overallResults;
    const seen = new Set<string>();
    return (searchData.genderCategories ?? [])
      .flatMap((g) => g.categories.flatMap((c) => c.participants ?? []))
      .filter((p) => {
        const key = p.participantDetailUrl || `${p.bib}|${p.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [searchTerm, searchData]);
  const searchRankBy = searchData?.overallRankBy ?? searchData?.rankBy ?? 'ChipTime';

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

  // Only the tabbed gender is rendered. MALE is the default view.
  const isMale = gender === 'male';
  const activeList = isMale ? maleList : femaleList;
  const activeTotal = isMale ? maleTotal : femaleTotal;
  const activeGenderLabel = isMale ? 'Male' : 'Female';
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

      {/* Search result panel — directly below the search box, above the podium.
          The leaderboard (podium + table) below never reacts to the term. */}
      {/* Arbitrary-value utilities only: this app loads Tailwind's utilities layer
          without the default theme, so scale classes (p-4, gap-x-3, rounded-xl,
          text-gray-500…) resolve to unset vars and silently do nothing. */}
      {searchTerm && (
        <div className="mb-[1rem] rounded-[12px] border border-[#E5E7EB] bg-[#fff] p-[1rem] shadow-[0_1px_3px_rgba(11,28,50,0.08)]">
          {searchLoading ? (
            <div className="text-[0.875rem] text-[#6B7280]">Searching…</div>
          ) : searchMatches.length === 0 ? (
            <div className="text-[0.875rem] text-[#4B5563]">
              No participant found for &lsquo;{searchTerm}&rsquo; in {data?.raceName ?? searchData?.raceName ?? 'this race'} — try selecting a different race.
            </div>
          ) : (
            <ul>
              {searchMatches.slice(0, 10).map((p, i) => (
                <li
                  key={p.participantDetailUrl || `${p.bib}-${i}`}
                  className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-[0.25rem] border-t border-[#F3F4F6] py-[0.5rem] first:border-t-0 first:pt-0 last:pb-0"
                >
                  {p.participantDetailUrl ? (
                    <a
                      href={p.participantDetailUrl}
                      className="text-[0.9375rem] font-[600] text-[color:var(--color-primary)] underline underline-offset-[2px] hover:opacity-[0.8]"
                    >
                      {p.name.trim()}
                    </a>
                  ) : (
                    <span className="text-[0.9375rem] font-[600]">{p.name.trim()}</span>
                  )}
                  <span className="text-[0.875rem] text-[#6B7280]">BIB {p.bib}</span>
                  <span className="text-[0.875rem] text-[#6B7280] tabular-nums">{timeOf(p, searchRankBy)}</span>
                </li>
              ))}
              {searchMatches.length > 10 && (
                <li className="pt-[0.5rem] text-[0.75rem] text-[#9CA3AF]">Showing first 10 of {searchMatches.length} matches</li>
              )}
            </ul>
          )}
        </div>
      )}

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
            /* ONE gender at a time, selected by the tab under the header */
            <div className="lb-view" key={`${selectedCategory || 'overall'}-${gender}`}>
              <PodiumHeader subtitle={headingText} gender={gender} onGenderChange={setGender} />
              <div role="tabpanel" id={`gt-panel-${gender}`} aria-labelledby={`gt-tab-${gender}`}>
                <GenderBlock
                  label={activeGenderLabel}
                  participants={activeList}
                  rankBy={activeRankBy}
                  published={published}
                  total={activeTotal}
                  rankLabel={rankLabel}
                  event={shareEvent}
                />
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
                  // The admin dashboard's dark mode sets color-scheme: dark app-wide
                  // (CssBaseline enableColorScheme); an unpinned text color then renders
                  // WHITE on this white field — typed text invisible until selected.
                  // Pin the whole control to light so no UA scheme can invert it.
                  color: 'var(--color-text)',
                  caretColor: 'var(--color-text)',
                  colorScheme: 'light',
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
