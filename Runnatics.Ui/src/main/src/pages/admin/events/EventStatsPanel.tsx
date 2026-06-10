// ============================================================================
// File: pages/admin/events/EventStatsPanel.tsx
// Purpose: BUG-23 — event-level dashboard stats (Total / Started / Finished / DNF)
//          with a progress pie chart. Consumes DashboardService.getEventStats.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { DashboardStatsDto } from '../../../models/Dashboard/DashboardStatsDto';
import { DashboardService } from '../../../services/DashboardService';

const PIE_COLORS = ['#4CAF50', '#2196F3', '#f44336']; // Finished, Yet to finish, DNF/Not started

interface EventStatsPanelProps {
  eventId: string;
}

const EventStatsPanel: React.FC<EventStatsPanelProps> = ({ eventId }) => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    DashboardService.getEventStats(eventId)
      .then((s) => { if (active) setStats(s); })
      .catch(() => { /* stats are non-critical — fail silently */ });
    return () => { active = false; };
  }, [eventId]);

  if (!stats) return null;

  // Non-overlapping pie slices that sum to total participants.
  const yetToFinish = Math.max(0, stats.totalParticipants - stats.totalFinished - stats.totalDnfOrNotStarted);
  const pieData = [
    { name: 'Finished', value: stats.totalFinished },
    { name: 'Yet to Finish', value: yetToFinish },
    { name: 'DNF / Not Started', value: stats.totalDnfOrNotStarted },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>Event Overview</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: 'Total Participants', value: stats.totalParticipants, color: '#1976d2' },
            { label: 'Started', value: stats.totalStarted, color: '#2196F3' },
            { label: 'Finished', value: stats.totalFinished, color: '#4CAF50' },
            { label: 'DNF / Not Started', value: stats.totalDnfOrNotStarted, color: '#f44336' },
          ].map((s) => (
            <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
              <Card sx={{ borderLeft: `4px solid ${s.color}` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">{s.label}</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {stats.totalParticipants > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EventStatsPanel;
