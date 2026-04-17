import type { ReactNode, CSSProperties } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Container({ children, className, style }: ContainerProps) {
  return (
    <div
      style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        paddingLeft: 'clamp(1rem, 4vw, 2rem)',
        paddingRight: 'clamp(1rem, 4vw, 2rem)',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export default Container;
