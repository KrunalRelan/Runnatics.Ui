import { User } from 'lucide-react';
import { Section, Container, Heading, Card } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import type { PublicAboutFounder } from '../../../services/publicApi';

// Founders tiles — replaces the hardcoded "Our Services" grid. Same tile/card
// style; content is admin-managed. Renders nothing when no founders exist.

interface FoundersProps {
  founders: PublicAboutFounder[];
}

function Founders({ founders }: FoundersProps) {
  const ref = useScrollReveal();
  if (founders.length === 0) return null;

  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>Founders</Heading>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
            // Centre the row when there are fewer tiles than columns
            justifyContent: 'center',
          }}
        >
          {founders.map((f, i) => (
            <Card key={`${f.name}-${i}`}>
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                {f.photoBase64 ? (
                  <img
                    src={`data:image/*;base64,${f.photoBase64}`}
                    alt={f.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 1rem',
                      display: 'block',
                      border: '3px solid rgba(232,93,42,0.25)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(232,93,42,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <User size={38} color="var(--color-accent)" />
                  </div>
                )}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.0625rem', margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
                  {f.name}
                </h3>
                {f.role && (
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
                    {f.role}
                  </div>
                )}
                {f.bio && (
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                    {f.bio}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default Founders;
