import { Container, Button } from '../ui';

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function CTABanner({
  title = 'Marathon Management Made Smarter',
  subtitle = 'Join 1000+ events powered by Runnatics',
  ctaLabel = 'Get Started Today',
  ctaHref = '/contact',
}: CTABannerProps) {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)',
        color: '#fff',
        padding: 'clamp(3.5rem, 7vw, 5rem) 0',
        textAlign: 'center',
      }}
    >
      <Container>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            margin: '0 0 0.75rem',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.0625rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '2rem',
          }}
        >
          {subtitle}
        </p>
        <Button
          variant="secondary"
          size="lg"
          href={ctaHref}
          style={{ backgroundColor: '#fff', color: 'var(--color-accent)' }}
        >
          {ctaLabel}
        </Button>
      </Container>
    </section>
  );
}

export default CTABanner;
