import { Search } from 'lucide-react';
import { Container } from '../ui';

interface ResultFiltersProps {
  search: string;
  race: string;
  gender: string;
  races: string[];
  onSearchChange: (s: string) => void;
  onRaceChange: (r: string) => void;
  onGenderChange: (g: string) => void;
}

function ResultFilters({ search, race, gender, races, onSearchChange, onRaceChange, onGenderChange }: ResultFiltersProps) {
  const inputStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: 'var(--color-text)',
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-alt)', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <Container>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or bib..."
              aria-label="Search results"
              style={{ ...inputStyle, paddingLeft: '2.25rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {/* Race */}
          <select value={race} onChange={(e) => onRaceChange(e.target.value)} aria-label="Filter by race" style={inputStyle}>
            {['All', ...races].map((r) => <option key={r} value={r}>{r === 'All' ? 'All Races' : r}</option>)}
          </select>
          {/* Gender */}
          <select value={gender} onChange={(e) => onGenderChange(e.target.value)} aria-label="Filter by gender" style={inputStyle}>
            {['All', 'M', 'F'].map((g) => <option key={g} value={g}>{g === 'All' ? 'All Genders' : g === 'M' ? 'Male' : 'Female'}</option>)}
          </select>
        </div>
      </Container>
    </div>
  );
}

export default ResultFilters;
