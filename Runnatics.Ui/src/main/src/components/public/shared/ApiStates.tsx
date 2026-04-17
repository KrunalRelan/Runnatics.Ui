import { AlertCircle, RefreshCw, SearchX, ImageOff } from 'lucide-react';
import { Button } from '../ui';

// ── Shimmer skeleton ──────────────────────────────────────────────

const shimmerStyle = {
  background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
} as const;

function SkeletonBox({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <div style={{ ...shimmerStyle, width, height }} />;
}

export function CardSkeleton() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <SkeletonBox height="160px" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <SkeletonBox height="1.125rem" width="85%" />
        <SkeletonBox height="0.875rem" width="55%" />
        <SkeletonBox height="0.875rem" width="40%" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </>
  );
}

export function TableRowSkeleton({ cols = 9 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.875rem 1rem' }}>
          <SkeletonBox height="0.875rem" width={i === 2 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 8, cols = 9 }: { rows?: number; cols?: number }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} cols={cols} />)}
      </tbody>
    </>
  );
}

const darkShimmer = {
  background: 'linear-gradient(90deg,rgba(255,255,255,0.08) 25%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.08) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
} as const;

export function StatsSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ ...darkShimmer, height: '2.5rem', width: '70%' }} />
            <div style={{ ...darkShimmer, height: '0.875rem', width: '50%', opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Error state ───────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  dark?: boolean;
}

export function ErrorState({ message, onRetry, dark = false }: ErrorStateProps) {
  const color = dark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)';
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <AlertCircle size={36} color={dark ? 'rgba(255,255,255,0.5)' : 'var(--color-error)'} />
      <p style={{ fontFamily: 'var(--font-body)', color, fontSize: '1rem', margin: 0 }}>
        {message ?? 'Failed to load data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: dark ? '#fff' : 'var(--color-accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          <RefreshCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title = 'Nothing here yet', subtitle, icon, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {icon ?? <SearchX size={36} color="var(--color-text-muted)" />}
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-text)', margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9375rem', margin: 0 }}>{subtitle}</p>}
      {action}
    </div>
  );
}

// ── Gallery coming-soon state ─────────────────────────────────────

export function GalleryComingSoon() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <ImageOff size={48} color="var(--color-text-muted)" />
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--color-text)', margin: 0 }}>Gallery Coming Soon</p>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', maxWidth: '380px', lineHeight: 1.6 }}>
        Race photos from our events will appear here. Check back after the next event.
      </p>
      <Button variant="outline" href="/events">Browse Events</Button>
    </div>
  );
}
