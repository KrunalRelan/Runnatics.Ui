import { Award, Eye, TrendingUp, LayoutDashboard } from 'lucide-react';
import { Section, Container, Heading } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';

const items = [
  { icon: Award, title: 'Sponsor Tiers', desc: 'Flexible Gold, Silver & Bronze sponsorship packages with clear deliverables and brand exposure metrics.' },
  { icon: Eye, title: 'Brand Visibility', desc: 'Logo placement on bibs, banners, results pages, digital certificates, and race day communications.' },
  { icon: TrendingUp, title: 'ROI Analytics', desc: 'Post-event dashboards showing reach, impressions, participant demographics, and engagement data.' },
];

function Sponsorship() {
  const ref = useScrollReveal();
  return (
    <Section tone="light">
      <Container>
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <Heading level={2}>Revenue &amp; Sponsorship</Heading>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {items.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      flexShrink: 0,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(232,93,42,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color="var(--color-accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.0625rem', margin: '0 0 0.375rem', color: 'var(--color-text)' }}>
                      {title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder dashboard preview */}
          <div
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#E5E7EB',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LayoutDashboard size={48} color="#9CA3AF" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Sponsorship;
