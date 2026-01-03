import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Grid,
  Button,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  EmojiEvents,
  Speed,
  Timer,
  TrendingUp,
  DirectionsRun,
  Flag,
  LocationOn,
  AccessTime,
  Male,
  Female,
  Category,
  Star,
  LocalFireDepartment,
  Timeline,
  CheckCircle,
  PlayArrow,
  Person,
} from "@mui/icons-material";
import PageContainer from "@/main/src/components/PageContainer";
import { ParticipantDetailData, Split } from "@/main/src/models/participants";

// Mock data for demonstration
const mockParticipantData: ParticipantDetailData = {
  id: "p-001",
  bib: "1042",
  firstName: "Rahul",
  lastName: "Sharma",
  fullName: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  gender: "Male",
  category: "M35-39",
  age: 37,
  nationality: "India",
  club: "Delhi Runners Club",
  raceName: "Half Marathon",
  raceDistance: 21.1,
  eventName: "Mumbai Marathon 2026",
  status: "Finished",
  startTime: "2026-01-03T06:00:00",
  finishTime: "2026-01-03T07:52:34",
  chipTime: "01:52:34",
  gunTime: "01:53:12",
  lastCheckpoint: "Finish Line",
  lastCheckpointTime: "07:52:34",
  currentPace: "5:20/km",
  performance: {
    averageSpeed: 11.25,
    averagePace: "5:20/km",
    maxSpeed: 14.2,
    minPace: "4:45/km",
    overallRank: 156,
    genderRank: 142,
    categoryRank: 28,
    overallCategoryRank: 45,
    totalParticipants: 2450,
    genderParticipants: 1890,
    categoryParticipants: 312,
  },
  splits: [
    {
      checkpointId: "cp-1",
      checkpointName: "5K",
      distance: 5,
      splitTime: "00:25:30",
      cumulativeTime: "00:25:30",
      pace: "5:06/km",
      speed: 11.76,
      rank: 198,
      genderRank: 182,
      categoryRank: 38,
    },
    {
      checkpointId: "cp-2",
      checkpointName: "10K",
      distance: 10,
      splitTime: "00:26:00",
      cumulativeTime: "00:51:30",
      pace: "5:12/km",
      speed: 11.54,
      rank: 185,
      genderRank: 168,
      categoryRank: 35,
    },
    {
      checkpointId: "cp-3",
      checkpointName: "15K",
      distance: 15,
      splitTime: "00:27:30",
      cumulativeTime: "01:19:00",
      pace: "5:30/km",
      speed: 10.91,
      rank: 172,
      genderRank: 158,
      categoryRank: 31,
    },
    {
      checkpointId: "cp-4",
      checkpointName: "20K",
      distance: 20,
      splitTime: "00:28:15",
      cumulativeTime: "01:47:15",
      pace: "5:39/km",
      speed: 10.62,
      rank: 162,
      genderRank: 148,
      categoryRank: 29,
    },
    {
      checkpointId: "cp-5",
      checkpointName: "Finish",
      distance: 21.1,
      splitTime: "00:05:19",
      cumulativeTime: "01:52:34",
      pace: "4:50/km",
      speed: 12.41,
      rank: 156,
      genderRank: 142,
      categoryRank: 28,
    },
  ],
};

