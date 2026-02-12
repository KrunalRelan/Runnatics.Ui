import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  SelectChangeEvent,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Alert,
  Skeleton,
  Avatar,
  Fade,
  Tooltip,
} from "@mui/material";
import {
  FileDownload,
  EmojiEvents,
  VisibilityOff,
} from "@mui/icons-material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import DataGrid from "@/main/src/components/DataGrid";
import type { ColDef } from "ag-grid-community";
import { DataGridRef } from "@/main/src/models/dataGrid";
import { LeaderboardService } from "@/main/src/services/LeaderboardService";
import {
  LeaderboardRequest,
  LeaderboardResult,
} from "@/main/src/models/leaderboard";
import type { LeaderboardDisplaySettings } from "@/main/src/models/leaderboard";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { Category } from "@/main/src/models/participants/Category";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaderboardProps {
  eventId: string;
  raceId: string;
}

interface LeaderboardFilters {
  searchString: string;
  rankBy: string;
  gender: string;
  category: string;
  pageNumber: number;
  pageSize: number;
}

/** Tracks why the leaderboard can't be shown */
type LeaderboardError =
  | { kind: "forbidden"; message: string }
  | { kind: "generic"; message: string }
  | null;

const defaultFilters: LeaderboardFilters = {
  searchString: "",
  rankBy: "Overall",
  gender: "",
  category: "",
  pageNumber: 1,
  pageSize: 25,
};

// ---------------------------------------------------------------------------
// Status helpers (Open/Closed for extension – add new statuses here)
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { color: string; bgColor: string }> = {
  Finished: { color: "#2e7d32", bgColor: "#e8f5e9" },
  DNF: { color: "#d32f2f", bgColor: "#ffebee" },
  DNS: { color: "#ed6c02", bgColor: "#fff3e0" },
  Registered: { color: "#1976d2", bgColor: "#e3f2fd" },
};

const getStatusStyle = (status: string) =>
  STATUS_CONFIG[status] ?? { color: "#757575", bgColor: "#f5f5f5" };

// ---------------------------------------------------------------------------
// Column definitions (Single Responsibility – separated from component)
// Display settings drive which columns are visible
// ---------------------------------------------------------------------------

const buildColumns = (
  settings: LeaderboardDisplaySettings
): ColDef<LeaderboardResult>[] => {
  const cols: ColDef<LeaderboardResult>[] = [
    {
      headerName: "#",
      field: "rank",
      flex: 0.4,
      minWidth: 55,
      sortable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (!settings.showMedalIcon || params.value == null) return params.value;
        const medal =
          params.value === 1
            ? "🥇"
            : params.value === 2
            ? "🥈"
            : params.value === 3
            ? "🥉"
            : null;
        return medal ? `${medal} ${params.value}` : params.value;
      },
    },
    {
      field: "bib",
      headerName: "Bib",
      flex: 0.6,
      minWidth: 70,
      sortable: true,
      filter: true,
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.8,
      minWidth: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.7,
      minWidth: 80,
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 110,
      sortable: true,
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        if (!params.value) return null;
        // Hide DNF rows if showDnf is off (column still visible, but could filter)
        const cfg = getStatusStyle(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 600,
              color: cfg.color,
              backgroundColor: cfg.bgColor,
              borderColor: cfg.color,
              border: "1px solid",
            }}
          />
        );
      },
    },
    {
      field: "gunTime",
      headerName: "Gun Time",
      flex: 0.9,
      minWidth: 90,
      sortable: true,
      filter: false,
      valueGetter: (params: any) => params.data?.gunTime || "—",
    },
    {
      field: "netTime",
      headerName: "Chip Time",
      flex: 0.9,
      minWidth: 90,
      sortable: true,
      filter: false,
      valueGetter: (params: any) => params.data?.netTime || "—",
    },
  ];

  // Rank columns – driven by display settings
  if (settings.showOverallResults) {
    cols.push({
      field: "overallRank",
      headerName: "Overall Rank",
      flex: 0.8,
      minWidth: 80,
      sortable: true,
      filter: false,
    });
  }

  if (settings.showGenderResults) {
    cols.push({
      field: "genderRank",
      headerName: "Gender Rank",
      flex: 0.8,
      minWidth: 80,
      sortable: true,
      filter: false,
    });
  }

  if (settings.showCategoryResults) {
    cols.push({
      field: "categoryRank",
      headerName: "Category Rank",
      flex: 0.8,
      minWidth: 85,
      sortable: true,
      filter: false,
    });
  }

  // Pace column – driven by showPace
  if (settings.showPace) {
    cols.push({
      field: "averagePaceFormatted",
      headerName: "Avg Pace",
      flex: 0.8,
      minWidth: 85,
      sortable: true,
      filter: false,
      valueGetter: (params: any) => params.data?.averagePaceFormatted || "—",
    });
  }

  return cols;
};

