import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Flag } from 'lucide-react';
import { Section, Container, Heading, Button, Badge } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';

const eventData: Record<string, {
  name: string; date: string; city: string; venue: string; description: string;
  categories: { name: string; distance: string; price: string; count: number }[];
  participants: number; sponsors: { tier: string; name: string }[];
}> = {
  'airtel-delhi-half-marathon-2026': {
    name: 'Airtel Delhi Half Marathon 2026',
    date: '15 October 2026',
    city: 'New Delhi',
    venue: 'Jawaharlal Nehru Stadium',
    description: "The Airtel Delhi Half Marathon is one of the world's fastest half marathon courses, held annually in the heart of India's capital. Join thousands of runners from across the globe as they tackle the iconic streets of Delhi, finishing in front of a roaring crowd at JLN Stadium.",
    categories: [
      { name: 'Half Marathon', distance: '21.1 km', price: '₹1,200', count: 8000 },
      { name: '10K Run', distance: '10 km', price: '₹800', count: 5000 },
      { name: '5K Fun Run', distance: '5 km', price: '₹500', count: 3000 },
    ],
    participants: 16000,
    sponsors: [
      { tier: 'Title', name: 'Airtel' },
      { tier: 'Gold', name: 'Puma' },
      { tier: 'Gold', name: 'PowerAde' },
      { tier: 'Silver', name: 'Fitbit' },
    ],
  },
};

const defaultEvent = eventData['airtel-delhi-half-marathon-2026'];

function EventDetailPage() {
  const { slug = '' } = useParams();
  const ev = eventData[slug] ?? defaultEvent;

  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              <Flag size={16} /> {ev.venue}
            </span>
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
              { label: 'Categories', value: `${ev.categories.length} races`, icon: <Flag size={20} color="var(--color-accent)" /> },
              { label: 'Participants', value: `${ev.participants.toLocaleString()}+`, icon: <Users size={20} color="var(--color-accent)" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                {icon}
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Description */}
      <Section tone="light">
        <Container style={{ maxWidth: '800px' }}>
          <Heading level={2}>About the Event</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.8, marginTop: '1.25rem', fontSize: '1.0625rem' }}>{ev.description}</p>
        </Container>
      </Section>

      {/* Race categories */}
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

      {/* Sponsors */}
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

      {/* CTAs */}
      <Section tone="alt" style={{ padding: '2.5rem 0' }}>
        <Container>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="lg" href={`/events/${slug}/results`}>View Results</Button>
            <Button variant="secondary" size="lg" href="/contact">Register Now</Button>
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}

export default EventDetailPage;
