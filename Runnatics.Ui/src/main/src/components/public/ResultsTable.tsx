import type { ResultRow } from '../../services/publicApi';

interface ResultsTableProps {
  results: ResultRow[];
  startRank?: number;
  timeLabel: string;
  showSplitTimes: boolean;
  showPace: boolean;
}

const thStyle: React.CSSProperties = {
  padding: '0.875rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.875rem',
  backgroundColor: 'var(--color-primary)',
  color: '#fff',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.8rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};

function ResultsTable({
  results,
  startRank = 1,
  timeLabel,
  showSplitTimes,
  showPace,
}: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
        }}
      >
        No results found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr>
            <th style={thStyle}>Rank</th>
            <th style={thStyle}>BIB</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Race</th>
            <th style={thStyle}>Gender</th>
            <th style={thStyle}>{timeLabel}</th>
            {showSplitTimes && <th style={thStyle}>Splits</th>}
            {showPace && <th style={thStyle}>Pace</th>}
            <th style={thStyle}>Cat Rank</th>
            <th style={thStyle}>Gen Rank</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={`${r.bibNumber}-${i}`}
              style={{ backgroundColor: i % 2 === 0 ? '#fff' : 'var(--color-bg-alt)' }}
            >
              <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-accent)' }}>
                {r.overallRank ?? startRank + i}
              </td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{r.bibNumber}</td>
              <td style={tdStyle}>{r.participantName}</td>
              <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.raceName}</td>
              <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.gender ?? '—'}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>
                {(timeLabel === 'Net Time' ? r.netTime : r.gunTime) ?? '—'}
              </td>
              {showSplitTimes && (
                <td style={{ ...tdStyle, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {r.splits && r.splits.length > 0
                    ? r.splits.map((s) => `${s.checkpointName}: ${s.time}`).join(' · ')
                    : '—'}
                </td>
              )}
              {showPace && (
                <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>—</td>
              )}
              <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.categoryRank ?? '—'}</td>
              <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{r.genderRank ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
