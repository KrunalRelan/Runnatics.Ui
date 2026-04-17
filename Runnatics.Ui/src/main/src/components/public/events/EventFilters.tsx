import { Search } from 'lucide-react';
import { Container } from '../ui';

interface EventFiltersProps {
  tab: 'upcoming' | 'past';
  city: string;
  search: string;
  availableCities: string[];
  onTabChange: (t: 'upcoming' | 'past') => void;
  onCityChange: (c: string) => void;
  onSearchChange: (s: string) => void;
}

function EventFilters({ tab, city, search, availableCities, onTabChange, onCityChange, onSearchChange }: EventFiltersProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: '64px',
        zIndex: 10,
        backgroundColor: '#fff',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            {(['upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: '0.9375rem',
                  background: tab === t ? 'var(--color-accent)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* City dropdown — only shown when cities are available */}
          {availableCities.length > 0 && (
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              aria-label="Filter by city"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events..."
              aria-label="Search events"
              style={{
                width: '100%',
                paddingLeft: '2.25rem',
                paddingRight: '0.75rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default EventFilters;
