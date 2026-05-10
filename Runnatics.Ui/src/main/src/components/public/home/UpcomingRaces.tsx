import { Section, Container, Heading, Button } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import usePublicApi from '../../../hooks/usePublicApi';
import { getUpcomingEvents } from '../../../services/publicApi';
import EventCard from '../events/EventCard';
import { CardGridSkeleton, ErrorState, EmptyState } from '../shared/ApiStates';

function UpcomingRaces() {
  const ref = useScrollReveal();
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getUpcomingEvents(signal),
    [],
  );

  const preview = events?.slice(0, 3) ?? [];

  return (
    <Section tone="light">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>Upcoming Events</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            India's biggest running events, powered by Racetik.
          </p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          {loading && <CardGridSkeleton count={3} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && preview.length === 0 && (
            <EmptyState title="No upcoming events" subtitle="Check back soon — new events are added regularly." />
          )}
          {!loading && !error && preview.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {preview.map((ev) => (
                <EventCard key={ev.encryptedId || ev.slug} event={ev} />
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="outline" size="md" href="/events">View All Events →</Button>
        </div>
      </Container>
    </Section>
  );
}

export default UpcomingRaces;