// Professional Color Palette
const getColorPalette = (isDark: boolean) => ({
  // Primary brand colors
  primary: {
    main: isDark ? '#60A5FA' : '#2563EB',
    light: isDark ? '#93C5FD' : '#3B82F6',
    dark: isDark ? '#3B82F6' : '#1D4ED8',
  },
  
  // Semantic colors
  success: {
    main: isDark ? '#34D399' : '#10B981',
    light: isDark ? '#6EE7B7' : '#34D399',
    dark: isDark ? '#10B981' : '#059669',
  },
  
  warning: {
    main: isDark ? '#FBBF24' : '#F59E0B',
    light: isDark ? '#FCD34D' : '#FBBF24',
    dark: isDark ? '#F59E0B' : '#D97706',
  },
  
  error: {
    main: isDark ? '#F87171' : '#EF4444',
    light: isDark ? '#FCA5A5' : '#F87171',
    dark: isDark ? '#EF4444' : '#DC2626',
  },
  
  // Specialty colors for metrics
  speed: {
    main: isDark ? '#A78BFA' : '#8B5CF6',
    light: isDark ? '#C4B5FD' : '#A78BFA',
    dark: isDark ? '#8B5CF6' : '#7C3AED',
  },
  
  pace: {
    main: isDark ? '#2DD4BF' : '#14B8A6',
    light: isDark ? '#5EEAD4' : '#2DD4BF',
    dark: isDark ? '#14B8A6' : '#0D9488',
  },
  
  rank: {
    main: isDark ? '#60A5FA' : '#3B82F6',
    light: isDark ? '#93C5FD' : '#60A5FA',
    dark: isDark ? '#3B82F6' : '#2563EB',
  },
  
  gender: {
    male: isDark ? '#60A5FA' : '#3B82F6',
    female: isDark ? '#F472B6' : '#EC4899',
  },
  
  // Background colors
  background: {
    paper: isDark ? '#1E293B' : '#FFFFFF',
    default: isDark ? '#0F172A' : '#F8FAFC',
    elevated: isDark ? '#334155' : '#FFFFFF',
    subtle: isDark ? alpha('#1E293B', 0.6) : '#F1F5F9',
  },
  
  // Border colors
  border: {
    main: isDark ? alpha('#60A5FA', 0.2) : alpha('#CBD5E1', 1),
    light: isDark ? alpha('#475569', 0.5) : alpha('#E2E8F0', 1),
    focus: isDark ? alpha('#60A5FA', 0.5) : alpha('#3B82F6', 0.5),
  },
  
  // Text colors
  text: {
    primary: isDark ? '#F1F5F9' : '#0F172A',
    secondary: isDark ? '#94A3B8' : '#64748B',
    disabled: isDark ? '#475569' : '#CBD5E1',
  },
  
  // Chart colors
  chart: {
    gradient1: isDark ? ['#60A5FA', '#3B82F6'] : ['#3B82F6', '#2563EB'],
    gradient2: isDark ? ['#34D399', '#10B981'] : ['#10B981', '#059669'],
    gradient3: isDark ? ['#A78BFA', '#8B5CF6'] : ['#8B5CF6', '#7C3AED'],
    gradient4: isDark ? ['#FBBF24', '#F59E0B'] : ['#F59E0B', '#D97706'],
  },
});

