import { Section, Container, Heading, Button } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import usePublicApi from '../../../hooks/usePublicApi';
import { getPastEvents } from '../../../services/publicApi';
import EventCard from '../events/EventCard';
import { CardGridSkeleton, ErrorState, EmptyState } from '../shared/ApiStates';

function PastEventResults() {
  const ref = useScrollReveal();
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getPastEvents(signal),
    [],
  );

  const preview = events?.slice(0, 6) ?? [];

  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading level={2} style={{ display: 'inline-block' }}>Past Event Results</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            Browse results from all our past events.
          </p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          {loading && <CardGridSkeleton count={6} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && preview.length === 0 && (
            <EmptyState title="No past events yet" subtitle="Results from completed events will appear here." />
          )}
          {!loading && !error && preview.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {preview.map((ev) => <EventCard key={ev.slug} event={ev} />)}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="outline" size="md" href="/results">View All Results →</Button>
        </div>
      </Container>
    </Section>
  );
}

export default PastEventResults;
