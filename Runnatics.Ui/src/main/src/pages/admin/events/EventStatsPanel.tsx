// ============================================================================
// File: pages/admin/events/EventStatsPanel.tsx
// Purpose: Numeric dashboard for the event -> races landing page. Replaces the
//          old progress pie chart entirely.
//            TOP    — event-level headline totals
//            BELOW  — one clickable tile per race with that race's own numbers
//
// Every count comes from ONE call to DashboardService.getEventRaceBreakdown;
// the server does the grouping, so there is no request-per-race fan-out.
// Statuses derive from the STORED Results.Status the grid / export / public site
// read, surfaced as OK / DNF / DNS / DSQ — NOT the legacy Participant.Status.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Card, CardContent, CircularProgress, Typography, alpha, useTheme } from '@mui/material';
import { DashboardService } from '../../../services/DashboardService';
import { EventRaceCounts } from '../../../models/Dashboard/EventRaceBreakdown';

interface EventStatsPanelProps {
  eventId: string;
}

// Neutral (slate) for the "nothing has happened yet" buckets — unmapped and
// unprocessed are absence-of-data, not outcomes, so they must not read as alarms.
const NEUTRAL = '#64748B';

const METRICS: { key: keyof EventRaceCounts; label: string; color: string }[] = [
  { key: 'registered',   label: 'Participants',  color: '#2563EB' },
  { key: 'epcMapped',    label: 'EPC Mapped',    color: '#0891B2' },
  { key: 'epcNotMapped', label: 'Not Mapped',    color: NEUTRAL },
  { key: 'finishedOk',   label: 'Finished (OK)', color: '#16A34A' },
  { key: 'dnf',          label: 'DNF',           color: '#D97706' },
  { key: 'dns',          label: 'DNS',           color: '#6B7280' },
  { key: 'dsq',          label: 'DSQ',           color: '#DC2626' },
  { key: 'notProcessed', label: 'Not Processed', color: NEUTRAL },
];

// One metric: big scannable figure over a small caption. `compact` is the
// in-tile variant; the event-level row uses the larger default.
const MetricCell: React.FC<{ label: string; value: number; color: string; compact?: boolean }> = ({
  label, value, color, compact,
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        color,
        fontWeight: 800,
        lineHeight: 1.1,
        fontSize: compact ? '1.375rem' : '2rem',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: compact ? '0.6rem' : '0.65rem',
        display: 'block',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Zero is a real, meaningful value here — a race with no participants shows
// eight zeros, never blanks or dashes.
const MetricGrid: React.FC<{ counts: EventRaceCounts; compact?: boolean }> = ({ counts, compact }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(4, 1fr)',
        md: compact ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)',
      },
      gap: compact ? 1.5 : 2,
    }}
  >
    {METRICS.map((m) => (
      <MetricCell key={m.key} label={m.label} value={counts[m.key] ?? 0} color={m.color} compact={compact} />
    ))}
  </Box>
);

const EventStatsPanel: React.FC<EventStatsPanelProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event-race-breakdown', eventId],
    queryFn: () => DashboardService.getEventRaceBreakdown(eventId),
    enabled: !!eventId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="warning">Event statistics are unavailable right now.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* ── TOP: event-level headline totals ── */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Event Overview
        </Typography>
        <Box sx={{ mb: 3 }}>
          <MetricGrid counts={data.totals} />
        </Box>

        {/* ── BELOW: one tile per race ── */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 0.8, display: 'block', mb: 1.5,
          }}
        >
          By Race
        </Typography>

        {data.raceStats.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No races have been added to this event yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {data.raceStats.map((race) => (
              <Card
                key={race.raceId}
                variant="outlined"
                onClick={() => navigate(`/events/event-details/${eventId}/race/${race.raceId}`)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'background-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03),
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    {race.raceName}
                  </Typography>
                  <MetricGrid counts={race.counts} compact />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EventStatsPanel;
