import { Activity, Calendar, MapPin } from 'lucide-react';
import { Section, Container, Heading, Badge, Button, Card } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import usePublicApi from '../../../hooks/usePublicApi';
import { getUpcomingEvents, type PublicEvent } from '../../../services/publicApi';
import { CardGridSkeleton, ErrorState, EmptyState } from '../shared/ApiStates';

function EventCardMini({ ev }: { ev: PublicEvent }) {
  return (
    <Card>
      <div style={{ aspectRatio: '16/9', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Activity size={36} color="#9CA3AF" />
      </div>
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.0625rem', margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
          {ev.name}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={13} /> {ev.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={13} /> {ev.city}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {ev.categories.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
          {ev.registrationOpen && <Badge variant="success">Reg Open</Badge>}
        </div>
        <Button variant="ghost" size="sm" href={`/events/${ev.slug}`}>
          View Details →
        </Button>
      </div>
    </Card>
  );
}

function UpcomingRaces() {
  const ref = useScrollReveal();
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getUpcomingEvents(signal),
    [],
  );

  // Show at most 3 on the home page
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
              {preview.map((ev) => <EventCardMini key={ev.slug} ev={ev} />)}
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