// Status badge component
const StatusBadge: React.FC<{ status: ParticipantDetailData["status"] }> = ({
  status,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColorPalette(isDark);
  
  const statusConfig: Record<
    string,
    { color: any; icon: React.ReactNode; bgColor: string }
  > = {
    Running: { 
      color: colors.primary.main, 
      icon: <DirectionsRun fontSize="small" />,
      bgColor: alpha(colors.primary.main, 0.15)
    },
    Finished: { 
      color: colors.success.main, 
      icon: <CheckCircle fontSize="small" />,
      bgColor: alpha(colors.success.main, 0.15)
    },
    DNF: { 
      color: colors.error.main, 
      icon: <Flag fontSize="small" />,
      bgColor: alpha(colors.error.main, 0.15)
    },
    DNS: { 
      color: colors.warning.main, 
      icon: <PlayArrow fontSize="small" />,
      bgColor: alpha(colors.warning.main, 0.15)
    },
    Registered: { 
      color: colors.text.secondary, 
      icon: <Person fontSize="small" />,
      bgColor: alpha(colors.text.secondary, 0.15)
    },
  };

  const config = statusConfig[status] || statusConfig.Registered;

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={status}
      sx={{
        fontWeight: 600,
        fontSize: "0.875rem",
        height: 32,
        bgcolor: config.bgColor,
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.3)}`,
        "& .MuiChip-icon": {
          marginLeft: "8px",
          color: config.color,
        },
      }}
    />
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "neutral";
  isDark?: boolean;
}> = ({ title, value, subtitle, icon, color, isDark }) => {
  const colors = getColorPalette(isDark || false);
  
  return (
    <Card
      sx={{
        height: "100%",
        background: colors.background.paper,
        border: `1px solid ${colors.border.light}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '12px',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark 
            ? `0 12px 40px ${alpha(color, 0.25)}, 0 0 0 1px ${alpha(color, 0.1)}`
            : `0 12px 40px ${alpha(color, 0.2)}`,
          borderColor: alpha(color, 0.6),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                fontSize: '0.7rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: color,
                mt: 1,
                mb: 0.5,
                letterSpacing: '-0.5px',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.text.secondary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              backgroundColor: alpha(color, isDark ? 0.15 : 0.12),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(color, isDark ? 0.2 : 0.15)}`,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Rank Display Component
const RankDisplay: React.FC<{
  rank: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  isDark?: boolean;
}> = ({ rank, total, label, icon, color, isDark }) => {
  const percentile = ((total - rank) / total) * 100;
  const colors = getColorPalette(isDark || false);

  return (
    <Box sx={{ textAlign: "center", p: 2.5 }}>
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.2 : 0.15)} 0%, ${alpha(
            color,
            isDark ? 0.05 : 0.08
          )} 100%)`,
          border: `3px solid ${color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          position: "relative",
          boxShadow: `0 8px 24px ${alpha(color, isDark ? 0.25 : 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 12px 32px ${alpha(color, isDark ? 0.35 : 0.3)}`,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: color, lineHeight: 1 }}>
          #{rank}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: colors.text.secondary, 
            fontSize: "0.65rem",
            fontWeight: 600,
            mt: 0.5,
          }}
        >
          of {total}
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
          {label}
        </Typography>
      </Stack>
      <Box sx={{ mt: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={percentile}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(color, isDark ? 0.15 : 0.15),
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            },
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: colors.text.secondary,
            fontWeight: 600,
            mt: 0.5,
            display: 'block',
          }}
        >
          Top {(100 - percentile).toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  );
};

const ParticipantDetail: React.FC = () => {
  const { eventId, raceId, participantId: _participantId } = useParams<{
    eventId: string;
    raceId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColorPalette(isDark);

  // In real implementation, fetch data from API using participantId
  // For now using mock data
  const [participant] = useState<ParticipantDetailData>(mockParticipantData);

  const handleBack = () => {
    if (eventId && raceId) {
      navigate(`/events/event-details/${eventId}/race/${raceId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ 
            mb: 3,
            borderColor: colors.border.main,
            color: colors.text.primary,
            '&:hover': {
              borderColor: colors.primary.main,
              bgcolor: alpha(colors.primary.main, 0.08),
            },
          }}
        >
          Back to Participants
        </Button>

        {/* Participant Header Card */}
        <Card
          sx={{
            background: isDark 
              ? `linear-gradient(135deg, #1E293B 0%, #0F172A 100%)`
              : `linear-gradient(135deg, #1E40AF 0%, #1E3A8A 50%, #1E293B 100%)`,
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: '16px',
            border: isDark ? `1px solid ${alpha('#60A5FA', 0.2)}` : 'none',
            boxShadow: isDark 
              ? `0 8px 32px ${alpha('#000', 0.4)}`
              : `0 8px 32px ${alpha('#1E3A8A', 0.5)}`,
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: isDark 
                ? `radial-gradient(circle, ${alpha('#60A5FA', 0.15)} 0%, transparent 70%)`
                : `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -50,
              right: 120,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: isDark 
                ? `radial-gradient(circle, ${alpha('#34D399', 0.12)} 0%, transparent 70%)`
                : `radial-gradient(circle, ${alpha('#fff', 0.08)} 0%, transparent 70%)`,
            }}
          />

          <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
            {/* Top Section */}
            <Grid container spacing={3} alignItems="center">
              {/* Avatar and Bib */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 110,
                      height: 110,
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${alpha('#fff', 0.25)} 0%, ${alpha('#fff', 0.15)} 100%)`,
                      border: "4px solid white",
                      boxShadow: `0 8px 24px ${alpha('#000', 0.3)}`,
                    }}
                  >
                    {participant.firstName[0]}
                    {participant.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha("#fff", 0.7),
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      Bib Number
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 900,
                        lineHeight: 1,
                        textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                        letterSpacing: '-1px',
                      }}
                    >
                      #{participant.bib}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Name and Details */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1.5,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {participant.fullName}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  <Chip
                    icon={participant.gender === "Male" ? <Male /> : <Female />}
                    label={`${participant.gender}, ${participant.age} yrs`}
                    size="small"
                    sx={{
                      bgcolor: alpha("#fff", 0.25),
                      color: "white",
                      border: `1px solid ${alpha('#fff', 0.3)}`,
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                  <Chip
                    icon={<Category />}
                    label={participant.category}
                    size="small"
                    sx={{
                      bgcolor: alpha("#fff", 0.25),
                      color: "white",
                      border: `1px solid ${alpha('#fff', 0.3)}`,
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                  {participant.club && (
                    <Chip
                      icon={<Star />}
                      label={participant.club}
                      size="small"
                      sx={{
                        bgcolor: alpha("#fff", 0.25),
                        color: "white",
                        border: `1px solid ${alpha('#fff', 0.3)}`,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: "white" },
                      }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Flag sx={{ fontSize: 18, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ color: alpha("#fff", 0.95), fontWeight: 500 }}>
                    {participant.eventName} • {participant.raceName} ({participant.raceDistance}K)
                  </Typography>
                </Stack>
              </Grid>

              {/* Status and Chip Time */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <StatusBadge status={participant.status} />
                  {participant.chipTime && (
                    <Box sx={{ mt: 2.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: alpha("#fff", 0.7), 
                          display: "block",
                          letterSpacing: '1px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        Chip Time
                      </Typography>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          letterSpacing: 3,
                          textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        {participant.chipTime}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Divider */}
            <Divider sx={{ my: 3, borderColor: alpha("#fff", 0.25) }} />

            {/* Bottom Section */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: alpha("#fff", 0.6), 
                    textTransform: "uppercase", 
                    letterSpacing: 0.8,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.email}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: alpha("#fff", 0.6), 
                    textTransform: "uppercase", 
                    letterSpacing: 0.8,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: alpha("#fff", 0.6), 
                    textTransform: "uppercase", 
                    letterSpacing: 0.8,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Nationality
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.nationality}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: alpha("#fff", 0.6), 
                    textTransform: "uppercase", 
                    letterSpacing: 0.8,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Gun Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.gunTime || "-"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Overview */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 2.5,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        Performance Overview
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Speed"
            value={`${participant.performance.averageSpeed}`}
            subtitle="km/h"
            icon={<Speed sx={{ fontSize: 28 }} />}
            color={colors.speed.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Pace"
            value={participant.performance.averagePace}
            subtitle="min/km"
            icon={<Timer sx={{ fontSize: 28 }} />}
            color={colors.pace.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Max Speed"
            value={`${participant.performance.maxSpeed}`}
            subtitle="km/h"
            icon={<LocalFireDepartment sx={{ fontSize: 28 }} />}
            color={colors.warning.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Best Pace"
            value={participant.performance.minPace}
            subtitle="min/km"
            icon={<TrendingUp sx={{ fontSize: 28 }} />}
            color={colors.success.main}
            isDark={isDark}
          />
        </Grid>
      </Grid>

      {/* Rankings Section */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 2.5,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        Rankings
      </Typography>
      <Card sx={{ 
        mb: 4,
        border: `1px solid ${colors.border.light}`,
        background: colors.background.paper,
        borderRadius: '12px',
        boxShadow: isDark 
          ? `0 4px 20px ${alpha('#000', 0.3)}`
          : `0 2px 12px ${alpha('#000', 0.08)}`,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            divider={
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ borderColor: colors.border.light }}
              />
            }
            sx={{ justifyContent: 'space-around' }}
          >
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.performance.overallRank}
                total={participant.performance.totalParticipants}
                label="Overall"
                icon={<EmojiEvents sx={{ fontSize: 16, color: colors.warning.main }} />}
                color={colors.rank.main}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.performance.genderRank}
                total={participant.performance.genderParticipants}
                label={`${participant.gender}`}
                icon={
                  participant.gender === "Male" ? (
                    <Male sx={{ fontSize: 16, color: colors.gender.male }} />
                  ) : (
                    <Female sx={{ fontSize: 16, color: colors.gender.female }} />
                  )
                }
                color={participant.gender === "Male" ? colors.gender.male : colors.gender.female}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.performance.categoryRank}
                total={participant.performance.categoryParticipants}
                label={participant.category}
                icon={<Category sx={{ fontSize: 16, color: colors.pace.main }} />}
                color={colors.pace.main}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.performance.overallCategoryRank}
                total={Math.floor(participant.performance.totalParticipants * 0.4)}
                label="All Categories"
                icon={<Star sx={{ fontSize: 16, color: colors.warning.main }} />}
                color={colors.warning.main}
                isDark={isDark}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Splits Table */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 2.5,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        <Timeline sx={{ mr: 1, verticalAlign: "middle" }} />
        Split Times & Checkpoint Analysis
      </Typography>
      <Card sx={{ 
        mb: 4,
        border: `1px solid ${colors.border.light}`,
        background: colors.background.paper,
        borderRadius: '12px',
        boxShadow: isDark 
          ? `0 4px 20px ${alpha('#000', 0.3)}`
          : `0 2px 12px ${alpha('#000', 0.08)}`,
        overflow: 'hidden',
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(colors.primary.main, isDark ? 0.1 : 0.06),
                }}
              >
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Checkpoint</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Distance</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Split Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Cumulative</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Pace</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Speed</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Overall Rank
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Gender Rank
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Category Rank
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participant.splits.map((split: Split, index: number) => {
                const prevPace =
                  index > 0
                    ? parseFloat(participant.splits[index - 1].pace.replace("/km", "").replace(":", "."))
                    : null;
                const currentPace = parseFloat(split.pace.replace("/km", "").replace(":", "."));
                const paceImproved = prevPace !== null && currentPace < prevPace;
                const paceSlowed = prevPace !== null && currentPace > prevPace;

                return (
                  <TableRow
                    key={split.checkpointId}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(colors.primary.main, 0.05),
                      },
                      bgcolor: index === participant.splits.length - 1 
                        ? alpha(colors.success.main, isDark ? 0.1 : 0.06) 
                        : "inherit",
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOn
                          sx={{
                            fontSize: 18,
                            color:
                              index === participant.splits.length - 1
                                ? colors.success.main
                                : colors.pace.main,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {split.checkpointName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {split.distance} km
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {split.splitTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color:
                            index === participant.splits.length - 1
                              ? colors.success.main
                              : colors.text.primary,
                        }}
                      >
                        {split.cumulativeTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: paceImproved
                              ? colors.success.main
                              : paceSlowed
                              ? colors.error.main
                              : colors.text.primary,
                            fontWeight: 600,
                          }}
                        >
                          {split.pace}
                        </Typography>
                        {paceImproved && (
                          <TrendingUp sx={{ fontSize: 14, color: colors.success.main }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {split.speed.toFixed(1)} km/h
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`#${split.rank}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(colors.rank.main, isDark ? 0.2 : 0.1),
                          color: colors.rank.main,
                          border: `1px solid ${alpha(colors.rank.main, 0.3)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`#${split.genderRank}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(colors.primary.main, isDark ? 0.2 : 0.1),
                          color: colors.primary.main,
                          border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`#${split.categoryRank}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(colors.pace.main, isDark ? 0.2 : 0.1),
                          color: colors.pace.main,
                          border: `1px solid ${alpha(colors.pace.main, 0.3)}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pace Chart Visualization */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 2.5,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        Pace Progression
      </Typography>
      <Card sx={{ 
        mb: 4,
        border: `1px solid ${colors.border.light}`,
        background: colors.background.paper,
        borderRadius: '12px',
        boxShadow: isDark 
          ? `0 4px 20px ${alpha('#000', 0.3)}`
          : `0 2px 12px ${alpha('#000', 0.08)}`,
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* Pace values display */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {participant.splits.map((split: Split, index: number) => {
              const prevPace = index > 0 
                ? parseFloat(participant.splits[index - 1].pace.replace("/km", "").replace(":", "."))
                : null;
              const currentPace = parseFloat(split.pace.replace("/km", "").replace(":", "."));
              const isFaster = prevPace !== null && currentPace < prevPace;
              const isSlower = prevPace !== null && currentPace > prevPace;
              
              return (
                <Box
                  key={split.checkpointId}
                  sx={{
                    flex: 1,
                    minWidth: 100,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: colors.background.subtle,
                    border: `1px solid ${
                      index === participant.splits.length - 1 
                        ? alpha(colors.success.main, 0.5)
                        : colors.border.light
                    }`,
                    borderLeft: `4px solid ${
                      index === participant.splits.length - 1 
                        ? colors.success.main
                        : isFaster 
                          ? colors.success.main 
                          : isSlower 
                            ? colors.error.main 
                            : colors.pace.main
                    }`,
                    textAlign: "center",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 20px ${alpha('#000', isDark ? 0.3 : 0.12)}`,
                    },
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.text.secondary,
                      display: "block", 
                      mb: 0.5,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {split.checkpointName}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800,
                      color: isFaster 
                        ? colors.success.main 
                        : isSlower 
                          ? colors.error.main 
                          : colors.pace.main,
                      letterSpacing: '1px',
                    }}
                  >
                    {split.pace}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {split.speed} km/h
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Visual Bar Chart */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "flex-end", 
            gap: 2, 
            height: 200, 
            px: 3,
            py: 3,
            bgcolor: colors.background.subtle,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
          }}>
            {participant.splits.map((split: Split, index: number) => {
              const paceParts = split.pace.replace("/km", "").split(":");
              const paceMinutes = parseInt(paceParts[0]) + parseInt(paceParts[1]) / 60;
              
              const minPace = 4.5;
              const maxPace = 6.0;
              const clampedPace = Math.max(minPace, Math.min(maxPace, paceMinutes));
              const barHeight = ((maxPace - clampedPace) / (maxPace - minPace)) * 100;
              const finalHeight = Math.max(20, barHeight);

              return (
                <Tooltip
                  key={split.checkpointId}
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {split.checkpointName} ({split.distance}km)
                      </Typography>
                      <Typography variant="caption" display="block">Pace: {split.pace}</Typography>
                      <Typography variant="caption" display="block">Speed: {split.speed} km/h</Typography>
                      <Typography variant="caption" display="block">Split: {split.splitTime}</Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        color: index === participant.splits.length - 1 
                          ? colors.success.main 
                          : colors.primary.main,
                        fontSize: '0.75rem',
                      }}
                    >
                      {split.pace.replace("/km", "")}
                    </Typography>
                    
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 60,
                        height: `${finalHeight}%`,
                        minHeight: 40,
                        background: index === participant.splits.length - 1
                          ? `linear-gradient(180deg, ${colors.success.main} 0%, ${colors.success.light} 100%)`
                          : `linear-gradient(180deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                        borderRadius: "10px 10px 0 0",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        boxShadow: `0 -4px 12px ${alpha(
                          index === participant.splits.length - 1
                            ? colors.success.main
                            : colors.primary.main,
                          0.3
                        )}`,
                        "&:hover": {
                          transform: "scaleY(1.05) scaleX(1.1)",
                          transformOrigin: "bottom",
                          boxShadow: `0 -8px 24px ${alpha(
                            index === participant.splits.length - 1
                              ? colors.success.main
                              : colors.primary.main,
                            0.5
                          )}`,
                        },
                      }}
                    />
                    
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textAlign: "center",
                        fontSize: "0.7rem",
                        mt: 1.5,
                      }}
                    >
                      {split.checkpointName}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
          
          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              pt: 2.5,
              borderTop: `1px solid ${colors.border.light}`,
            }}
          >
            <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
              <AccessTime sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
              Start: {new Date(participant.startTime).toLocaleTimeString()}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.text.secondary,
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              Taller bars = Faster pace
            </Typography>
            {participant.finishTime && (
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                <Flag sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                Finish: {new Date(participant.finishTime).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ParticipantDetail;