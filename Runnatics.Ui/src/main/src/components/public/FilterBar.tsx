import { Search } from 'lucide-react';
import { Container } from './ui';

interface FilterBarProps {
  search: string;
  race: string;
  gender: string;
  races: string[];
  onSearchChange: (v: string) => void;
  onRaceChange: (v: string) => void;
  onGenderChange: (v: string) => void;
}

const pillInput: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  padding: '0.5rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: '9999px',
  backgroundColor: '#fff',
  color: 'var(--color-text)',
  outline: 'none',
  cursor: 'pointer',
};

function FilterBar({
  search,
  race,
  gender,
  races,
  onSearchChange,
  onRaceChange,
  onGenderChange,
}: FilterBarProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Container>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or BIB..."
              aria-label="Search results"
              style={{ ...pillInput, paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Race / Category */}
          <select
            value={race}
            onChange={(e) => onRaceChange(e.target.value)}
            aria-label="Filter by race"
            style={pillInput}
          >
            {['All', ...races].map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Races' : r}
              </option>
            ))}
          </select>

          {/* Gender */}
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            aria-label="Filter by gender"
            style={pillInput}
          >
            <option value="All">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
      </Container>
    </div>
  );
}

export default FilterBar;
