import { Link } from 'react-router-dom';
import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  href?: string;
  className?: string;
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: '#fff',
    border: '2px solid transparent',
  },
  secondary: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: '2px solid transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-accent)',
    border: '2px solid var(--color-accent)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid transparent',
  },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { padding: '0.375rem 1rem', fontSize: '0.875rem' },
  md: { padding: '0.625rem 1.5rem', fontSize: '1rem' },
  lg: { padding: '0.875rem 2rem', fontSize: '1.125rem' },
};

function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  className,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition: 'all 0.2s',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  if (href) {
    return (
      <Link to={href} style={base} className={className} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button style={base} className={className} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

export default Button;
