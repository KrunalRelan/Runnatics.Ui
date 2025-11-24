import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { EventService } from "../../../services/EventService";
import { RaceService } from "../../../services/RaceService";
import RaceList from "../races/RaceList";
import {
  SearchCriteria,
  deafaultSearchCriteria,
} from "@/main/src/models/SearchCriteria";

const ViewEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Search criteria state
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    deafaultSearchCriteria
  );

  // Snackbar for success/error messages
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Fetch event data using React Query
  const {
    data: event,
    isLoading: loading,
    error: eventError,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Event ID is missing");
      }
      const response = await EventService.getEventById(eventId);
      return response.message || response;
    },
    enabled: !!eventId,
    retry: 1,
  });

  // ✅ Fetch races using React Query
  const {
    data: racesData,
    isLoading: racesLoading,
    error: racesErrorObj,
  } = useQuery({
    queryKey: ["races", eventId, searchCriteria],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Event ID is missing");
      }
      const response = await RaceService.getAllRaces({
        eventId: eventId,
        searchCriteria: searchCriteria,
      });
      return {
        races: response.message || [],
        totalCount: response.totalCount || 0,
      };
    },
    enabled: !!eventId,
    retry: 1,
  });

  // Extract races and totalCount
  const races = racesData?.races || [];
  const totalCount = racesData?.totalCount || 0;

  // Format errors
  const error = eventError
    ? (eventError as any)?.response?.data?.message ||
      eventError.message ||
      "Failed to load event details"
    : null;

  const racesError = racesErrorObj
    ? (racesErrorObj as any)?.response?.data?.message ||
      racesErrorObj.message ||
      "Failed to load races"
    : null;

  const handleBack = () => {
    navigate("/events/events-dashboard");
  };

  const handleAddRace = () => {
    if (eventId) {
      navigate(`/events/event-details/${eventId}/race/add`);
    }
  };

  const handleEditRace = (raceId: string) => {
    if (eventId) {
      navigate(`/events/event-details/${eventId}/race/edit/${raceId}`);
    }
  };

  const handleSearchCriteriaChange = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Event not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.name}
            </Typography>
            {event.eventSettings?.published && (
              <Chip
                label="Published"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRace}
            size="large"
          >
            Add Race
          </Button>
        </Box>
      </Box>

      {/* Event Details Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Event Details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Event Name and Date Row */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <PublicIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Event Name
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {event.name || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Event Date
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatDate(event.eventDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Venue and Organizer Row */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <LocationIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Venue
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {event.venueName || "N/A"}
                    </Typography>
                    {event.venueAddress && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {event.venueAddress}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <BusinessIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Organizer
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {event.eventOrganizerName || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Description */}
            {event.description && (
              <Box>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ minWidth: 24 }} />
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {event.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Additional Info */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time Zone
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.timeZone || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Participants
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.maxParticipants || "Unlimited"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Deadline
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(event.registrationDeadline)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.status || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Races Section */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Races</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRace}
            >
              Add Race
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {racesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : racesError ? (
            <Alert severity="error">{racesError}</Alert>
          ) : (
            <RaceList
              races={races}
              searchCriteria={searchCriteria}
              totalCount={totalCount}
              loading={racesLoading}
              onSearchCriteriaChange={handleSearchCriteriaChange}
              onEdit={handleEditRace}
            />
          )}
        </CardContent>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewEvent;
