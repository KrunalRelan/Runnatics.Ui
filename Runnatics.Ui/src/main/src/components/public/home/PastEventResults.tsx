import { Section, Container, Heading } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import usePublicApi from '../../../hooks/usePublicApi';
import { getPastEvents } from '../../../services/publicApi';
import EventCard from '../events/EventCard';
import { CardGridSkeleton, ErrorState, EmptyState } from '../shared/ApiStates';
import EventCarousel from './EventCarousel';

function PastEventResults() {
  const ref = useScrollReveal();
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getPastEvents(signal),
    [],
  );

  const preview = events?.slice(0, 3) ?? [];

  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Heading level={2} style={{ display: "inline-block" }}>
            Past Event Results
          </Heading>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-muted)",
              marginTop: "1rem",
            }}
          >
            Browse results from all our past events.
          </p>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          {loading && <CardGridSkeleton count={5} />}
          {!loading && error && (
            <ErrorState message={error} onRetry={refetch} />
          )}
          {!loading && !error && preview.length === 0 && (
            <EmptyState
              title="No past events yet"
              subtitle="Results from completed events will appear here."
            />
          )}
          {!loading && !error && preview.length > 0 && (
            <EventCarousel cardWidth={260} gap={24}>
              {preview.map((ev) => (
                <EventCard
                  key={ev.encryptedId || ev.slug}
                  event={ev}
                  portrait
                />
              ))}
            </EventCarousel>
          )}
        </div>
      </Container>
    </Section>
  );
}

export default PastEventResults;
