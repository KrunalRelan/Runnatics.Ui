import { Section, Container, Heading, Button } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import usePublicApi from '../../../hooks/usePublicApi';
import { getPublicStats, type PublicStats } from '../../../services/publicApi';
import { StatsSkeleton } from '../shared/ApiStates';

interface StatItem {
  value: string;
  label: string;
}

function toStatItems(stats: PublicStats): StatItem[] {
  return [
    { value: stats.totalParticipants >= 100000 ? `${(stats.totalParticipants / 100000).toFixed(0)}L+` : `${stats.totalParticipants.toLocaleString()}+`, label: 'Participants' },
    { value: `${stats.totalEvents.toLocaleString()}+`, label: 'Events' },
    { value: `${stats.totalCities}+`, label: 'Cities' },
    { value: stats.timingAccuracy, label: 'Timing Accuracy' },
  ];
}

function ParticipantInsights() {
  const ref = useScrollReveal();
  const { data: stats, loading } = usePublicApi(
    (signal) => getPublicStats(signal),
    [],
  );

  const statItems = stats ? toStatItems(stats) : null;

  return (
    <Section tone="dark">
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
          {/* Stats grid */}
          <div>
            {loading && <StatsSkeleton />}
            {!loading && !statItems && (
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
                Stats unavailable right now.
              </p>
            )}
            {!loading && statItems && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                      color: 'var(--color-accent)',
                      lineHeight: 1.1,
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: '0.35rem',
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <Heading level={2} style={{ color: '#fff' }}>
              Built for Scale,<br />Trusted for Precision
            </Heading>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.75,
              marginTop: '1.25rem',
              marginBottom: '2rem',
              fontSize: '1.0625rem',
            }}>
              From intimate community 5Ks to India's largest marathons, Racetik has
              been the silent engine behind every finisher's time. Our platform handles
              everything from participant onboarding to certificate delivery — so you can
              focus on creating unforgettable race experiences.
            </p>
            <Button variant="outline" href="/about" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default ParticipantInsights;