// Build split (checkpoint) columns from the first result's splits array
const buildSplitColumns = (
  results: LeaderboardResult[]
): ColDef<LeaderboardResult>[] => {
  // Derive unique checkpoints from the first result that has splits
  const sample = results.find((r) => r.splits && r.splits.length > 0);
  if (!sample?.splits) return [];

  return sample.splits.map((split, idx) => ({
    headerName: split.checkpointName,
    flex: 0.9,
    minWidth: 90,
    sortable: false,
    filter: false,
    valueGetter: (params: any) => {
      const s = params.data?.splits?.[idx];
      return s?.splitTime || "—";
    },
    headerTooltip: `${split.checkpointName} (${split.distanceKm} km)`,
  }));
};

// Default display settings when API hasn't responded yet
const DEFAULT_DISPLAY_SETTINGS: LeaderboardDisplaySettings = {
  showOverallResults: true,
  showCategoryResults: true,
  showGenderResults: true,
  showAgeGroupResults: true,
  showSplitTimes: true,
  showPace: true,
  showDnf: true,
  showMedalIcon: true,
  rankOnNet: true,
  sortTimeField: "netTime",
  maxResultsOverall: 0,
  maxResultsCategory: 0,
  maxDisplayedRecords: 0,
};

// ---------------------------------------------------------------------------
// Podium sub-component – theme-aware, works in light & dark mode
// ---------------------------------------------------------------------------

const PODIUM_MEDALS = [
  { label: "1st", emoji: "👑", barHeight: 140, avatarSize: 68, fontSize: "1.5rem" },
  { label: "2nd", emoji: "🥈", barHeight: 100, avatarSize: 56, fontSize: "1.2rem" },
  { label: "3rd", emoji: "🥉", barHeight: 75, avatarSize: 52, fontSize: "1.1rem" },
] as const;

