import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EventCarouselProps {
  children: React.ReactNode[];
  cardWidth: number;
  gap?: number;
  /** Auto-advance interval in ms. Set to 0 to disable. Default: 3500 */
  autoPlayInterval?: number;
}

function EventCarousel({
  children,
  cardWidth,
  gap = 16,
  autoPlayInterval = 3500,
}: EventCarouselProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const [canPrev,    setCanPrev]    = useState(false);
  const [canNext,    setCanNext]    = useState(false);
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [isPaused,   setIsPaused]   = useState(false);

  const count = children.length;

  // ── Scroll-position bookkeeping ───────────────────────────────────

  const syncState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setActiveIdx(Math.round(el.scrollLeft / (cardWidth + gap)));
  }, [cardWidth, gap]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncState();
    el.addEventListener('scroll', syncState, { passive: true });
    const ro = new ResizeObserver(syncState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', syncState);
      ro.disconnect();
    };
  }, [children, syncState]);

  // ── Navigation helpers ────────────────────────────────────────────

  const scrollToIndex = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
  }, [cardWidth, gap]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / (cardWidth + gap));
    scrollToIndex(Math.max(0, Math.min(current + dir, count - 1)));
  };

  // ── Auto-play ─────────────────────────────────────────────────────

  useEffect(() => {
    if (count <= 1 || !autoPlayInterval || isPaused) return;

    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        // Wrap back to start
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const next = Math.round(el.scrollLeft / (cardWidth + gap)) + 1;
        scrollToIndex(next);
      }
    }, autoPlayInterval);

    return () => clearInterval(id);
  }, [count, autoPlayInterval, isPaused, cardWidth, gap, scrollToIndex]);

  // ── Arrow button ──────────────────────────────────────────────────

  const arrowStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: '40%',
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
    padding: 0,
  });

  return (
    <div
      style={{ position: 'relative', overflow: 'visible' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Prev / Next arrows */}
      {canPrev && (
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          style={arrowStyle('left')}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Next"
          style={arrowStyle('right')}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Scrollable track */}
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
            style={{ flex: `0 0 ${cardWidth}px`, scrollSnapAlign: 'start', minWidth: 0 }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.25rem' }}>
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === activeIdx ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                padding: 0,
                backgroundColor: i === activeIdx ? 'var(--color-primary)' : '#D1D5DB',
                cursor: 'pointer',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventCarousel;
