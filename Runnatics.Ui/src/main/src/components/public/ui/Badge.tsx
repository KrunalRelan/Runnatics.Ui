import type { ReactNode, CSSProperties } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: { backgroundColor: '#F3F4F6', color: '#374151' },
  accent: { backgroundColor: 'rgba(232,93,42,0.10)', color: 'var(--color-accent)' },
  success: { backgroundColor: 'rgba(16,185,129,0.10)', color: 'var(--color-success)' },
};

function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '9999px',
        padding: '0.2rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
