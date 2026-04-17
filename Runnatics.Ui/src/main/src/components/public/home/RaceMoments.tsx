import { Camera } from 'lucide-react';
import { useState } from 'react';
import { Section, Container, Heading, Button } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';

const moments = [
  'Delhi Marathon 2025', 'Mumbai Night Run', 'Bengaluru 10K',
  'Airtel Half Marathon', 'Hyderabad Marathon', 'Pune Monsoon Run',
];

function RaceMoments() {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>
            Race Moments &amp; Event Highlights
          </Heading>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {moments.map((name, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '1',
                backgroundColor: '#D1D5DB',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={32} color="#9CA3AF" />
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(10,18,32,0.75)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1rem',
                  opacity: hovered === i ? 1 : 0,
                  transition: 'opacity 0.25s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#fff',
                  }}
                >
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="outline" href="/gallery">
            View Full Gallery →
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export default RaceMoments;
