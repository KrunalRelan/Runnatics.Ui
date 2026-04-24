import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Flag } from 'lucide-react';
import { Section, Container, Heading, Button, Badge } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';
import { ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { getEventDetail } from '../../services/publicApi';

const shimmer = {
  background: 'linear-gradient(90deg,rgba(255,255,255,0.08) 25%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.08) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
} as const;

function DetailSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <Container>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...shimmer, height: '2.5rem', width: '60%' }} />
            <div style={{ ...shimmer, height: '1rem', width: '40%' }} />
          </div>
        </Container>
      </Section>
      <Section tone="alt" style={{ padding: '2rem 0' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '1.25rem', height: '72px', background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function EventDetailPage() {
  const { slug = '' } = useParams();

  const { data: ev, loading, error } = usePublicApi(
    (signal) => getEventDetail(slug, signal),
    [slug],
  );

  if (loading) return <DetailSkeleton />;

  if (error) {
    const isNotFound = error.includes('404');
    return (
      <Section tone="light" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <Container>
          <ErrorState
            message={isNotFound ? 'Event not found. It may have been removed or the URL is incorrect.' : error}
          />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Button variant="outline" href="/events">Browse Events</Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (!ev) return null;

  return (
    <>
      {/* Hero */}
      <Section
        tone="dark"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 0',
          ...(ev.bannerUrl ? {
            backgroundImage: `linear-gradient(rgba(10,18,32,0.72), rgba(10,18,32,0.72)), url(${ev.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
      >
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link to="/events" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              ← Back to Events
            </Link>
          </div>
          <Heading level={1} style={{ color: '#fff' }}>{ev.name}</Heading>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              <Calendar size={16} /> {ev.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              <MapPin size={16} /> {ev.city}
            </span>
            {ev.venue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                <Flag size={16} /> {ev.venue}
              </span>
            )}
          </div>
        </Container>
      </Section>

      {/* Info cards */}
      <Section tone="alt" style={{ padding: '2rem 0' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Date', value: ev.date, icon: <Calendar size={20} color="var(--color-accent)" /> },
              { label: 'Location', value: ev.city, icon: <MapPin size={20} color="var(--color-accent)" /> },
              ev.categories.length > 0 && { label: 'Categories', value: `${ev.categories.length} races`, icon: <Flag size={20} color="var(--color-accent)" /> },
              ev.participants > 0 && { label: 'Participants', value: `${ev.participants.toLocaleString()}+`, icon: <Users size={20} color="var(--color-accent)" /> },
            ].filter(Boolean).map((item) => {
              const { label, value, icon } = item as { label: string; value: string; icon: React.ReactNode };
              return (
                <div key={label} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  {icon}
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Description */}
      {ev.description && (
        <Section tone="light">
          <Container style={{ maxWidth: '800px' }}>
            <Heading level={2}>About the Event</Heading>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.8, marginTop: '1.25rem', fontSize: '1.0625rem' }}>
              {ev.description}
            </p>
          </Container>
        </Section>
      )}

      {/* Race categories */}
      {ev.categories.length > 0 && (
        <Section tone="alt">
          <Container>
            <Heading level={2}>Race Categories</Heading>
            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                    {['Category', 'Distance', 'Entry Fee', 'Participants'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.9375rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ev.categories.map((cat, i) => (
                    <tr key={cat.name} style={{ backgroundColor: i % 2 === 0 ? '#fff' : 'var(--color-bg-alt)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--color-text)' }}>{cat.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{cat.distance}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{cat.price}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{cat.count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>
      )}

      {/* Sponsors */}
      {ev.sponsors.length > 0 && (
        <Section tone="light">
          <Container>
            <Heading level={2}>Sponsors</Heading>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
              {ev.sponsors.map((s) => (
                <div key={s.name} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-bg-alt)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <Badge variant={s.tier === 'Title' ? 'accent' : 'default'}>{s.tier}</Badge>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', marginTop: '0.375rem', color: 'var(--color-text)' }}>{s.name}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTAs */}
      <Section tone="alt" style={{ padding: '2.5rem 0' }}>
        <Container>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="lg" href={`/events/${slug}/results`}>View Results</Button>
            {ev.registrationUrl ? (
              <a
                href={ev.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.875rem 2rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.125rem',
                  backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '8px', textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
              >
                Register Now ↗
              </a>
            ) : (
              <Button variant="secondary" size="lg" href="/contact">Register Now</Button>
            )}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}

export default EventDetailPage;
