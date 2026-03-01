import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Stack,
  Card,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import PageContainer from "@/main/src/components/PageContainer";
import {
  ArrowBack,
  Dashboard,
  People,
  TrendingUp,
  Place,
  Timer,
  EmojiEvents,
  Edit,
  Leaderboard as LeaderboardIcon,
} from "@mui/icons-material";
import { Race } from "@/main/src/models/races/Race";
import { RaceService } from "@/main/src/services/RaceService";
import ViewParticipants from "@/main/src/pages/admin/participants/ViewParticipants";
import ViewCheckPoints from "@/main/src/pages/admin/checkpoints/ViewCheckPoints";
import { AddOrEditCertificate } from "../certificates/AddOrEditCertificate";
import Leaderboard from "@/main/src/pages/admin/leaderboard/Leaderboard";
import { RaceDashboard } from "./RaceDashboard";
import config from "@/main/src/config/environment";

const Segments: React.FC<{ eventId: string; raceId: string }> = () => (
  <Card sx={{ p: 3 }}>
    <Typography variant="h6">Segments</Typography>
    <Typography color="text.secondary">Segments content coming soon...</Typography>
  </Card>
);

const ViewRaces: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  const navigate = useNavigate();

  // State
  const [race, setRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedRaceId, setSelectedRaceId] = useState<string | undefined>(undefined);

  // Ref to track if races have been fetched
  const racesInitialized = useRef(false);

  // Fetch all races for the event on mount (only once)
  useEffect(() => {
    const fetchAllRaces = async () => {
      if (!eventId || racesInitialized.current) return;

      racesInitialized.current = true;

      try {
        setLoading(true);
        setError(null);

        const racesResponse = await RaceService.getAllRaces({
          eventId,
          searchCriteria: {
            pageNumber: 1,
            pageSize: 100,
            sortFieldName: "startTime",
            sortDirection: 1,
          },
        });

        const fetchedRaces = racesResponse.message || [];
        setRaces(fetchedRaces);

        // Set initial selectedRaceId from URL or first race
        const initialRaceId = raceId || fetchedRaces[0]?.id;
        setSelectedRaceId(initialRaceId);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch races data");
        setLoading(false);
      }
    };

    fetchAllRaces();
  }, [eventId, raceId]); // Include both dependencies

  // Sync URL raceId parameter with selectedRaceId when user navigates
  useEffect(() => {
    // Only update if we already have races loaded and raceId changed
    if (racesInitialized.current && raceId && raceId !== selectedRaceId) {
      setSelectedRaceId(raceId);
    }
  }, [raceId, selectedRaceId]);

  // Fetch selected race details when race changes
  useEffect(() => {
    const fetchRaceDetails = async () => {
      if (!eventId || !selectedRaceId) return;

      try {
        setLoading(true);
        setError(null);

        const raceResponse = await RaceService.getRaceById(eventId, selectedRaceId);
        const fetchedRace = raceResponse.message;
        setRace(fetchedRace);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch race details");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceDetails();
  }, [eventId, selectedRaceId]);

  // Handlers
  const handleBack = () => {
    if (eventId) {
      navigate(`/events/event-details/${eventId}`);
    } else {
      navigate("/events/events-dashboard");
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    if (!eventId || !selectedRaceId) return;

    switch (newValue) {
      case 0:
        navigate("/events/events-dashboard");
        break;
      case 1:
        navigate(`/events/events-edit/${eventId}`);
        break;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // Stay on current page, just change the active tab
        break;
      default:
        break;
    }
  };

  const handleRaceChange = (newRaceId: string) => {
    if (!eventId) return;

    setSelectedRaceId(newRaceId);
    navigate(`/events/event-details/${eventId}/race/${newRaceId}`, {
      replace: true,
    });
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!eventId || !selectedRaceId) return null;

    switch (activeTab) {
      case 2:
        return <ViewParticipants eventId={eventId} raceId={selectedRaceId} />;
      case 3:
        return (
          <RaceDashboard
            raceId={Number(selectedRaceId)}
            raceName={race?.title || 'Race'}
            webhookBaseUrl={config.apiBaseUrl.replace(/\/api$/, '')}
          />
        );
      case 4:
        return <ViewCheckPoints eventId={eventId} raceId={selectedRaceId} races={races} />;
      case 5:
        return <Segments eventId={eventId} raceId={selectedRaceId} />;
      case 6:
        return <AddOrEditCertificate eventId={eventId} raceId={selectedRaceId} />;
      case 7:
        return <Leaderboard eventId={eventId} raceId={selectedRaceId} />;
      default:
        return null;
    }
  };

  // Loading state
  if (loading && !race) {
    return (
      <PageContainer sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </PageContainer>
    );
  }

  // No race found
  if (!race) {
    return (
      <PageContainer>
        <Alert severity="warning">Race not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Stack>

        <Typography variant="h4" component="h1" gutterBottom>
          {race.event?.name || "Event"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage race details, participants, and settings
        </Typography>

        {/* Race Selector */}
        {races.length > 0 && (
          <Card sx={{ p: 2.5, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1.5,
              }}
            >
              {races.length > 1 ? "Select Race:" : "Race:"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {races.map((raceItem) => (
                <Chip
                  key={raceItem.id}
                  label={`${raceItem.distance ? `${raceItem.distance} KM` : ""
                    } - ${raceItem.title}`}
                  onClick={() => handleRaceChange(raceItem.id)}
                  color={selectedRaceId === raceItem.id ? "primary" : "default"}
                  variant={
                    selectedRaceId === raceItem.id ? "filled" : "outlined"
                  }
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    height: "40px",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                />
              ))}
            </Stack>
          </Card>
        )}

        {race.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {race.description}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 2,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9375rem",
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<Dashboard />}
            iconPosition="start"
            label="Event Dashboard"
          />
          <Tab icon={<Edit />} iconPosition="start" label="Event Details" />
          <Tab icon={<People />} iconPosition="start" label="Participants" />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Dashboard" />
          <Tab icon={<Place />} iconPosition="start" label="Checkpoints" />
          <Tab icon={<Timer />} iconPosition="start" label="Segments" />
          <Tab
            icon={<EmojiEvents />}
            iconPosition="start"
            label="Add Certificate"
          />
          <Tab
            icon={<LeaderboardIcon />}
            iconPosition="start"
            label="Leaderboard"
          />
        </Tabs>
      </Paper>

      {/* Content Area */}
      {renderTabContent()}
    </PageContainer>
  );
};

export default ViewRaces;