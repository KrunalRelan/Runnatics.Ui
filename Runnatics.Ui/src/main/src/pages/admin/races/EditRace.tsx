import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { RaceService } from "@/main/src/services/RaceService";
import { CreateRaceRequest } from "@/main/src/models/races/CreateRaceRequest";
import { LeaderBoardSettings } from "@/main/src/models";
import { LeaderboardSettingsComponent } from "../shared/LeaderBoardSettings";

interface FormErrors {
  [key: string]: string;
}

export const EditRace: React.FC = () => {
  const navigate = useNavigate();
  const { raceId, eventId } = useParams<{ raceId: string; eventId: string }>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Toggle for overriding leaderboard settings at race level
  const [overrideLeaderboardSettings, setOverrideLeaderboardSettings] = useState(false);

  // Leaderboard settings state
  const [leaderBoardSettings, setLeaderBoardSettings] = useState<LeaderBoardSettings>({
    showOverallResults: true,
    showCategoryResults: true,
    sortByCategoryChipTime: true,
    sortByOverallChipTime: true,
    sortByOverallGunTime: false,
    sortByCategoryGunTime: false,
    numberOfResultsToShowOverall: 10,
    numberOfResultsToShowCategory: 5,
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
      publishDnf: false,
      dedUpSeconds: 0,
      earlyStartCutOff: 0,
      lateStartCutOff: 0,
      hasLoops: false,
      loopLength: 0,
      dataHeaders: "",
    },
    leaderboardSettings: undefined, // Will be set when override is enabled
  });

  // Fetch race data and populate form
  useEffect(() => {
    const fetchRace = async () => {
      if (!raceId || !eventId) {
        setError("Race or Event ID is missing");
        setLoading(false);
        return;
      }
      try {
        console.log("Event ID:", eventId);
        console.log("Race ID:", raceId);

        setLoading(true);
        const response = await RaceService.getRaceById(eventId, raceId);
        const raceData = response.message;
        if (raceData) {
          // Load race-level leaderboard settings if they exist
          if (raceData.leaderboardSettings) {
            const hasOverride = raceData.leaderboardSettings.overrideSettings ?? false;
            setOverrideLeaderboardSettings(hasOverride);

            setLeaderBoardSettings({
              showOverallResults: raceData.leaderboardSettings.showOverallResults ?? true,
              showCategoryResults: raceData.leaderboardSettings.showCategoryResults ?? true,
              sortByCategoryChipTime: raceData.leaderboardSettings.sortByCategoryChipTime ?? true,
              sortByOverallChipTime: raceData.leaderboardSettings.sortByOverallChipTime ?? true,
              sortByOverallGunTime: raceData.leaderboardSettings.sortByOverallGunTime ?? false,
              sortByCategoryGunTime: raceData.leaderboardSettings.sortByCategoryGunTime ?? false,
              numberOfResultsToShowOverall: raceData.leaderboardSettings.numberOfResultsToShowOverall ?? 10,
              numberOfResultsToShowCategory: raceData.leaderboardSettings.numberOfResultsToShowCategory ?? 5,
            });
          }

          setFormData({
            title: raceData.title || "",
            distance: raceData.distance || 0,
            description: raceData.description || "",
            startTime: raceData.startTime.toString() || "",
            endTime: raceData.endTime?.toString() || "",
            raceSettings: {
              published: raceData.raceSettings?.published ?? false,
              sendSms: raceData.raceSettings?.sendSms ?? false,
              checkValidation: raceData.raceSettings?.checkValidation ?? false,
              showLeaderboard: raceData.raceSettings?.showLeaderboard ?? true,
              showResultTable: raceData.raceSettings?.showResultTable ?? true,
              isTimed: raceData.raceSettings?.isTimed ?? false,
              publishDnf: raceData.raceSettings?.publishDnf ?? false,
              dedUpSeconds: raceData.raceSettings?.dedUpSeconds ?? 0,
              earlyStartCutOff: raceData.raceSettings?.earlyStartCutOff ?? 0,
              lateStartCutOff: raceData.raceSettings?.lateStartCutOff ?? 0,
              hasLoops: raceData.raceSettings?.hasLoops ?? false,
              loopLength: raceData.raceSettings?.loopLength ?? 0,
              dataHeaders: raceData.raceSettings?.dataHeaders ?? "",
            },
            leaderboardSettings: raceData.leaderboardSettings?.overrideSettings
              ? {
                  showOverallResults: raceData.leaderboardSettings.showOverallResults ?? true,
                  showCategoryResults: raceData.leaderboardSettings.showCategoryResults ?? true,
                  sortByCategoryChipTime: raceData.leaderboardSettings.sortByCategoryChipTime ?? true,
                  sortByOverallChipTime: raceData.leaderboardSettings.sortByOverallChipTime ?? true,
                  sortByOverallGunTime: raceData.leaderboardSettings.sortByOverallGunTime ?? false,
                  sortByCategoryGunTime: raceData.leaderboardSettings.sortByCategoryGunTime ?? false,
                  numberOfResultsToShowOverall: raceData.leaderboardSettings.numberOfResultsToShowOverall ?? 10,
                  numberOfResultsToShowCategory: raceData.leaderboardSettings.numberOfResultsToShowCategory ?? 5,
                }
              : undefined,
          });
        }
      } catch (err: any) {
        // Handle different error response structures
        let errorMessage = "Failed to load race details";

        // Don't show detailed error message for 500 errors
        if (err.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          // Extract error message from API response
          errorMessage =
            err.response?.data?.error?.message || // API error structure { error: { message: "..." } }
            err.response?.data?.message || // Alternative structure
            err.userMessage || // From axios interceptor
            "Failed to load race details";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchRace();
  }, [raceId, eventId]);

  // Update formData when override toggle or leaderboard settings change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      leaderboardSettings: overrideLeaderboardSettings ? leaderBoardSettings : undefined,
    }));
  }, [overrideLeaderboardSettings, leaderBoardSettings]);

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
      "dedUpSeconds",
      "earlyStartCutOff",
      "lateStartCutOff",
      "loopLength",
      "dataHeaders",
    ];
    if (raceSettingsFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        raceSettings: {
          ...prev.raceSettings,
          [name]: processedValue,
        } as CreateRaceRequest["raceSettings"],
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
      if (name === "hasLoops" && !e.target.checked) {
        updates.loopLength = 0;
      }
      return {
        ...prev,
        raceSettings: {
          ...prev.raceSettings,
          ...updates,
        } as CreateRaceRequest["raceSettings"],
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
      const requestPayload: CreateRaceRequest = {
        title: formData.title,
        distance: formData.distance,
        description: formData.description || "",
        startTime: formData.startTime,
        endTime: formData.endTime,
        overrideSettings: overrideLeaderboardSettings,
        raceSettings: {
          published: formData.raceSettings?.published ?? false,
          sendSms: formData.raceSettings?.sendSms ?? false,
          checkValidation: formData.raceSettings?.checkValidation ?? false,
          showLeaderboard: formData.raceSettings?.showLeaderboard ?? true,
          showResultTable: formData.raceSettings?.showResultTable ?? true,
          isTimed: formData.raceSettings?.isTimed ?? false,
          publishDnf: formData.raceSettings?.publishDnf ?? false,
          dedUpSeconds: formData.raceSettings?.dedUpSeconds ?? 0,
          earlyStartCutOff: formData.raceSettings?.earlyStartCutOff ?? 0,
          lateStartCutOff: formData.raceSettings?.lateStartCutOff ?? 0,
          hasLoops: formData.raceSettings?.hasLoops ?? false,
          loopLength: formData.raceSettings?.loopLength ?? 0,
          dataHeaders: formData.raceSettings?.dataHeaders ?? "",
        },
      };

      // Only include leaderboardSettings if override is enabled
      if (overrideLeaderboardSettings) {
        requestPayload.leaderboardSettings = {
          showOverallResults: leaderBoardSettings.showOverallResults,
          showCategoryResults: leaderBoardSettings.showCategoryResults,
          sortByCategoryChipTime: leaderBoardSettings.sortByCategoryChipTime,
          sortByOverallChipTime: leaderBoardSettings.sortByOverallChipTime,
          sortByOverallGunTime: leaderBoardSettings.sortByOverallGunTime,
          sortByCategoryGunTime: leaderBoardSettings.sortByCategoryGunTime,
          numberOfResultsToShowOverall: leaderBoardSettings.numberOfResultsToShowOverall,
          numberOfResultsToShowCategory: leaderBoardSettings.numberOfResultsToShowCategory,
        };
      }

      console.log("Updating race with payload:", requestPayload);

      await RaceService.updateRace(eventId!, raceId!, requestPayload);
      setSnackbar({
        open: true,
        message: `Race "${requestPayload.title}" updated successfully!`,
        severity: "success",
      });
      // Redirect after 1 second (1000 ms)
      setTimeout(() => {
        navigate(`/events/event-details/${eventId}`);
      }, 1000);
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Failed to update race. Please try again.";

      // Don't show detailed error message for 500 errors
      if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        // Extract error message from API response
        errorMessage =
          err.response?.data?.error?.message || // API error structure { error: { message: "..." } }
          err.response?.data?.message || // Alternative structure
          err.userMessage || // From axios interceptor
          "Failed to update race. Please try again.";
      }

      setError(errorMessage);
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
          Edit Race - {formData.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update race details for this event
        </Typography>
      </Box>

      {/* Error Alert - shown at the top of the form */}
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }}>
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
                inputProps={{ min: 0, step: "any" }} // <-- use step: "any"
              />
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
              {/* General Settings */}
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
                        checked={formData.raceSettings?.publishDnf}
                        onChange={handleRaceSettingsSwitchChange("publishDnf")}
                      />
                    }
                    label="Publish DNF"
                  />
                </Stack>
              </Box>

              {/* Timing Settings */}
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

          {/* Use the shared LeaderboardSettings component */}
          <LeaderboardSettingsComponent
            settings={leaderBoardSettings}
            onSettingsChange={setLeaderBoardSettings}
            showOverrideToggle={true}
            overrideEnabled={overrideLeaderboardSettings}
            onOverrideToggle={setOverrideLeaderboardSettings}
            title="Leaderboard Settings"
          />

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
              {isSubmitting ? "Updating Race..." : "Update Race"}
            </Button>
          </Box>
        </form>
      </Paper>
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