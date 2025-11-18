import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Snackbar,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { EventService } from "../../../services/EventService";
import { RaceService } from "../../../services/RaceService";
import { Event } from "../../../models/Event";
import { CreateRaceRequest } from "@/main/src/models/races/CreateRaceRequest";

interface FormErrors {
  [key: string]: string;
}

export const AddRace: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Snackbar for success/error messages
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState<CreateRaceRequest>({
    title: "",
    distance: 0,
    description: "",
    startTime: "",
    endTime: "",
    raceSettings: {
      published: false,
      sendSms: false,
      checkValidation: false,
      showLeaderboard: true,
      showResultTable: true,
      isTimed: false,
      publichDnf: false,
      dedUpSeconds: 0,
      earlyStartCutOff: 300,
      lateStartCutOff: 1200,
      hasLoops: false,
      loopLength: 0,
      dataHeaders: "",
    }
  });

  // Fetch event data 
  // Fetch event data to display event name
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await EventService.getEventById(eventId);
        const eventData = response.message || response;
        setEvent(eventData);

        // Set default date from event date (if available)
        if (eventData?.eventDate) {
          const eventDate = new Date(eventData.eventDate);
          const dateStr = eventDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format

          // Set default start time to event date at 06:00 AM
          const defaultStartTime = `${dateStr}T06:00`;
          // Set default end time to event date at 18:00 (6:00 PM)
          const defaultEndTime = `${dateStr}T18:00`;

          setFormData((prev) => ({
            ...prev,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
          }));
        }
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
    navigate(`/events/event-details/${eventId}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;
    if (type === "number") {
      processedValue = value === "" ? undefined : parseFloat(value);
    }

    // Check if this field belongs to raceSettings
    const raceSettingsFields = [
      'dedUpSeconds', 'earlyStartCutOff', 'lateStartCutOff',
      'loopLength', 'dataHeaders'
    ];

    if (raceSettingsFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        raceSettings: {
          ...prev.raceSettings,
          [name]: processedValue,
        } as CreateRaceRequest['raceSettings'],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRaceSettingsSwitchChange = (name: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => {
      const updates: any = { [name]: e.target.checked };

      // Clear loopLength when hasLoops is turned off
      if (name === 'hasLoops' && !e.target.checked) {
        updates.loopLength = 0;
      }

      return {
        ...prev,
        raceSettings: {
          ...prev.raceSettings,
          ...updates,
        } as CreateRaceRequest['raceSettings'],
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.distance || formData.distance <= 0) {
      newErrors.distance = "Distance must be greater than 0";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Validate start time is before end time
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the request payload
      const requestPayload: CreateRaceRequest = {
        title: formData.title,
        distance: formData.distance,
        description: formData.description || "",
        startTime: formData.startTime,
        endTime: formData.endTime,
        raceSettings: {
          published: formData.raceSettings?.published ?? false,
          sendSms: formData.raceSettings?.sendSms ?? false,
          checkValidation: formData.raceSettings?.checkValidation ?? false,
          showLeaderboard: formData.raceSettings?.showLeaderboard ?? true,
          showResultTable: formData.raceSettings?.showResultTable ?? true,
          isTimed: formData.raceSettings?.isTimed ?? false,
          publichDnf: formData.raceSettings?.publichDnf ?? false,
          dedUpSeconds: formData.raceSettings?.dedUpSeconds ?? 0,
          earlyStartCutOff: formData.raceSettings?.earlyStartCutOff ?? 0,
          lateStartCutOff: formData.raceSettings?.lateStartCutOff ?? 0,
          hasLoops: formData.raceSettings?.hasLoops ?? false,
          loopLength: formData.raceSettings?.loopLength ?? 0,
          dataHeaders: formData.raceSettings?.dataHeaders ?? "",
        }
      };

      console.log("Creating race with data:", requestPayload);

      // Call the API
      const createdRace = await RaceService.createRace(Number(eventId!), requestPayload);

      if (createdRace) {
        // Show success message
        setSnackbar({
          open: true,
          message: `Race "${requestPayload.title}" created successfully!`,
          severity: 'success',
        });
      }

      // After successful creation, navigate back to event details
      navigate(`/events/event-details/${eventId}`);
    } catch (err: any) {
      console.error("Error creating race:", err);
      setError(
        err.response?.data?.message || "Failed to create race. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Event
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Race - {event?.name || "Event"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new race for this event
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}>
              {/* Title */}
              <TextField
                fullWidth
                label="Race Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., 10K Run, Half Marathon"
                required
              />

              {/* Distance */}
              <TextField
                fullWidth
                label="Distance (in KMs)"
                name="distance"
                type="number"
                value={formData.distance || ""}
                onChange={handleInputChange}
                error={!!errors.distance}
                helperText={errors.distance}
                placeholder="e.g., 10, 21.1, 42.2"
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Stack>
            <Box sx={{ flex: 1 }} /> {/* Spacer */}
            {/* Time Fields */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* Start Time */}
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleInputChange}
                error={!!errors.startTime}
                helperText={errors.startTime}
                required
                InputLabelProps={{ shrink: true }}
              />

              {/* End Time */}
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleInputChange}
                error={!!errors.endTime}
                helperText={errors.endTime}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>

          {/* Race Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Race Settings
            </Typography>

            {/* Two Column Layout with Dividers */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0}
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: "none", md: "block" },
                    mx: 2,
                  }}
                />
              }
            >
              {/* Left Side - General Settings */}
              <Box sx={{ flex: 1, pr: { xs: 0, md: 1 } }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  General Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.published}
                        onChange={handleRaceSettingsSwitchChange("published")}
                      />
                    }
                    label="Published"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.sendSms}
                        onChange={handleRaceSettingsSwitchChange("sendSms")}
                      />
                    }
                    label="Send SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.checkValidation}
                        onChange={handleRaceSettingsSwitchChange("checkValidation")}
                      />
                    }
                    label="Check Validation"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.showLeaderboard}
                        onChange={handleRaceSettingsSwitchChange("showLeaderboard")}
                      />
                    }
                    label="Show Leaderboard"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.showResultTable}
                        onChange={handleRaceSettingsSwitchChange("showResultTable")}
                      />
                    }
                    label="Show Result Table"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.isTimed}
                        onChange={handleRaceSettingsSwitchChange("isTimed")}
                      />
                    }
                    label="Is Timed"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.raceSettings?.publichDnf}
                        onChange={handleRaceSettingsSwitchChange("publichDnf")}
                      />
                    }
                    label="Publish DNF"
                  />
                </Stack>
              </Box>

              {/* Right Side - Timing Settings */}
              <Box sx={{ flex: 1, pl: { xs: 0, md: 2 }, mt: { xs: 3, md: 0 } }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Timing Settings
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Dedup Seconds"
                    name="dedUpSeconds"
                    type="number"
                    value={formData.raceSettings?.dedUpSeconds || ""}
                    onChange={handleInputChange}
                    error={!!errors.dedUpSeconds}
                    helperText={errors.dedUpSeconds || "Seconds to deduplicate readings"}
                    inputProps={{ min: 0, step: 1 }}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField
                      fullWidth
                      label="Early Start Cutoff"
                      name="earlyStartCutOff"
                      type="number"
                      value={formData.raceSettings?.earlyStartCutOff || ""}
                      onChange={handleInputChange}
                      error={!!errors.earlyStartCutOff}
                      helperText={errors.earlyStartCutOff || "Seconds before start time"}
                      inputProps={{ min: 0, step: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Late Start Cutoff"
                      name="lateStartCutOff"
                      type="number"
                      value={formData.raceSettings?.lateStartCutOff || ""}
                      onChange={handleInputChange}
                      error={!!errors.lateStartCutOff}
                      helperText={errors.lateStartCutOff || "Seconds after start time"}
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Stack>

                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                    Loops
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.raceSettings?.hasLoops}
                          onChange={handleRaceSettingsSwitchChange("hasLoops")}
                        />
                      }
                      label="Has Loops"
                      sx={{ flex: 1, minWidth: 250, maxWidth: 250 }}
                    />

                    <TextField
                      fullWidth
                      label="Loop Length (km)"
                      name="loopLength"
                      type="number"
                      value={formData.raceSettings?.loopLength ?? ""}
                      onChange={handleInputChange}
                      error={!!errors.loopLength}
                      helperText={errors.loopLength}
                      inputProps={{ min: 0, step: 0.01 }}
                      disabled={!formData.raceSettings?.hasLoops}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Data Headers"
                    name="dataHeaders"
                    type="text"
                    value={formData.raceSettings?.dataHeaders || ""}
                    onChange={handleInputChange}
                    error={!!errors.dataHeaders}
                    helperText={errors.dataHeaders || "Data Field Headers"}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Form Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isSubmitting}
              size="large"
              fullWidth={false}
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              size="large"
              fullWidth={false}
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              {isSubmitting ? "Creating Race..." : "Create Race"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};