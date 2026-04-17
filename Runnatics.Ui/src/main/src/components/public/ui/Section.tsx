import type { ReactNode, CSSProperties } from 'react';

type Tone = 'light' | 'dark' | 'alt';

interface SectionProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

const toneStyles: Record<Tone, CSSProperties> = {
  light: { backgroundColor: '#fff', color: 'var(--color-text)' },
  dark: { backgroundColor: 'var(--color-bg-dark)', color: 'var(--color-text-light)' },
  alt: { backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text)' },
};

function Section({ tone = 'light', children, className, id, style }: SectionProps) {
  return (
    <section
      id={id}
      style={{
        padding: 'clamp(4rem, 8vw, 6rem) 0',
        ...toneStyles[tone],
        ...style,
      }}
      className={className}
    >
      {children}
    </section>
  );
}

export default Section;
