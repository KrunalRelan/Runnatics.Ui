import { ChevronDown } from 'lucide-react';
import { Button, Container } from '../ui';

const stats = [
  { label: 'Events', value: '1000+' },
  { label: 'Participants', value: '10L+' },
  { label: 'Cities', value: '50+' },
  { label: 'Since', value: '2013' },
];

function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #0F2744 60%, #1A3D6A 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(232,93,42,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      <Container style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '6rem 1.5rem 10rem' }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(232,93,42,0.15)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(232,93,42,0.3)',
          }}
        >
          India's #1 Race Timing Platform
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 auto 1.5rem',
            maxWidth: '800px',
          }}
        >
          Run India,{' '}
          <span style={{ color: 'var(--color-accent)' }}>Manage Every Mile.</span>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.72)',
            maxWidth: '620px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          India's most trusted race timing and event management platform. From
          500-person community runs to 50,000-participant city marathons.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" href="/events">
            Explore Events
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="/contact"
            style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}
          >
            Organize With Us
          </Button>
        </div>
      </Container>

      {/* Stats bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              textAlign: 'center',
              padding: '1.25rem 0',
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.55)',
                    marginTop: '0.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Bounce arrow */}
      <a
        href="#platform"
        aria-label="Scroll down"
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.45)',
          animation: 'bounce 2s infinite',
          display: 'flex',
        }}
      >
        <ChevronDown size={28} />
      </a>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  );
}

export default Hero;