/** Colour tokens that adapt to the current MUI palette */
const usePodiumColors = () => {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    bg: isDark
      ? `linear-gradient(160deg, ${theme.palette.background.default} 0%, #1a1f33 50%, ${theme.palette.background.paper} 100%)`
      : "linear-gradient(160deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#d5d5d5",
    glowOverlay: isDark
      ? "radial-gradient(ellipse at 50% 0%, rgba(51,153,255,0.06) 0%, transparent 60%)"
      : "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.02) 0%, transparent 60%)",
    titleColor: isDark ? "rgba(255,255,255,0.85)" : theme.palette.text.primary,
    nameColor: isDark ? "#E8EAED" : theme.palette.text.primary,
    bibColor: isDark ? "rgba(255,255,255,0.45)" : theme.palette.text.secondary,
    positionColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    timeColor: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
    timeLabelColor: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    medals: [
      // 1st – Rich Indigo (royalty, premium, champion)
      {
        gradient: isDark
          ? "linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)"
          : "linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%)",
        ring: isDark ? "#7986CB" : "#3F51B5",
        glow: isDark ? "rgba(121,134,203,0.35)" : "rgba(63,81,181,0.22)",
        barGradient: isDark
          ? "linear-gradient(180deg, #7986CB 0%, #5C6BC0 50%, #3949AB 100%)"
          : "linear-gradient(180deg, #C5CAE9 0%, #7986CB 50%, #3F51B5 100%)",
        barShine: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)",
      },
      // 2nd – Warm Amber (energetic, bold)
      {
        gradient: isDark
          ? "linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)"
          : "linear-gradient(135deg, #FFC107 0%, #FFB300 100%)",
        ring: isDark ? "#FFD54F" : "#FF8F00",
        glow: isDark ? "rgba(255,213,79,0.30)" : "rgba(255,143,0,0.20)",
        barGradient: isDark
          ? "linear-gradient(180deg, #FFD54F 0%, #FFB300 50%, #FF8F00 100%)"
          : "linear-gradient(180deg, #FFF8E1 0%, #FFD54F 50%, #FFB300 100%)",
        barShine: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
      },
      // 3rd – Cool Teal (calm, balanced)
      {
        gradient: isDark
          ? "linear-gradient(135deg, #26A69A 0%, #00897B 100%)"
          : "linear-gradient(135deg, #26A69A 0%, #00897B 100%)",
        ring: isDark ? "#4DB6AC" : "#00897B",
        glow: isDark ? "rgba(77,182,172,0.28)" : "rgba(0,137,123,0.18)",
        barGradient: isDark
          ? "linear-gradient(180deg, #4DB6AC 0%, #26A69A 50%, #00897B 100%)"
          : "linear-gradient(180deg, #B2DFDB 0%, #4DB6AC 50%, #00897B 100%)",
        barShine: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)",
      },
    ],
    isDark,
  };
};

