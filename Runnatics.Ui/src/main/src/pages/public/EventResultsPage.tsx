import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Section, Container } from '../../components/public/ui';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { publicApi } from '../../../../api/publicApi';
import { base64ToDataUrl } from '../../utility';

function formatEventDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

const shimmer = {
  background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
} as const;

function EventDetailSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          padding: 'clamp(3rem, 6vw, 5rem) 0',
        }}
      >
        <Container>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...shimmer, height: '2.5rem', width: '55%', background: 'rgba(255,255,255,0.15)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' }} />
            <div style={{ ...shimmer, height: '1rem', width: '35%', background: 'rgba(255,255,255,0.1)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' }} />
          </div>
        </Container>
      </div>
      <Section tone="light">
        <Container>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  ...shimmer,
                  height: '64px',
                  borderRadius: '8px',
                }}
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function EventResultsPage() {
  const { eventSlug: eventId = '' } = useParams();

  const { data: ev, loading, error } = usePublicApi(
    (signal) => publicApi.getEventDetail(eventId, signal),
    [eventId],
  );

  if (loading) return <EventDetailSkeleton />;

  if (error) {
    return (
      <Section tone="light" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <Container>
          <ErrorState message={error} />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              ← Back to Events
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  if (!ev) return null;

  const evRaw = ev as unknown as Record<string, unknown>;
  // Temporary: log the raw event shape to confirm which field holds races
  console.log('[EventResultsPage] ev keys:', Object.keys(ev), 'races:', evRaw.races, 'raceCategories:', evRaw.raceCategories);

  const showBannerBg = ev.showBanner && ev.bannerBase64;
  const races = ev.races ?? (evRaw.raceCategories as typeof ev.races) ?? [];

  return (
    <>
      {/* Hero */}
      <Section
        tone="dark"
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0',
          ...(showBannerBg
            ? {
                backgroundImage: `linear-gradient(rgba(10,18,32,0.72), rgba(10,18,32,0.72)), url(${base64ToDataUrl(ev.bannerBase64!)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}),
        }}
      >
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
              }}
            >
              ← Back to Events
            </Link>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              color: '#fff',
              margin: '0 0 0.875rem',
              lineHeight: 1.15,
            }}
          >
            {ev.name}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem 1.5rem',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {ev.eventDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> {formatEventDate(ev.eventDate)}
              </span>
            )}
            {ev.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} /> {ev.city}
              </span>
            )}
            {ev.venue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} /> {ev.venue}
              </span>
            )}
            {ev.participantCount != null && ev.participantCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {ev.participantCount.toLocaleString()} participants
              </span>
            )}
          </div>
        </Container>
      </Section>

      {/* Races */}
      <Section tone="light">
        <Container>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.375rem',
              color: 'var(--color-text)',
              marginBottom: '1.25rem',
            }}
          >
            Races
          </h2>

          {races.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                fontSize: '1rem',
              }}
            >
              No races available for this event.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {races.map((race) => (
                <div
                  key={race.encryptedRaceId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--color-text)',
                      }}
                    >
                      {race.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {race.distance ? `${race.distance} KM` : ''}
                      {race.registeredCount != null && race.registeredCount > 0
                        ? `${race.distance ? ' · ' : ''}${race.registeredCount.toLocaleString()} participants`
                        : ''}
                    </div>
                  </div>

                  {race.hasResults && (
                    <Link
                      to={`/c/${eventId}/${race.encryptedRaceId}/l`}
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.25rem',
                        backgroundColor: '#E67E22',
                        color: '#fff',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View Leaderboard
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

export default EventResultsPage;
