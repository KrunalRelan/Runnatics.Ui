import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Event } from "../../../models/Event";
import { RaceService } from '../../../services/RaceService';
import RaceList from "../races/RaceList";
import { Race } from "@/main/src/models/races/Race";

const ViewEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [racesError, setRacesError] = useState<string | null>(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await EventService.getEventById(eventId);
        setEvent(response.message || response);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Fetch races for event
  useEffect(() => {
    if (!eventId) return;
    setRacesLoading(true);
    setRacesError(null);
    RaceService.getAllRaces({ eventId: eventId, searchCriteria: { pageNumber: 1, pageSize: 10 } })
      .then(response => setRaces(response.message || []))
      .catch(err => {
        setRacesError(err?.response?.data?.message || 'Failed to load races');
        setRaces([]);
      })
      .finally(() => setRacesLoading(false));
  }, [eventId]);

  const handleBack = () => {
    navigate("/events/events-dashboard");
  };

  const handleAddRace = () => {
    if (eventId) {
      navigate(`/events/${eventId}/races/add`);
    }
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
      <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Event Name and Date Row */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
                  <Box sx={{ width: '100%' }}>
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
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2
              }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : racesError ? (
            <Alert severity="error">{racesError}</Alert>
          ) : (
            <RaceList
              races={races}
              pageNumber={1}
              pageSize={10}
              totalRecords={races.length}
              totalPages={1}
              onPageChange={() => {}}
              onPageSizeChange={() => {}} 
              onEdit={() => {}}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

/**
 * ViewEvent
 *
 * Top-level admin events view page component.
 *
 * Renders a detailed view for a specific event, including all relevant
 * information such as event details, participants, and any other
 * pertinent data.
 *
 * Responsibilities:
 * - Orchestrates data loading and handles loading / error states.
 * - Exposes UI for filtering, paging, and sorting event collections.
 * - Delegates detailed rendering to child components (charts, tables, forms).
 * - Integrates with navigation and authorization guards provided by the app.
 *
 * Usage:
 * - This component is intended to be used as the default export for the
 *   admin/events dashboard route, e.g. <Route path="/admin/events" element={<Dashboard />} />.
 *
 * Accessibility:
 * - Ensure interactive child components provide appropriate ARIA attributes
 *   (labels, roles, keyboard focus management) for assistive technologies.
 *
 * Notes:
 * - Keep side effects (data fetching, subscriptions) contained and cleaned up
 *   to avoid memory leaks when navigating away from the page.
 *
 * @returns JSX.Element - The rendered admin events view page.
 */
export default ViewEvent;

