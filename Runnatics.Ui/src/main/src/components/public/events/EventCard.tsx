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
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'box-shadow 0.3s, transform 0.3s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.14)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Banner image — constrained to 3:4 inside card */}
        <div
          style={{
            width: '100%',
            aspectRatio: '3/4',
            overflow: 'hidden',
            backgroundColor: '#E5E7EB',
            flexShrink: 0,
          }}
        >
          {event.bannerBase64 ? (
            <img
              src={base64ToDataUrl(event.bannerBase64)}
              alt={event.name}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#9CA3AF', textAlign: 'center' }}>
                {event.name}
              </span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div
          style={{
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* Event name — max 2 lines */}
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.875rem',
              margin: '0 0 0.5rem',
              color: 'var(--color-text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}
          >
            {event.name}
          </h3>

          {/* Date + City */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <Calendar size={11} /> {event.date}
            </span>
            {event.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <MapPin size={11} /> {event.city}
              </span>
            )}
          </div>

          {/* Distance chips */}
          {event.categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {event.categories.map((cat) => (
                <span
                  key={cat}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Spacer — pushes button to bottom */}
          <div style={{ flex: 1 }} />

          {/* View Result button */}
          {event.hasPublishedResults && (
            <a
              href={`/events/${event.slug}/results`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                width: '100%',
                padding: '0.4375rem 1rem',
                border: '1px solid var(--color-accent)',
                borderRadius: '9999px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
                textDecoration: 'none',
                marginTop: '0.5rem',
                boxSizing: 'border-box',
                transition: 'background-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-accent)';
                (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
              }}
            >
              View Result →
            </a>
          )}
        </div>
      </div>
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
