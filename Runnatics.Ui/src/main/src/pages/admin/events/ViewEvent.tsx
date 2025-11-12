import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
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

const ViewEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setEvent(response);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBack = () => {
    navigate("/events/events-dashboard");
  };

  const handleAddRace = () => {
    // TODO: Navigate to Add Race page or open Add Race dialog
    console.log("Add Race clicked for event:", eventId);
    // navigate(`/events/${eventId}/races/create`);
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

          <Grid container spacing={3}>
            {/* Event Name */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Event Date */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Venue */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Organizer */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Description */}
            {event.description && (
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ minWidth: 24 }} /> {/* Spacer to align with other fields */}
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {event.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            )}

            {/* Additional Info */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time Zone
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.timeZone || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Participants
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.maxParticipants || "Unlimited"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Deadline
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(event.registrationDeadline)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.status || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Races Section - Placeholder */}
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
          <Typography variant="body2" color="text.secondary" align="center">
            No races added yet. Click "Add Race" to create the first race for this event.
          </Typography>
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