const Podium: React.FC<{
  results: LeaderboardResult[];
  rankOnNet: boolean;
  rankField: "rank" | "overallRank";
}> = ({ results, rankOnNet, rankField }) => {
  const colors = usePodiumColors();

  const sorted = [...results]
    .filter((r) => r[rankField] != null && r[rankField] >= 1)
    .sort((a, b) => a[rankField] - b[rankField]);
  const top3 = sorted.slice(0, 3);
  if (top3.length === 0) return null;

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          mb: 3,
          py: 3,
          px: 2,
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          background: colors.bg,
          border: "1px solid",
          borderColor: colors.borderColor,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: colors.glowOverlay,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{ mb: 3 }}
        >
          <EmojiEvents sx={{ color: "#FFD700", fontSize: 22 }} />
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.titleColor,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontSize: "0.8rem",
            }}
          >
            Top Finishers
          </Typography>
          <EmojiEvents sx={{ color: "#FFD700", fontSize: 22 }} />
        </Stack>

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-end"
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ minHeight: 260, pb: 1 }}
        >
          {podiumOrder.map((r, visualIdx) => {
            const podiumIdx = visualIdx === 1 ? 0 : visualIdx === 0 ? 1 : 2;
            const medal = PODIUM_MEDALS[podiumIdx];
            const mc = colors.medals[podiumIdx];
            const time = rankOnNet ? r.netTime : r.gunTime;
            const isFirst = podiumIdx === 0;
            const initials = `${(r.firstName?.[0] || "").toUpperCase()}${(r.lastName?.[0] || "").toUpperCase()}`;

            return (
              <Box
                key={r.participantId}
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: { xs: 100, sm: 130 },
                  animation: `podiumSlideUp 0.6s ease-out ${0.15 * (podiumIdx + 1)}s both`,
                  "@keyframes podiumSlideUp": {
                    "0%": { opacity: 0, transform: "translateY(30px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: isFirst ? "1.6rem" : "1.3rem",
                    mb: 0.5,
                    filter: isFirst
                      ? "drop-shadow(0 0 6px rgba(255,215,0,0.5))"
                      : "none",
                    animation: isFirst
                      ? "crownBounce 2s ease-in-out infinite"
                      : "none",
                    "@keyframes crownBounce": {
                      "0%, 100%": { transform: "translateY(0)" },
                      "50%": { transform: "translateY(-4px)" },
                    },
                  }}
                >
                  {medal.emoji}
                </Typography>

                <Tooltip
                  title={`${r.fullName}${r.category ? ` — ${r.category}` : ""}`}
                  arrow
                  placement="top"
                >
                  <Avatar
                    sx={{
                      width: medal.avatarSize,
                      height: medal.avatarSize,
                      mx: "auto",
                      mb: 1,
                      background: mc.gradient,
                      fontSize: medal.fontSize,
                      fontWeight: 800,
                      color: "#fff",
                      border: `3px solid ${mc.ring}`,
                      boxShadow: `0 0 18px ${mc.glow}, 0 4px 12px rgba(0,0,0,${colors.isDark ? "0.4" : "0.12"})`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.15) translateY(-4px)",
                        boxShadow: `0 0 28px ${mc.glow}, 0 8px 20px rgba(0,0,0,${colors.isDark ? "0.5" : "0.18"})`,
                      },
                    }}
                  >
                    {initials || medal.label}
                  </Avatar>
                </Tooltip>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: colors.nameColor,
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: isFirst ? "0.875rem" : "0.8rem",
                  }}
                >
                  {r.fullName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.bibColor, mb: 1, fontSize: "0.7rem" }}
                >
                  BIB {r.bib}
                </Typography>

                <Box
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: medal.barHeight,
                    borderRadius: "12px 12px 0 0",
                    background: mc.barGradient,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: `inset 0 2px 4px rgba(255,255,255,${colors.isDark ? "0.12" : "0.4"}), 0 -2px 10px ${mc.glow}`,
                    animation: `barGrow 0.8s ease-out ${0.15 * (podiumIdx + 1)}s both`,
                    "@keyframes barGrow": {
                      "0%": { height: 0, opacity: 0.5 },
                      "100%": { height: medal.barHeight, opacity: 1 },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      borderRadius: "12px 12px 0 0",
                      background: mc.barShine,
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: isFirst ? "2rem" : "1.6rem",
                      color: colors.positionColor,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {podiumIdx + 1}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: isFirst ? "0.85rem" : "0.78rem",
                      color: colors.timeColor,
                      mt: 0.5,
                      px: 0.5,
                    }}
                  >
                    {time || "—"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      color: colors.timeLabelColor,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {rankOnNet ? "Chip" : "Gun"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// Forbidden / Not-published state
// ---------------------------------------------------------------------------

const ForbiddenState: React.FC<{ message: string }> = ({ message }) => (
  <Fade in timeout={400}>
    <Card
      sx={{
        width: "100%",
        textAlign: "center",
        py: 8,
        px: 4,
        background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          mx: "auto",
          mb: 3,
          borderRadius: "50%",
          bgcolor: "#fff3e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <VisibilityOff sx={{ fontSize: 40, color: "#ed6c02" }} />
      </Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Leaderboard Not Available
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 420, mx: "auto" }}
      >
        {message ||
          "The leaderboard for this race is not enabled or has not been published yet. Please check the race settings."}
      </Typography>
    </Card>
  </Fade>
);

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

const LeaderboardSkeleton: React.FC = () => (
  <Card sx={{ width: "100%", p: 2 }}>
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
    <Stack spacing={0.5}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 0.5 }} />
      ))}
    </Stack>
  </Card>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Leaderboard: React.FC<LeaderboardProps> = ({ eventId, raceId }) => {
  // State
  const [results, setResults] = useState<LeaderboardResult[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true); // start true for initial skeleton
  const [filters, setFilters] = useState<LeaderboardFilters>(defaultFilters);
  const [displaySettings, setDisplaySettings] =
    useState<LeaderboardDisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [error, setError] = useState<LeaderboardError>(null);

  // Categories (lazy loaded)
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Refs
  const gridRef = useRef<DataGridRef>(null);
  const prevFiltersRef = useRef("");
  const isInitialMount = useRef(true);
  const prevEventId = useRef<string | undefined>(undefined);
  const prevRaceId = useRef<string | undefined>(undefined);

  // -------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------

  const fetchLeaderboard = useCallback(
    async (currentFilters: LeaderboardFilters) => {
      if (!eventId || !raceId) return;
      try {
        setLoading(true);
        const request: LeaderboardRequest = {
          eventId,
          raceId,
          searchString: currentFilters.searchString || "",
          rankBy: currentFilters.rankBy || "Overall",
          gender: currentFilters.gender || "",
          category: currentFilters.category || "",
          pageNumber: currentFilters.pageNumber,
          pageSize: currentFilters.pageSize,
          sortFieldName: "rank",
          sortDirection: "Ascending",
          includeSplits: false,
        };

        const response = await LeaderboardService.getLeaderboard(request);
        const data = response.message;

        setResults(data?.results ?? []);
        setTotalRecords(data?.totalCount ?? 0);
        setError(null);

        // Store display settings from API (fall back to defaults)
        if (data?.displaySettings) {
          setDisplaySettings(data.displaySettings);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          const msg =
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            "Leaderboard is not enabled or not published for this race.";
          setError({ kind: "forbidden", message: msg });
        } else {
          console.error("Failed to fetch leaderboard:", err);
          setError({
            kind: "generic",
            message: err?.message || "Failed to load leaderboard.",
          });
        }
        setResults([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [eventId, raceId]
  );

  // Fetch categories lazily
  const fetchCategories = async () => {
    if (categoriesLoaded || categoriesLoading) return;
    try {
      setCategoriesLoading(true);
      const data = await ParticipantService.getCategories(eventId, raceId);
      setCategories(data || []);
      setCategoriesLoaded(true);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Reset categories when race changes
  useEffect(() => {
    setCategoriesLoaded(false);
    setCategories([]);
  }, [eventId, raceId]);

  // Main data-fetch effect (debounced on filter change)
  useEffect(() => {
    if (!eventId || !raceId) return;

    const idChanged =
      prevEventId.current !== eventId || prevRaceId.current !== raceId;

    const filtersKey = JSON.stringify(filters);
    const filtersChanged = prevFiltersRef.current !== filtersKey;

    prevEventId.current = eventId;
    prevRaceId.current = raceId;

    if (isInitialMount.current || idChanged) {
      isInitialMount.current = false;
      prevFiltersRef.current = filtersKey;
      fetchLeaderboard(filters);
      return;
    }

    if (filtersChanged) {
      const t = setTimeout(() => {
        prevFiltersRef.current = filtersKey;
        fetchLeaderboard(filters);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [
    eventId,
    raceId,
    filters,
    fetchLeaderboard,
  ]);

  // -------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------

  const handleFilterChange = (
    field: keyof LeaderboardFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== "pageNumber" && field !== "pageSize"
        ? { pageNumber: 1 }
        : {}),
    }));
  };

  const handleResetFilters = () => setFilters(defaultFilters);

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, pageNumber: page }));

  const handlePageSizeChange = (size: number) =>
    setFilters((prev) => ({ ...prev, pageNumber: 1, pageSize: size }));

  const handleExportCsv = () => {
    if (gridRef.current) {
      const ts = new Date().toISOString().slice(0, 10);
      gridRef.current.exportToCsv(`leaderboard_${ts}.csv`);
    }
  };

  // -------------------------------------------------------------------
  // Columns – rebuilt when settings or results change
  // -------------------------------------------------------------------

  const columnDefs = React.useMemo(() => {
    const cols = buildColumns(displaySettings);
    // Append split columns if the API said to show them
    if (displaySettings.showSplitTimes) {
      cols.push(...buildSplitColumns(results));
    }
    return cols;
  }, [displaySettings, results]);

  // Filter out DNF if settings say so, and sort by category+rank for category view
  const visibleResults = React.useMemo(() => {
    let filtered = displaySettings.showDnf
      ? results
      : results.filter((r) => r.status !== "DNF");

    // When rankBy is "category", sort by category name then rank
    // so same-category participants are visually grouped together
    if (filters.rankBy?.toLowerCase() === "category") {
      filtered = [...filtered].sort((a, b) => {
        const catCmp = (a.category || "").localeCompare(b.category || "");
        return catCmp !== 0 ? catCmp : a.rank - b.rank;
      });
    }

    return filtered;
  }, [results, displaySettings.showDnf, filters.rankBy]);

  const totalPages =
    totalRecords > 0 ? Math.ceil(totalRecords / filters.pageSize) : 1;

  // Show podium when there are results
  const isCategoryView = filters.rankBy?.toLowerCase() === "category";
  const showPodium = visibleResults.length > 0;
  const podiumRankField = isCategoryView ? "overallRank" : "rank";

  // -------------------------------------------------------------------
  // Render – early returns for special states
  // -------------------------------------------------------------------

  // Initial load skeleton
  if (loading && results.length === 0 && !error) {
    return <LeaderboardSkeleton />;
  }

  // 403 Forbidden – not enabled / not published
  if (error?.kind === "forbidden") {
    return <ForbiddenState message={error.message} />;
  }

  return (
    <Card sx={{ width: "100%", maxWidth: "100%" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header and Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents sx={{ color: "#FFD700", fontSize: 28 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Leaderboard
            </Typography>
            {displaySettings.rankOnNet && (
              <Chip
                label="Ranked by Chip Time"
                size="small"
                variant="outlined"
                color="info"
                sx={{ fontWeight: 500 }}
              />
            )}
            {isCategoryView && (
              <Chip
                label="Grouped by Category"
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontWeight: 500 }}
              />
            )}
            {displaySettings.maxDisplayedRecords > 0 && (
              <Chip
                label={`Top ${displaySettings.maxDisplayedRecords} results`}
                size="small"
                variant="outlined"
                color="warning"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }} useFlexGap>
            <ToggleButtonGroup
              value={filters.rankBy}
              exclusive
              onChange={(_e, val) => {
                if (val) handleFilterChange("rankBy", val);
              }}
              size="small"
            >
              {displaySettings.showOverallResults && (
                <ToggleButton value="Overall">Overall</ToggleButton>
              )}
              {displaySettings.showGenderResults && (
                <ToggleButton value="Gender">Gender</ToggleButton>
              )}
              {displaySettings.showCategoryResults && (
                <ToggleButton value="Category">Category</ToggleButton>
              )}
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleExportCsv}
            >
              Export
            </Button>
          </Stack>
        </Box>

        {/* Generic error banner */}
        {error?.kind === "generic" && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error.message}
          </Alert>
        )}

        {/* Podium – top 3 finishers (first page, no filters) */}
        {showPodium && (
          <Podium results={visibleResults} rankOnNet={displaySettings.rankOnNet} rankField={podiumRankField} />
        )}

        {/* Filters Section */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <TextField
              label="Name or Bib"
              placeholder="Enter Name or Bib Number"
              value={filters.searchString}
              onChange={(e) =>
                handleFilterChange("searchString", e.target.value)
              }
              sx={{ flex: 1, minWidth: 200 }}
              size="small"
            />
            <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                label="Gender"
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("gender", e.target.value)
                }
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("category", e.target.value)
                }
                onOpen={() => {
                  if (!categoriesLoaded && !categoriesLoading) fetchCategories();
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoriesLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </MenuItem>
                )}
                {!categoriesLoading &&
                  categories.map((cat) => (
                    <MenuItem key={cat.categoryName} value={cat.categoryName}>
                      {cat.categoryName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              sx={{
                flex: 1,
                minWidth: 200,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Reset
            </Button>
          </Stack>
        </Card>

        {/* Data Grid */}
        <DataGrid<LeaderboardResult>
          rowData={visibleResults}
          columnDefs={columnDefs}
          pagination={false}
          domLayout="autoHeight"
          enableSorting={true}
          enableFiltering={true}
          animateRows={true}
          loading={loading}
          useCustomPagination={true}
          pageNumber={filters.pageNumber}
          totalRecords={totalRecords}
          totalPages={totalPages}
          paginationPageSize={filters.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          gridRef={gridRef}
        />
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
