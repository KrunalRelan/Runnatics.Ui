import { useState } from 'react';
import { ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import type { ResultRow } from '../../../services/publicApi';

interface ResultsTableProps {
  results: ResultRow[];
}

function ResultsTable({ results }: ResultsTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <SearchX size={36} color="var(--color-text-muted)" />
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '1rem', margin: 0 }}>
          No results found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  const headers = ['Rank', 'Bib', 'Name', 'Race', 'Gender', 'Gun Time', 'Net Time', 'Cat Rank', 'Gen Rank', ''];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <>
              <tr
                key={r.bib}
                style={{ backgroundColor: i % 2 === 0 ? '#fff' : 'var(--color-bg-alt)', cursor: r.splits?.length > 0 ? 'pointer' : 'default' }}
                onClick={() => r.splits?.length > 0 && setExpanded(expanded === r.rank ? null : r.rank)}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: r.rank <= 3 ? 'var(--color-accent)' : 'var(--color-text)' }}>{r.rank}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{r.bib}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--color-text)' }}>{r.name}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{r.race}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{r.gender}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{r.gunTime}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--color-text)' }}>{r.netTime}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{r.catRank}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{r.genderRank}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {r.splits?.length > 0 && (expanded === r.rank ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </td>
              </tr>
              {expanded === r.rank && r.splits?.length > 0 && (
                <tr key={`${r.bib}-splits`} style={{ backgroundColor: '#EFF6FF' }}>
                  <td colSpan={10} style={{ padding: '1rem 2rem' }}>
                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', color: 'var(--color-primary)' }}>Splits</strong>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {r.splits.map((s) => (
                        <div key={s.checkpoint} style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{s.checkpoint}</div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{s.time}</div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>#{s.rank}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
