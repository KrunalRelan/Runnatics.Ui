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
  Grid,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { EventService } from "../../../services/EventService";
import { Event } from "../../../models/Event";

interface RaceFormData {
  title: string;
  distanceInKms: number | undefined;
  startTime: string;
  endTime: string;
  // Settings - Section 1
  published: boolean;
  sendSms: boolean;
  checkValidation: boolean;
  showLeaderboard: boolean;
  showResultTable: boolean;
  isTimed: boolean;
  // Settings - Section 2
  dedupSeconds: number | undefined;
  earlyStartCutoff: number | undefined;
  lateStartCutoff: number | undefined;
}

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

  const [formData, setFormData] = useState<RaceFormData>({
    title: "",
    distanceInKms: undefined,
    startTime: "",
    endTime: "",
    // Settings - Section 1
    published: false,
    sendSms: false,
    checkValidation: true,
    showLeaderboard: true,
    showResultTable: true,
    isTimed: true,
    // Settings - Section 2
    dedupSeconds: 0,
    earlyStartCutoff: 0,
    lateStartCutoff: 0,
  });

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

  const handleBack = () => {
    navigate(`/events/events-detail/${eventId}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;
    if (type === "number") {
      processedValue = value === "" ? undefined : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (name: keyof RaceFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.distanceInKms || formData.distanceInKms <= 0) {
      newErrors.distanceInKms = "Distance must be greater than 0";
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
      // TODO: Implement race creation API call
      console.log("Creating race with data:", formData);

      // After successful creation, navigate back to event details
      // navigate(`/events/events-detail/${eventId}`);

      // For now, just show success message
      alert("Race created successfully!");
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
                name="distanceInKms"
                type="number"
                value={formData.distanceInKms || ""}
                onChange={handleInputChange}
                error={!!errors.distanceInKms}
                helperText={errors.distanceInKms}
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
                        checked={formData.published}
                        onChange={handleSwitchChange("published")}
                      />
                    }
                    label="Published"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sendSms}
                        onChange={handleSwitchChange("sendSms")}
                      />
                    }
                    label="Send SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.checkValidation}
                        onChange={handleSwitchChange("checkValidation")}
                      />
                    }
                    label="Check Validation"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.showLeaderboard}
                        onChange={handleSwitchChange("showLeaderboard")}
                      />
                    }
                    label="Show Leaderboard"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.showResultTable}
                        onChange={handleSwitchChange("showResultTable")}
                      />
                    }
                    label="Show Result Table"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isTimed}
                        onChange={handleSwitchChange("isTimed")}
                      />
                    }
                    label="Is Timed"
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
                    name="dedupSeconds"
                    type="number"
                    value={formData.dedupSeconds || ""}
                    onChange={handleInputChange}
                    error={!!errors.dedupSeconds}
                    helperText={errors.dedupSeconds || "Seconds to deduplicate readings"}
                    inputProps={{ min: 0, step: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Early Start Cutoff"
                    name="earlyStartCutoff"
                    type="number"
                    value={formData.earlyStartCutoff || ""}
                    onChange={handleInputChange}
                    error={!!errors.earlyStartCutoff}
                    helperText={errors.earlyStartCutoff || "Seconds before start time"}
                    inputProps={{ min: 0, step: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Late Start Cutoff"
                    name="lateStartCutoff"
                    type="number"
                    value={formData.lateStartCutoff || ""}
                    onChange={handleInputChange}
                    error={!!errors.lateStartCutoff}
                    helperText={errors.lateStartCutoff || "Seconds after start time"}
                    inputProps={{ min: 0, step: 1 }}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasLoops}
                          onChange={handleSwitchChange("hasLoops")}
                        />
                      }
                      label="Has Loops"
                      sx={{ flex: 1, minWidth: 160, maxWidth: 180 }}
                    />

                    <TextField
                      fullWidth
                      label="Loop Length (km)"
                      name="loopLength"
                      type="number"
                      value={formData.loopLength ?? ""}
                      onChange={handleInputChange}
                      error={!!errors.loopLength}
                      helperText={errors.loopLength}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Data Header"
                    name="dataHeader"
                    type="text"
                    value={formData.dataHeader || ""}
                    onChange={handleInputChange}
                    error={!!errors.dataHeader}
                    helperText={errors.dataHeader}
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
    </Container >
  );
};
