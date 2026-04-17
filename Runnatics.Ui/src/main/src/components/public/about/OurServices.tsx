import { Timer, Tag, Award, ClipboardList, Camera, FileCheck } from 'lucide-react';
import { Section, Container, Heading, Card } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import type { ElementType } from 'react';

const services: { icon: ElementType; title: string; desc: string }[] = [
  { icon: Timer, title: 'Race Timing', desc: 'RFID chip-based precision timing for every race format.' },
  { icon: Tag, title: 'Bib Printing', desc: 'Custom bibs with QR codes, sponsor branding, and chip integration.' },
  { icon: Award, title: 'Medal Design', desc: 'Custom finisher medals and memorabilia that participants treasure.' },
  { icon: ClipboardList, title: 'Event Registration', desc: 'Online registration, payment processing, and participant management.' },
  { icon: Camera, title: 'Photography & Video', desc: 'Professional race photography with face-recognition photo delivery.' },
  { icon: FileCheck, title: 'Digital Certificates', desc: 'Instant personalised finisher certificates with QR verification.' },
];

function OurServices() {
  const ref = useScrollReveal();
  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>Our Services</Heading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {services.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(232,93,42,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={20} color="var(--color-accent)" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.0625rem', margin: '0 0 0.5rem', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default OurServices;
