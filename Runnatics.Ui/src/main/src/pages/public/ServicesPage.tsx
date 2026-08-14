import { Timer, QrCode, ClipboardList, Wrench, Camera, Check } from 'lucide-react';
import { Section, Container, Heading, Button } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';
import type { ElementType } from 'react';

interface ServiceSection {
  icon: ElementType;
  title: string;
  desc: string;
  features: string[];
  reverse: boolean;
  image: string;
  imageAlt: string;
  /** CSS object-position — chosen per image so cover-cropping never cuts
      baked-in text or the main subject (the 4/3 panel crop is aspect-fixed,
      so these hold at every breakpoint). */
  imagePosition?: string;
}

const services: ServiceSection[] = [
  {
    icon: Timer, title: 'RFID Chip Timing', reverse: false,
    desc: 'Precision RFID chip-based timing for races of all sizes. Real-time results with checkpoint splits, gun time, and chip time accuracy.',
    features: ['Chip-level accuracy', 'Checkpoint splits & live tracking', 'Gun time and net (chip) time'],
    image: '/images/services/timing_services.jpeg',
    imageAlt: 'Runner crossing the finish line under a race timing clock while an official records times on a tablet',
    imagePosition: 'center 60%',
  },
  {
    icon: QrCode, title: 'BIB Distribution Software and Management', reverse: true,
    desc: 'Complete BIB management solution including design, printing, distribution tracking, and on-site collection management.',
    features: ['BIB design & printing', 'Distribution tracking dashboard', 'On-site collection management'],
    image: '/images/services/bib_expo.jpg',
    imageAlt: 'Volunteer handing a race bib to a runner at the bib expo distribution counter',
    imagePosition: 'center top',
  },
  {
    icon: ClipboardList, title: 'Event Registration Platform', reverse: false,
    desc: 'Online event registration portal for participants with payment processing, category selection, and automated confirmation.',
    features: ['Secure payment processing', 'Category & wave selection', 'Automated email confirmations'],
    image: '/images/services/event_registration.jpeg',
    imageAlt: 'Staff member assisting participants with self-service check-in kiosks at an event registration desk',
    imagePosition: 'right center',
  },
  {
    icon: Wrench, title: 'Event Operations & Equipment Leasing Services', reverse: true,
    desc: 'Full event production support including barricading, cones, event production equipment, medals, and t-shirts. Everything you need for race day.',
    features: ['Barricading, cones & signage', 'Medals, t-shirts & bib collection kits', 'On-ground production support'],
    image: '/images/services/equipment_and_leasing.jpeg',
    imageAlt: 'Race crew placing traffic cones beside barricades and a leased-equipment service tent on the course',
  },
  {
    icon: Camera, title: 'Race Day Photo Tagging', reverse: false,
    desc: 'Automated race day photography with BIB-based photo tagging. Participants can find their photos instantly using their BIB number.',
    features: ['BIB-based photo tagging', 'Checkpoint & finish line coverage', 'Instant personalised galleries'],
    image: '/images/services/photo_tagging.jpeg',
    imageAlt: 'Race photographer shooting runners while tagged photos appear in an online gallery by bib number',
    imagePosition: '30% center',
  },
];

function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Our Services</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', marginTop: '0.75rem', maxWidth: '520px', margin: '0.75rem auto 0' }}>
            Everything you need to run a world-class event.
          </p>
        </Container>
      </Section>

      {services.map(({ icon: Icon, title, desc, features, reverse, image, imageAlt, imagePosition }, i) => (
        <Section key={title} tone={i % 2 === 0 ? 'light' : 'alt'}>
          <Container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
              direction: reverse ? 'rtl' : 'ltr',
            }}>
              <div style={{ direction: 'ltr' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(232,93,42,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={26} color="var(--color-accent)" />
                </div>
                <Heading level={2}>{title}</Heading>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1rem', fontSize: '1.0625rem' }}>{desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 1.75rem' }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      <Check size={16} color="var(--color-success)" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" href="/contact">Get Started</Button>
              </div>
              <div style={{ direction: 'ltr', aspectRatio: '4/3', backgroundColor: '#E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
                <img
                  src={image}
                  alt={imageAlt}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePosition ?? 'center', display: 'block' }}
                />
              </div>
            </div>
          </Container>
        </Section>
      ))}

      <CTABanner />
    </>
  );
}

export default ServicesPage;
