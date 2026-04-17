import { Timer, Calendar, BarChart3 } from 'lucide-react';
import { Section, Container, Heading, Card } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import type { ElementType } from 'react';

const features: { icon: ElementType; title: string; desc: string }[] = [
  {
    icon: Timer,
    title: 'RFID Race Timing',
    desc: 'Chip-based precision timing accurate to 0.001 seconds. Supports split timing, gun time, net time, and live leaderboards.',
  },
  {
    icon: Calendar,
    title: 'Event Management',
    desc: 'End-to-end event operations — registration, bib management, checkpoint control, and participant communication in one platform.',
  },
  {
    icon: BarChart3,
    title: 'Live Results',
    desc: 'Instant, searchable race results published in real time. Participants find their finish via bib, name, or QR code.',
  },
];

function PlatformOverview() {
  const ref = useScrollReveal();
  return (
    <Section tone="alt" id="platform">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>
            Platform Overview
          </Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: '1rem', fontSize: '1.0625rem' }}>
            Everything you need to run world-class events at any scale.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <div style={{ padding: '2rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(232,93,42,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={24} color="var(--color-accent)" />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '1.1875rem',
                    marginBottom: '0.625rem',
                    color: 'var(--color-text)',
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>
                  {desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default PlatformOverview;
