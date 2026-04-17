import { Section, Container, Heading } from '../ui';

function EventsHero() {
  return (
    <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
      <Container>
        <Heading level={1} style={{ color: '#fff', marginBottom: '1rem' }}>
          Explore Events Across India
        </Heading>
        <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', maxWidth: '540px', margin: '0 auto' }}>
          From 5K fun runs to full marathons — find your next race.
        </p>
      </Container>
    </Section>
  );
}

export default EventsHero;
