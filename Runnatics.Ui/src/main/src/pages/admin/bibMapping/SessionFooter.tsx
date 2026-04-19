import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Download } from 'lucide-react';
import type { MappingRow, SessionStats } from './BibMapping.types';
import { formatRelative } from './relativeTime';

interface Props {
  rows: MappingRow[];
  stats: SessionStats;
  progress: { mapped: number; total: number; percent: number };
  raceId: string;
}

function toCsv(rows: MappingRow[]): string {
  const header = ['BIB', 'Name', 'EPC', 'MappedAt', 'Status'];
  const esc = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        esc(r.bibNumber),
        esc(r.name),
        esc(r.epc ?? ''),
        esc(r.createdAt ?? ''),
        esc(r.status),
      ].join(','),
    );
  }
  return lines.join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const SessionFooter: React.FC<Props> = ({ rows, stats, progress, raceId }) => {
  // Force a re-render once per second so the "last scanned" label stays live.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!stats.lastScanned) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [stats.lastScanned]);

  const handleExport = () => {
    const csv = toCsv(rows);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCsv(`bib-mappings-${raceId}-${ts}.csv`, csv);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        p: 1.5,
        mt: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2">
        <strong>Mapped this session:</strong> {stats.mappedThisSession}
      </Typography>
      <Typography variant="body2">
        <strong>Total mapped:</strong> {progress.mapped}/{progress.total} ({progress.percent}%)
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {stats.lastScanned ? (
          <>
            <strong>Last scanned:</strong> BIB #{stats.lastScanned.bib} {formatRelative(stats.lastScanned.time)}
          </>
        ) : (
          <em>No scans yet this session</em>
        )}
      </Typography>
      {stats.duplicateAttempts > 0 && (
        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
          Duplicate attempts: {stats.duplicateAttempts}
        </Typography>
      )}
      <Box sx={{ flex: 1 }} />
      <Button
        onClick={handleExport}
        variant="outlined"
        size="small"
        startIcon={<Download size={16} />}
        disabled={rows.length === 0}
      >
        Export mapping report
      </Button>
    </Paper>
  );
};

export default SessionFooter;
