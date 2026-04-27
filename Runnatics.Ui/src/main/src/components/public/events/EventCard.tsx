import { Calendar, MapPin, Activity } from 'lucide-react';
import { base64ToDataUrl } from '../../../utility';
import { Badge, Button, Card } from '../ui';
import type { PublicEvent } from '../../../services/publicApi';

interface EventCardProps {
  event: PublicEvent;
  portrait?: boolean;
}

function EventCard({ event, portrait }: EventCardProps) {
  if (portrait) {
    return (
      <a
        href={`/events/${event.slug}/results`}
        style={{
          display: 'block',
          textDecoration: 'none',
          position: 'relative',
          aspectRatio: '3/4',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#D1D5DB',
        }}
      >
        {event.bannerBase64 ? (
          <img
            src={base64ToDataUrl(event.bannerBase64)}
            alt={event.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            bottom: '0.875rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.92)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '0.375rem 1rem',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
            }}
          >
            View Result →
          </span>
        </div>
      </a>
    );
  }

  return (
    <Card>
      <div style={{ aspectRatio: '16/9', backgroundColor: '#E5E7EB', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {event.bannerBase64 ? (
          <img
            src={base64ToDataUrl(event.bannerBase64)}
            alt={event.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : (
          <Activity size={36} color="#9CA3AF" />
        )}
      </div>
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
          {event.name}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={12} /> {event.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={12} /> {event.city}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {event.categories.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
          {event.registrationOpen && <Badge variant="success">Reg Open</Badge>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" href={`/events/${event.slug}`}>
            View Details →
          </Button>
          {event.isPast && (
            <Button variant="outline" size="sm" href={`/events/${event.slug}/results`}>
              Results
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default EventCard;
