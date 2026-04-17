import type { ReactNode, ElementType, CSSProperties } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}

const levelStyles: Record<1 | 2 | 3, CSSProperties> = {
  1: {
    fontSize: 'var(--font-size-h1)',
    lineHeight: 'var(--line-height-h1)',
    fontWeight: 700,
  },
  2: {
    fontSize: 'var(--font-size-h2)',
    lineHeight: 'var(--line-height-h2)',
    fontWeight: 600,
  },
  3: {
    fontSize: 'var(--font-size-h3)',
    lineHeight: 'var(--line-height-h3)',
    fontWeight: 600,
  },
};

function Heading({ level = 2, children, className, as, style }: HeadingProps) {
  const Tag = (as ?? (`h${level}` as ElementType)) as ElementType;

  return (
    <div>
      <Tag
        style={{
          fontFamily: 'var(--font-heading)',
          margin: 0,
          ...levelStyles[level],
          ...style,
        }}
        className={className}
      >
        {children}
      </Tag>
      {level === 2 && (
        <span
          style={{
            display: 'block',
            width: '3rem',
            height: '3px',
            backgroundColor: 'var(--color-accent)',
            borderRadius: '2px',
            marginTop: '1rem',
          }}
        />
      )}
    </div>
  );
}

export default Heading;
