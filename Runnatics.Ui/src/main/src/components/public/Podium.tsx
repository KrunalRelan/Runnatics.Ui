import type { ResultRow } from '../../services/publicApi';

interface PodiumProps {
  top3: ResultRow[];
  showMedal: boolean;
  timeLabel: string;
}

const POSITIONS = [
  { idx: 1, label: '2nd', color: '#C0C0C0', textColor: '#4A4A4A', barHeight: '80px', medal: '🥈' },
  { idx: 0, label: '1st', color: '#FFD700', textColor: '#7C5A00', barHeight: '104px', medal: '🥇' },
  { idx: 2, label: '3rd', color: '#CD7F32', textColor: '#5C3000', barHeight: '64px', medal: '🥉' },
];

function Podium({ top3, showMedal, timeLabel }: PodiumProps) {
  if (top3.length < 3) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        backgroundColor: 'var(--color-bg-alt)',
        borderRadius: '0 0 10px 10px',
        marginBottom: '1.5rem',
      }}
    >
      {POSITIONS.map(({ idx, label, color, textColor, barHeight, medal }) => {
        const r = top3[idx];
        const time = timeLabel === 'Net Time' ? r.netTime : r.gunTime;
        return (
          <div
            key={label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.375rem',
              maxWidth: '200px',
            }}
          >
            {showMedal && (
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{medal}</span>
            )}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {r.participantName}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              BIB {r.bibNumber}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
              }}
            >
              {time ?? '—'}
            </div>
            <div
              style={{
                width: '100%',
                backgroundColor: color,
                borderRadius: '6px 6px 0 0',
                height: barHeight,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '0.5rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: textColor,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Podium;
