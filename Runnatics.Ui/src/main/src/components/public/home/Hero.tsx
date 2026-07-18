import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';
import RacetikLogo from '../../RacetikLogo';
import usePublicApi from '../../../hooks/usePublicApi';
import { getUpcomingEvents, type PublicEvent } from '../../../services/publicApi';
import { base64ToDataUrl } from '../../../utility';

const AUTO_ADVANCE_MS = 5000;

// Shared hero-slot sizing so the carousel and the branded fallback occupy the same space.
const HERO_FRAME: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  maxHeight: 'min(680px, 82vh)',
  minHeight: 'clamp(360px, 52vw, 680px)',
  overflow: 'hidden',
};

// Branded hero shown when there are no upcoming-event banners — the landing page
// always has a hero (never a bare gap).
function BrandedHero() {
  return (
    <section
      aria-label="Racetik"
      style={{
        ...HERO_FRAME,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #0F2744 55%, #1A3D6A 100%)',
      }}
    >
      <style>{`.branded-hero-logo { width: min(340px, 72vw) !important; }`}</style>
      <div
        style={{
          textAlign: 'center',
          padding: 'clamp(1.5rem, 5vh, 3rem) 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <RacetikLogo variant="png-white" width={340} className="branded-hero-logo" />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            letterSpacing: '0.02em',
            margin: 0,
          }}
        >
          Race Timing &amp; Event Management
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" href="/events">Explore Events</Button>
        </div>
      </div>
    </section>
  );
}

function HeroSlide({ event, isActive }: { event: PublicEvent; isActive: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 700ms ease-in-out',
        pointerEvents: isActive ? 'auto' : 'none',
        overflow: 'hidden',
      }}
    >
      <img
        src={base64ToDataUrl(event.bannerBase64!)}
        alt={event.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

function Hero() {
  const { data: events } = usePublicApi((signal) => getUpcomingEvents(signal), []);
  const slides = (events ?? []).filter((ev) => !!ev.bannerBase64);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Clamp index if list shrinks
  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [slides.length, index]);

  // Auto-advance (paused on hover/focus)
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  const hasSlides = slides.length > 0;
  const go = (next: number) => {
    if (slides.length === 0) return;
    setIndex((next + slides.length) % slides.length);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (slides.length <= 1) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  };

  // No upcoming-event banners → show the branded hero so the landing page always
  // has a hero (never a bare gap, never the old marketing-text block).
  if (!hasSlides) return <BrandedHero />;

  return (
    <section
      aria-roledescription={hasSlides ? 'carousel' : undefined}
      aria-label={hasSlides ? 'Upcoming events' : undefined}
      tabIndex={hasSlides && slides.length > 1 ? 0 : undefined}
      onKeyDown={hasSlides ? onKeyDown : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ ...HERO_FRAME, backgroundColor: 'var(--color-bg-dark)' }}
    >
      {/* Slides */}
      {slides.map((ev, i) => (
        <HeroSlide key={ev.slug || i} event={ev} isActive={i === index} />
      ))}

      {/* Arrow controls */}
      {hasSlides && slides.length > 1 && (
        <>
          <button
            aria-label="Previous event"
            onClick={() => go(index - 1)}
            style={arrowBtnStyle('left')}
            className="hero-arrow"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next event"
            onClick={() => go(index + 1)}
            style={arrowBtnStyle('right')}
            className="hero-arrow"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots */}
      {hasSlides && slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            zIndex: 2,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? '22px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: i === index ? 'var(--color-accent)' : 'rgba(255,255,255,0.45)',
                transition: 'width 250ms ease, background-color 250ms ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function arrowBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    left: side === 'left' ? '1rem' : undefined,
    right: side === 'right' ? '1rem' : undefined,
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: '44px',
    height: '44px',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(11,28,50,0.45)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  };
}

export default Hero;
