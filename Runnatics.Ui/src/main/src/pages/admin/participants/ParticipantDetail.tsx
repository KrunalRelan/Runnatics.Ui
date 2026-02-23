import React, { useState, useEffect } from "react";
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
  CircularProgress,
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
  Warning,
  Nfc,
} from "@mui/icons-material";
import PageContainer from "@/main/src/components/PageContainer";
import { SplitTimeInfo, RfidReadingDetail, ParticipantDetailsResponse, CheckpointTime } from "@/main/src/models/participants";
import { ParticipantService } from "@/main/src/services";
import { getColorPalette } from "@/main/src/theme";

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({
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

// Helper function to convert pace string to minutes
const convertPaceToMinutes = (paceString: string): number => {
  // Format: "4:48/km" -> 4.8 minutes (4 + 48/60)
  const paceWithoutUnit = paceString.replace("/km", "");
  const [minutes, seconds] = paceWithoutUnit.split(":").map(part => parseInt(part, 10));
  return minutes + (seconds / 60);
};

const ParticipantDetail: React.FC = () => {
  const { eventId, raceId, participantId } = useParams<{
    eventId: string;
    raceId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColorPalette(isDark);

  const [participant, setParticipant] = useState<ParticipantDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchParticipantDetails = async () => {
      if (!eventId || !raceId || !participantId) {
        if (!isCancelled) {
          setError("Missing required parameters");
          setLoading(false);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setLoading(true);
        }
        const response = await ParticipantService.getParticipantDetails(eventId, raceId, participantId);
        
        if (isCancelled) return;
        
        if (response.data.message) {
          setParticipant(response.data.message);
          setError(null);
        } else {
          setError("Failed to load participant details");
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Error fetching participant details:", err);
        setError(err.response?.data?.message || "Failed to load participant details");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchParticipantDetails();
    
    return () => {
      isCancelled = true;
    };
  }, [eventId, raceId, participantId]);

  const handleBack = () => {
    if (eventId && raceId) {
      navigate(`/events/event-details/${eventId}/race/${raceId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !participant) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || "Participant not found"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Participants
          </Button>
        </Box>
      </PageContainer>
    );
  }

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
                    {participant.initials || `${participant.firstName?.[0] || ''}${participant.lastName?.[0] || ''}`}
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
                      #{participant.bibNumber}
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
                    icon={participant.gender === "M" || participant.gender === "Male" ? <Male /> : <Female />}
                    label={`${participant.gender === "M" ? "Male" : participant.gender === "F" ? "Female" : participant.gender}${participant.age ? `, ${participant.age} yrs` : ''}`}
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
                    label={participant.ageCategory || '-'}
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
                <StatusBadge status={participant.status || "Registered"} />
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
              <Grid size={{ xs: 6, md: 2.4 }}>
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
                  {participant.email || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
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
                  {participant.phone || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
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
                  Age Category
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.ageCategory || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
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
                  Net Time (Chip)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {participant.chipTime || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
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
            value={`${participant.performance?.averageSpeed ?? '-'}`}
            subtitle="km/h"
            icon={<Speed sx={{ fontSize: 28 }} />}
            color={colors.speed.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Pace"
            value={participant.performance?.averagePace || '-'}
            subtitle="min/km"
            icon={<Timer sx={{ fontSize: 28 }} />}
            color={colors.pace.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Max Speed"
            value={`${participant.performance?.maxSpeed ?? '-'}`}
            subtitle="km/h"
            icon={<LocalFireDepartment sx={{ fontSize: 28 }} />}
            color={colors.warning.main}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Best Pace"
            value={participant.performance?.bestPace || '-'}
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
                rank={participant.rankings?.overallRank || 0}
                total={participant.rankings?.totalParticipants || 0}
                label="Overall"
                icon={<EmojiEvents sx={{ fontSize: 16, color: colors.warning.main }} />}
                color={colors.rank.main}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.rankings?.genderRank || 0}
                total={participant.rankings?.totalInGender || 0}
                label={`${participant.gender === "M" ? "Male" : participant.gender === "F" ? "Female" : participant.gender || ''}`}
                icon={
                  participant.gender === "M" || participant.gender === "Male" ? (
                    <Male sx={{ fontSize: 16, color: colors.gender.male }} />
                  ) : (
                    <Female sx={{ fontSize: 16, color: colors.gender.female }} />
                  )
                }
                color={participant.gender === "M" || participant.gender === "Male" ? colors.gender.male : colors.gender.female}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.rankings?.categoryRank || 0}
                total={participant.rankings?.totalInCategory || 0}
                label={participant.ageCategory || '-'}
                icon={<Category sx={{ fontSize: 16, color: colors.pace.main }} />}
                color={colors.pace.main}
                isDark={isDark}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RankDisplay
                rank={participant.rankings?.allCategoriesRank || 0}
                total={participant.rankings?.totalAllCategories || 0}
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
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Time</TableCell>
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
              {(participant.splitTimes || []).map((split: SplitTimeInfo, index: number) => {
                const splits = participant.splitTimes || [];
                const prevPace =
                  index > 0 && splits[index - 1].pace
                    ? convertPaceToMinutes(splits[index - 1].pace!)
                    : null;
                const currentPace = split.pace ? convertPaceToMinutes(split.pace) : null;
                const paceImproved = prevPace !== null && currentPace !== null && currentPace < prevPace;
                const paceSlowed = prevPace !== null && currentPace !== null && currentPace > prevPace;

                // Look up checkpoint time and ranks from checkpointTimes array
                const checkpointTime = (participant.checkpointTimes || []).find(
                  (ct: CheckpointTime) => ct.checkpointName && ct.checkpointName === split.checkpointName
                );

                return (
                  <TableRow
                    key={split.checkpointId || index}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(colors.primary.main, 0.05),
                      },
                      bgcolor: index === splits.length - 1 
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
                              index === splits.length - 1
                                ? colors.success.main
                                : colors.pace.main,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {split.checkpointName || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {split.distance || `${split.distanceKm ?? 0} km`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text.primary }}>
                        {checkpointTime?.time || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {split.splitTime || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color:
                            index === splits.length - 1
                              ? colors.success.main
                              : colors.text.primary,
                        }}
                      >
                        {split.cumulativeTime || '-'}
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
                          {split.pace || '-'}
                        </Typography>
                        {paceImproved && (
                          <TrendingUp sx={{ fontSize: 14, color: colors.success.main }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {split.speed != null ? `${split.speed.toFixed(1)} km/h` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`#${checkpointTime?.overallRank || '-'}`}
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
                        label={`#${checkpointTime?.genderRank || '-'}`}
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
                        label={`#${checkpointTime?.categoryRank || '-'}`}
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

      {/* RFID Tag Readings Section */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 2.5,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        <Nfc sx={{ mr: 1, verticalAlign: "middle" }} />
        RFID Tag Readings
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
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Local Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Checkpoint</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Device</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Gun Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Net Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Chip ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>Manual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(participant.rfidReadings || []).map((reading: RfidReadingDetail) => {
                const readDateTime = new Date(reading.readTimeUtc);

                return (
                  <TableRow
                    key={reading.readingId}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(colors.primary.main, 0.05),
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTime
                          sx={{
                            fontSize: 18,
                            color: colors.primary.main,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {reading.readTimeLocal || readDateTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {readDateTime.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOn
                          sx={{
                            fontSize: 18,
                            color: colors.pace.main,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {reading.checkpointName || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} sx={{ color: colors.text.secondary }}>
                        {reading.deviceName || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {reading.gunTimeFormatted || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {reading.netTimeFormatted || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: 'monospace',
                          color: colors.text.secondary,
                          fontSize: '0.7rem',
                        }}
                      >
                        {reading.chipId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={reading.isManualEntry ? 'Yes' : 'No'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: reading.isManualEntry 
                            ? alpha(colors.warning.main, isDark ? 0.2 : 0.1)
                            : alpha(colors.success.main, isDark ? 0.2 : 0.1),
                          color: reading.isManualEntry ? colors.warning.main : colors.success.main,
                          border: `1px solid ${alpha(reading.isManualEntry ? colors.warning.main : colors.success.main, 0.3)}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Processing Notes Section */}
        {participant.processingNotes && participant.processingNotes.length > 0 && (
          <Box sx={{ p: 2, bgcolor: colors.background.subtle, borderTop: `1px solid ${colors.border.light}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: colors.text.primary }}>
              Processing Notes:
            </Typography>
            {[...new Set(participant.processingNotes)].map((note, idx) => (
                <Typography 
                  key={idx} 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: colors.text.secondary,
                    mb: 0.5,
                  }}
                >
                  • {note}
                </Typography>
              ))}
          </Box>
        )}

        {/* EPC Info */}
        {participant.epc && (
          <Box sx={{ p: 2, bgcolor: colors.background.subtle, borderTop: `1px solid ${colors.border.light}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text.primary }}>
              EPC: <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{participant.epc}</Typography>
            </Typography>
          </Box>
        )}
      </Card>

      {/* Pace Chart Visualization */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: 1,
          color: colors.text.primary,
          fontSize: '1.25rem',
        }}
      >
        Pace Progression
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 2.5,
          color: colors.text.secondary,
          fontWeight: 500,
        }}
      >
        Track pace (min/km) and speed at each checkpoint
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
          {/* Legend for card metrics */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 3, 
            p: 2, 
            bgcolor: colors.background.subtle,
            borderRadius: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 4, 
                height: 24, 
                bgcolor: colors.pace.main, 
                borderRadius: 1 
              }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary }}>
                First Split
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 4, 
                height: 24, 
                bgcolor: colors.success.main, 
                borderRadius: 1 
              }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary }}>
                Improved Pace (Faster)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 4, 
                height: 24, 
                bgcolor: colors.error.main, 
                borderRadius: 1 
              }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary }}>
                Declined Pace (Slower)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={0.5}>
                <Box sx={{ 
                  width: 4, 
                  height: 24, 
                  bgcolor: colors.warning.main, 
                  borderRadius: 1 
                }} />
                <CheckCircle sx={{ fontSize: 16, color: colors.warning.main }} />
              </Stack>
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary }}>
                Finish Line
              </Typography>
            </Stack>
          </Box>

          {/* Pace values display */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {(participant.splitTimes || []).filter((s: SplitTimeInfo) => s.pace).map((split: SplitTimeInfo, index: number, arr: SplitTimeInfo[]) => {
              const prevPace = index > 0 && arr[index - 1].pace
                ? convertPaceToMinutes(arr[index - 1].pace!)
                : null;
              const currentPace = split.pace ? convertPaceToMinutes(split.pace) : 0;
              const isFaster = prevPace !== null && currentPace < prevPace;
              const isSlower = prevPace !== null && currentPace > prevPace;
              
              // Calculate drastic change (>15% change in pace)
              const paceChangePercent = prevPace !== null 
                ? Math.abs(((currentPace - prevPace) / prevPace) * 100) 
                : 0;
              const isDrasticChange = paceChangePercent > 15;
              const isDrasticSlowdown = isDrasticChange && isSlower;
              
              return (
                <Box
                  key={split.checkpointId || index}
                  sx={{
                    flex: 1,
                    minWidth: 100,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: isDrasticChange 
                      ? alpha(isDrasticSlowdown ? colors.error.main : colors.success.main, isDark ? 0.15 : 0.08)
                      : colors.background.subtle,
                    border: `1px solid ${
                      index === arr.length - 1 
                        ? alpha(colors.warning.main, 0.5)
                        : isDrasticChange
                          ? alpha(isDrasticSlowdown ? colors.error.main : colors.success.main, 0.6)
                          : colors.border.light
                    }`,
                    borderLeft: `4px solid ${
                      index === arr.length - 1 
                        ? colors.warning.main
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
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.text.secondary,
                        display: "block", 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem',
                        flex: 1,
                      }}
                    >
                      {split.checkpointName} ({split.distanceKm ?? 0}km)
                    </Typography>
                    {isDrasticChange && (
                      <Tooltip 
                        title={`${isDrasticSlowdown ? 'Drastic slowdown' : 'Drastic speedup'}: ${paceChangePercent.toFixed(1)}% change`}
                        arrow
                      >
                        {isDrasticSlowdown ? (
                          <Warning sx={{ 
                            fontSize: 18, 
                            color: colors.error.main,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.6 },
                            },
                          }} />
                        ) : (
                          <TrendingUp sx={{ 
                            fontSize: 18, 
                            color: colors.success.main,
                            fontWeight: 800,
                          }} />
                        )}
                      </Tooltip>
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.text.secondary,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}
                    >
                      Pace:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        color: index === arr.length - 1
                          ? colors.warning.main
                          : isFaster 
                            ? colors.success.main 
                            : isSlower 
                              ? colors.error.main 
                              : colors.pace.main,
                        letterSpacing: '1px',
                      }}
                    >
                      {split.pace}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.text.secondary,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}
                    >
                      Speed:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {split.speed != null ? `${split.speed.toFixed(1)} km/h` : '-'}
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontWeight: 500,
                      fontSize: '0.65rem',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    Split time: {split.splitTime || '-'}
                  </Typography>
                  {isDrasticChange && (
                    <Chip
                      label={`${isDrasticSlowdown ? '▼' : '▲'} ${paceChangePercent.toFixed(1)}%`}
                      size="small"
                      sx={{
                        mt: 1,
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: alpha(isDrasticSlowdown ? colors.error.main : colors.success.main, isDark ? 0.25 : 0.15),
                        color: isDrasticSlowdown ? colors.error.main : colors.success.main,
                        border: `1px solid ${alpha(isDrasticSlowdown ? colors.error.main : colors.success.main, 0.5)}`,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Visual Pace Path Visualization */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: colors.text.primary,
              }}
            >
              Pace Journey Visualization
            </Typography>
            <Box sx={{ 
              position: 'relative',
              height: 250, 
              px: 4,
              py: 4,
              bgcolor: colors.background.subtle,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              overflow: 'visible',
            }}>
              {/* Draw connecting path/line */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.primary.main} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors.success.main} stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {(participant.splitTimes || []).filter((s: SplitTimeInfo) => s.pace).map((split: SplitTimeInfo, index: number, arr: SplitTimeInfo[]) => {
                  if (index === arr.length - 1) return null;
                  
                  const totalCheckpoints = arr.length;
                  const x1 = ((index + 1) / (totalCheckpoints + 1)) * 100;
                  const x2 = ((index + 2) / (totalCheckpoints + 1)) * 100;
                  
                  const currentPace = split.pace ? convertPaceToMinutes(split.pace) : 0;
                  const nextPace = arr[index + 1].pace ? convertPaceToMinutes(arr[index + 1].pace!) : 0;
                  
                  // Map pace to vertical position (faster = higher)
                  const minPace = 4.0;
                  const maxPace = 6.5;
                  const y1 = 80 - (((Math.min(Math.max(currentPace, minPace), maxPace) - minPace) / (maxPace - minPace)) * 60);
                  const y2 = 80 - (((Math.min(Math.max(nextPace, minPace), maxPace) - minPace) / (maxPace - minPace)) * 60);
                  
                  return (
                    <line
                      key={`line-${index}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="url(#pathGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Checkpoints with runner icons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '100%',
                position: 'relative',
              }}>
                {(participant.splitTimes || []).filter((s: SplitTimeInfo) => s.pace).map((split: SplitTimeInfo, index: number, arr: SplitTimeInfo[]) => {
                  const paceMinutes = split.pace ? convertPaceToMinutes(split.pace) : 0;
                  const prevPace = index > 0 && arr[index - 1].pace ? convertPaceToMinutes(arr[index - 1].pace!) : null;
                  const isFaster = prevPace !== null && paceMinutes < prevPace;
                  const isSlower = prevPace !== null && paceMinutes > prevPace;
                  
                  // Map pace to vertical position (faster = higher up)
                  const minPace = 4.0;
                  const maxPace = 6.5;
                  const normalizedPace = (Math.min(Math.max(paceMinutes, minPace), maxPace) - minPace) / (maxPace - minPace);
                  const verticalPosition = (1 - normalizedPace) * 60; // 0-60% range
                  
                  const isFinish = index === arr.length - 1;
                  
                  return (
                    <Tooltip
                      key={split.checkpointId}
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {split.checkpointName} ({split.distanceKm ?? 0}km)
                          </Typography>
                          <Divider sx={{ my: 0.5 }} />
                          <Typography variant="caption" display="block">
                            <strong>Pace:</strong> {split.pace || '-'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Speed:</strong> {split.speed != null ? `${split.speed.toFixed(1)} km/h` : '-'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Split Time:</strong> {split.splitTime || '-'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Cumulative Time:</strong> {split.cumulativeTime || '-'}
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: `${verticalPosition}%`,
                          left: `${((index + 1) / (arr.length + 1)) * 100}%`,
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(-50%) scale(1.15)',
                          },
                        }}
                      >
                        {/* Runner icon with pace-based styling */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isFinish 
                              ? colors.warning.main
                              : isFaster 
                                ? colors.success.main 
                                : isSlower 
                                  ? colors.error.main 
                                  : colors.primary.main,
                            boxShadow: `0 4px 16px ${alpha(
                              isFinish 
                                ? colors.warning.main
                                : isFaster 
                                  ? colors.success.main 
                                  : isSlower 
                                    ? colors.error.main 
                                    : colors.primary.main,
                              0.4
                            )}`,
                            border: `3px solid ${colors.background.paper}`,
                            position: 'relative',
                            '&::after': isFinish ? {
                              content: '""',
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              border: `2px solid ${colors.warning.main}`,
                              animation: 'ripple 1.5s infinite',
                            } : {},
                            '@keyframes ripple': {
                              '0%': {
                                transform: 'scale(1)',
                                opacity: 1,
                              },
                              '100%': {
                                transform: 'scale(1.5)',
                                opacity: 0,
                              },
                            },
                          }}
                        >
                          {isFinish ? (
                            <Flag sx={{ fontSize: 24, color: 'white' }} />
                          ) : (
                            <DirectionsRun sx={{ fontSize: 24, color: 'white' }} />
                          )}
                        </Box>
                        
                        {/* Pace label */}
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1,
                            fontWeight: 800,
                            color: isFinish 
                              ? colors.warning.main
                              : isFaster 
                                ? colors.success.main 
                                : isSlower 
                                  ? colors.error.main 
                                  : colors.primary.main,
                            fontSize: '0.7rem',
                            bgcolor: colors.background.paper,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            boxShadow: `0 2px 8px ${alpha('#000', 0.1)}`,
                          }}
                        >
                          {split.pace || '-'}
                        </Typography>
                        
                        {/* Checkpoint name */}
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            fontWeight: 600,
                            color: colors.text.secondary,
                            fontSize: '0.65rem',
                            textAlign: 'center',
                          }}
                        >
                          {split.checkpointName || '-'}
                        </Typography>
                        
                        {/* Distance */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            color: colors.text.secondary,
                            fontSize: '0.6rem',
                          }}
                        >
                          {split.distanceKm ?? 0}km
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
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
              Start: {participant.startTime ? new Date(participant.startTime).toLocaleTimeString() : '-'}
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