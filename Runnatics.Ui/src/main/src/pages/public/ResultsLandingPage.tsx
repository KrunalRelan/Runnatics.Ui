import { Trophy } from 'lucide-react';
import { Container } from '../../components/public/ui';
import usePublicApi from '../../hooks/usePublicApi';
import { getPastEvents } from '../../services/publicApi';
import EventCard from '../../components/public/events/EventCard';
import { CardGridSkeleton, ErrorState, EmptyState } from '../../components/public/shared/ApiStates';
import ResultsDisclaimer from '../../components/public/shared/ResultsDisclaimer';

// Results landing — tiles of the 5 most recent past events. "View Result" on each
// tile (shown only when that event's results are published) opens the event leaderboard
// at /results/:eventId.
function ResultsLandingPage() {
  const { data: events, loading, error, refetch } = usePublicApi(
    (signal) => getPastEvents(signal),
    [],
  );

  const recent = (events ?? []).slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Page header */}
      <div style={{ backgroundColor: 'var(--color-primary)', padding: 'clamp(2.5rem, 5vw, 4rem) 0 2.5rem' }}>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Trophy size={32} color="#EA580C" />
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', margin: 0 }}>
                Results
              </h1>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
              Browse leaderboards from our most recent events
            </p>
          </div>
        </Container>
      </div>

      {/* Recent event tiles */}
      <Container>
        <div style={{ padding: '2rem 0 4rem' }}>
          {loading && <CardGridSkeleton count={5} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && recent.length === 0 && (
            <EmptyState
              title="No results yet"
              subtitle="Leaderboards from completed events will appear here."
            />
          )}
          {!loading && !error && recent.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recent.map((ev) => (
                <EventCard key={ev.encryptedId || ev.slug} event={ev} portrait />
              ))}
            </div>
          )}
          {!loading && !error && <ResultsDisclaimer />}
        </div>
      </Container>
    </div>
  );
}

export default ResultsLandingPage;
