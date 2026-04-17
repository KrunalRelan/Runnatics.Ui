import { Section, Container, Heading } from '../ui';

function AboutHero() {
  return (
    <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
      <Container>
        <Heading level={1} style={{ color: '#fff', marginBottom: '1rem' }}>
          About Runnatics
        </Heading>
        <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', maxWidth: '560px', margin: '0 auto' }}>
          The story of India's most trusted race timing and event management platform.
        </p>
      </Container>
    </Section>
  );
}

export default AboutHero;
