import { Section, Container, Heading } from '../ui';

const clients = [
  'Airtel Delhi Marathon', 'Puma', 'Bhutan Olympic Committee',
  'Devils Circuit', 'Running & Living', 'Hindustan Marathon', 'AIMS', '7Hills Marathon',
  // duplicate for seamless loop
  'Airtel Delhi Marathon', 'Puma', 'Bhutan Olympic Committee',
  'Devils Circuit', 'Running & Living', 'Hindustan Marathon', 'AIMS', '7Hills Marathon',
];

function Clients() {
  return (
    <Section tone="alt" style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) 0' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>
            Trusted By
          </Heading>
        </div>
      </Container>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div
          className="animate-marquee"
          style={{
            display: 'flex',
            gap: '1.5rem',
            width: 'max-content',
          }}
        >
          {clients.map((name, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '0.9375rem',
                color: 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default Clients;
