import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EventCarouselProps {
  children: React.ReactNode[];
  cardWidth: number;
  gap?: number;
}

function EventCarousel({ children, cardWidth, gap = 16 }: EventCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [children]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (cardWidth + gap) * 2, behavior: 'smooth' });
  };

  const arrowBtn = (side: 'left' | 'right', dir: 1 | -1) => (
    <button
      onClick={() => scroll(dir)}
      aria-label={dir === -1 ? 'Previous' : 'Next'}
      style={{
        position: 'absolute',
        top: '50%',
        [side]: '-18px',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '1px solid var(--color-border)',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--color-text)',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
      }}
    >
      {dir === -1 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );

  return (
    <div style={{ position: 'relative', overflow: 'visible' }}>
      {canPrev && arrowBtn('left', -1)}
      {canNext && arrowBtn('right', 1)}

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: `${gap}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '0.5rem 2px 1rem',
        } as React.CSSProperties}
      >
        {children.map((child, i) => (
          <div
            key={i}
            style={{
              flex: `0 0 ${cardWidth}px`,
              scrollSnapAlign: 'start',
              minWidth: 0,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventCarousel;
