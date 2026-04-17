import { Calendar, MapPin, Activity } from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import type { PublicEvent } from '../../../services/publicApi';

interface EventCardProps {
  event: PublicEvent;
}

function EventCard({ event }: EventCardProps) {
  return (
    <Card>
      <div style={{ aspectRatio: '16/9', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Activity size={36} color="#9CA3AF" />
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
