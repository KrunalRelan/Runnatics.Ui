// ============================================================================
// File: pages/admin/support/statusVisuals.ts
// Purpose: THE status colour map for the support section. Previously this table
//          was copy-pasted into both SupportQueryPage and SupportQueryDetailPage,
//          so a colour change in one silently diverged from the other.
//
// Keyed by the status DISPLAY name ("New Query", "WIP", ...), which the API now
// derives from the raw stored value ("new_query", "wip", ...). Unknown or newly
// added statuses fall back to neutral rather than rendering unstyled.
// ============================================================================

export interface StatusVisual {
  color: string;
  bg: string;
}

const STATUS_VISUAL: Record<string, { light: StatusVisual; dark: StatusVisual }> = {
  'New Query':       { light: { color: '#1D4ED8', bg: '#EFF6FF' },  dark: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' } },
  'WIP':             { light: { color: '#B45309', bg: '#FFFBEB' },  dark: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' } },
  'Closed':          { light: { color: '#065F46', bg: '#ECFDF5' },  dark: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' } },
  'Pending':         { light: { color: '#5B21B6', bg: '#F5F3FF' },  dark: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' } },
  'Not Yet Started': { light: { color: '#374151', bg: '#F9FAFB' },  dark: { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' } },
  'Rejected':        { light: { color: '#991B1B', bg: '#FEF2F2' },  dark: { color: '#F87171', bg: 'rgba(248,113,113,0.12)' } },
  'Duplicate':       { light: { color: '#9A3412', bg: '#FFF7ED' },  dark: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)' } },
};

const FALLBACK: { light: StatusVisual; dark: StatusVisual } = {
  light: { color: '#374151', bg: '#F9FAFB' },
  dark:  { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
};

export const getStatusVisual = (statusName: string, isDark: boolean): StatusVisual => {
  const v = STATUS_VISUAL[statusName] ?? FALLBACK;
  return isDark ? v.dark : v.light;
};

/** Initials for an avatar; '?' when the name is missing. */
export const getInitials = (name: string | null | undefined): string =>
  name
    ? name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
