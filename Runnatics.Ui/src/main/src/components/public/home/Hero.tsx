import { useEffect, useState } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Button, Container } from '../ui';
import usePublicApi from '../../../hooks/usePublicApi';
import { getUpcomingEvents, type PublicEvent } from '../../../services/publicApi';
import { base64ToDataUrl } from '../../../utility';

const AUTO_ADVANCE_MS = 5000;

function HeroSlide({ event, isActive }: { event: PublicEvent; isActive: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 700ms ease-in-out',
        pointerEvents: isActive ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {event.bannerBase64 ? (
        <img
          src={base64ToDataUrl(event.bannerBase64)}
          alt={event.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #0F2744 55%, #1A3D6A 100%)',
          }}
        />
      )}
      {/* dark overlay for legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: event.bannerBase64
            ? 'linear-gradient(180deg, rgba(11,28,50,0.55) 0%, rgba(11,28,50,0.75) 100%)'
            : 'radial-gradient(circle at 20% 50%, rgba(232,93,42,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%)',
        }}
      />

      <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem 1.5rem', color: '#fff' }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(232,93,42,0.15)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            marginBottom: '1.25rem',
            border: '1px solid rgba(232,93,42,0.3)',
          }}
        >
          Upcoming Event
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 auto 1.25rem',
            maxWidth: '900px',
          }}
        >
          {event.name}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} /> {event.date}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} /> {event.city}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" href={`/events/${event.slug}`}>
            Register Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            href={`/events/${event.slug}`}
            style={{ borderColor: 'rgba(255,255,255,0.55)', color: '#fff' }}
          >
            View Details
          </Button>
        </div>
      </Container>
    </div>
  );
}

function HeroFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #0F2744 60%, #1A3D6A 100%)',
      }}
    >
      <Container style={{ textAlign: 'center', color: '#fff', padding: '4rem 1.5rem' }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(232,93,42,0.15)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            marginBottom: '1.25rem',
            border: '1px solid rgba(232,93,42,0.3)',
          }}
        >
          India's #1 Race Timing Platform
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 auto 1.25rem',
            maxWidth: '800px',
          }}
        >
          Run India, <span style={{ color: 'var(--color-accent)' }}>Manage Every Mile.</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '620px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          India's most trusted race timing and event management platform.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" href="/events">Explore Events</Button>
          <Button variant="outline" size="lg" href="/contact" style={{ borderColor: 'rgba(255,255,255,0.55)', color: '#fff' }}>
            Organize With Us
          </Button>
        </div>
      </Container>
    </div>
  );
}

function Hero() {
  const { data: events, loading } = usePublicApi((signal) => getUpcomingEvents(signal), []);
  const slides = events ?? [];
  const [index, setIndex] = useState(0);

  // Clamp index if list shrinks
  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [slides.length, index]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const hasSlides = slides.length > 0;
  const go = (next: number) => {
    if (slides.length === 0) return;
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <section
      aria-roledescription={hasSlides ? 'carousel' : undefined}
      style={{
        position: 'relative',
        minHeight: 'clamp(420px, 78vh, 680px)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-dark)',
      }}
    >
      {/* Slides */}
      {!hasSlides && !loading && <HeroFallback />}
      {loading && !hasSlides && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #0F2744 60%, #1A3D6A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <Activity size={32} style={{ opacity: 0.6 }} />
        </div>
      )}
      {hasSlides && slides.map((ev, i) => (
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
