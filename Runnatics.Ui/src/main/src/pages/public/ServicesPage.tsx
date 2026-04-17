import { Timer, ClipboardList, FileCheck, Tag, Camera, LifeBuoy, Check } from 'lucide-react';
import { Section, Container, Heading, Button } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';
import type { ElementType } from 'react';

interface ServiceSection {
  icon: ElementType;
  title: string;
  desc: string;
  features: string[];
  reverse: boolean;
}

const services: ServiceSection[] = [
  {
    icon: Timer, title: 'RFID Race Timing', reverse: false,
    desc: 'Precision chip-based timing accurate to 0.001 seconds. Our RFID systems handle any volume — from 100-person fun runs to 50,000-participant city marathons.',
    features: ['Ultra-wideband chip detection', 'Gun time & net time', 'Real-time leaderboard updates'],
  },
  {
    icon: ClipboardList, title: 'Event Registration', reverse: true,
    desc: 'End-to-end online registration platform with payment processing, waitlist management, and participant self-service portal.',
    features: ['Custom registration forms', 'Razorpay & Stripe payment', 'Group & corporate registrations'],
  },
  {
    icon: FileCheck, title: 'Results & Certificates', reverse: false,
    desc: "Instant results publication and personalised digital finisher certificates delivered to every participant's inbox within minutes of crossing the line.",
    features: ['Searchable results by bib or name', 'Custom certificate templates', 'QR verification'],
  },
  {
    icon: Tag, title: 'Bib & Medal Design', reverse: true,
    desc: 'Premium bib printing with embedded RFID chips, sponsor branding, and race information. Custom finisher medals that participants treasure for years.',
    features: ['Embedded chip bibs', 'Full-colour custom design', 'Bulk medal fulfilment'],
  },
  {
    icon: Camera, title: 'Photography & Video', reverse: false,
    desc: 'Professional race photography at key course checkpoints with AI-powered face recognition to deliver personalised photo galleries to every finisher.',
    features: ['Checkpoint & finish line coverage', 'Face-recognition delivery', 'Watermarked previews + hi-res downloads'],
  },
  {
    icon: LifeBuoy, title: 'Consulting & Support', reverse: true,
    desc: 'Strategic event consulting for first-time organisers and experienced race directors. From course mapping to post-race analytics.',
    features: ['Course design & permits', 'Volunteer & logistics planning', 'Post-event ROI reporting'],
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

      {services.map(({ icon: Icon, title, desc, features, reverse }, i) => (
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
                <Button variant="primary" href="/contact">Get a Quote</Button>
              </div>
              {/* Placeholder image */}
              <div style={{ direction: 'ltr', aspectRatio: '4/3', backgroundColor: '#E5E7EB', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={52} color="#D1D5DB" />
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
