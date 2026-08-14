import { useState } from 'react';
import { Section, Container, Heading, Button } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';

// Real gallery images only — no placeholder tiles, ever. Until a caller passes
// images (there is no gallery API yet), the whole section renders nothing.
export interface RaceMomentImage {
  url: string;
  caption?: string;
}

interface RaceMomentsProps {
  images?: RaceMomentImage[];
}

function RaceMoments({ images }: RaceMomentsProps) {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

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
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '1',
                backgroundColor: '#D1D5DB',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <img
                src={img.url}
                alt={img.caption ?? 'Race moment'}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {img.caption && (
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
                    {img.caption}
                  </span>
                </div>
              )}
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
