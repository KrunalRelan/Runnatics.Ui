import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  Paper,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// If your project requires it, you can instead do:
// import { SelectChangeEvent } from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";

import { EventService } from "../../../services/EventService";
import {
  EventOrganizer,
  EventType,
  timeZoneOptions,
  EventSettings,
  LeaderBoardSettings,
  EventStatus,
  CreateEventRequest,
} from "@/main/src/models";
import { EventOrganizerService } from "@/main/src/services/EventOrganizerService";
import { LeaderboardSettingsComponent } from "../shared/LeaderboardSettings";

interface FormErrors {
  [key: string]: string;
}

interface EventOrganizerRequest {
  EventOrganizerName: string;
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [organizations, setOrganizations] = useState<EventOrganizer[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Selected organization state
  const [selectedOrganization, setSelectedOrganization] =
    useState<EventOrganizer | null>(null);

  // Add New Organization Dialog state
  const [openAddOrgDialog, setOpenAddOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [orgError, setOrgError] = useState("");

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


  // Event Settings state
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    id: undefined,
    eventId: undefined,
    removeBanner: false,
    published: true,
    rankOnNet: false,
    showResultSummaryForRaces: false,
    useOldData: false,
    confirmedEvent: false,
    allowNameCheck: false,
    allowParticipantEdit: false,
    createdAt: undefined,
  });

  const [leaderBoardSettings, setLeaderBoardSettings] =
    useState<LeaderBoardSettings>({
      showOverallResults: true,
      showCategoryResults: true,
      sortByCategoryChipTime: true,
      sortByOverallChipTime: true,
      sortByOverallGunTime: false,
      sortByCategoryGunTime: false,
      numberOfResultsToShowOverall: 10,
      numberOfResultsToShowCategory: 5,
    });

  const [formData, setFormData] = useState<CreateEventRequest>({
    tenantId: "",
    eventOrganizerId: "",
    name: "",
    description: "",
    eventType: EventType.Marathon,
    startDate: "",
    endDate: "",
    registrationOpenDate: "",
    registrationCloseDate: "",
    location: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    capacity: undefined,
    price: undefined,
    currency: "INR",
    timeZone: "Asia/Kolkata",
    smsText: "",
    leaderBoardSettings: {
      showOverallResults: true,
      showCategoryResults: true,
      sortByOverallChipTime: true,
      sortByCategoryChipTime: true,
      sortByOverallGunTime: true,
      sortByCategoryGunTime: true,
      numberOfResultsToShowOverall: 10,
      numberOfResultsToShowCategory: 5,
    },
    eventSettings: {
      removeBanner: false,
      published: true,
      rankOnNet: false,
      allowParticipantEdit: false,
      useOldData: false,
      confirmedEvent: true,
      allowNameCheck: true,
      showResultSummaryForRaces: false,
    },
  });

  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") || "" : "";

  // Use ref to track if organizations have been fetched
  const hasLoadedOrgs = useRef(false);

  // Fetch organizations on component mount
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchOrganizations = async () => {
      if (hasLoadedOrgs.current) return;
      hasLoadedOrgs.current = true;
      setIsLoadingOrgs(true);

      console.log("🚀 Starting to fetch organizations...");

      try {
        const response = await EventOrganizerService.getOrganizations();
        console.log("Fetched organizations:", response);

        // Always update state when we get a response, even if component unmounted
        const mappedOrgs = response.map((org) => ({
          id: org.id,
          tenantId: org.tenantId,
          name: org.organizerName || org.name || "",
          organizerName: org.organizerName || org.name || "",
        }));

        setOrganizations(mappedOrgs);
        setIsLoadingOrgs(false);
      } catch (error) {
        console.error("Error loading organizations:", error);
        setErrors((prev) => ({
          ...prev,
          tenantId: "Failed to load organizations",
        }));
        setIsLoadingOrgs(false);
      }
      
      // Failsafe: ensure loading is cleared after 30 seconds
      timeoutId = setTimeout(() => {
        console.warn("Timeout: Clearing loading state after 30s");
        setIsLoadingOrgs(false);
      }, 30000);
    };

    fetchOrganizations();

    return () => {
      console.log("🧹 Cleanup - component unmounting");
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Sync event settings and leaderboard settings with formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      eventSettings,
      leaderBoardSettings,
    }));
  }, [eventSettings, leaderBoardSettings]);

  // Handle input changes for TextField
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

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;

    const processedValue = value === "" ? null : value;

    setFormData((prev) => ({
      ...prev,
      [name as string]: processedValue,
    }));

    if (name && errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle organization selection
  const handleOrganizationChange = (
    _event: any,
    newValue: EventOrganizer | null
  ) => {
    setSelectedOrganization(newValue);

    setFormData((prev) => ({
      ...prev,
      tenantId: newValue?.tenantId || "",
      eventOrganizerId: newValue?.id || "",
    }));

    if (errors.tenantId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tenantId;
        return newErrors;
      });
    }
  };

  // Handle "Add New Organization" button click
  const handleAddNewOrganization = (searchValue: string) => {
    setNewOrgName(searchValue || "");
    setOpenAddOrgDialog(true);
    setOrgError("");
  };

  // Handle creating new organization
  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      setOrgError("Organization name is required");
      return;
    }

    setIsCreatingOrg(true);
    setOrgError("");

    try {
      const request: EventOrganizerRequest = {
        EventOrganizerName: newOrgName.trim(),
      };

      const response = await EventOrganizerService.createOrganization(request);

      const newOrg: EventOrganizer = {
        id: response.id,
        tenantId: response.tenantId,
        name: response.organizerName || newOrgName.trim(),
        organizerName: response.organizerName || newOrgName.trim(),
      };

      setOrganizations((prev) => [...prev, newOrg]);
      setSelectedOrganization(newOrg);

      setFormData((prev) => ({
        ...prev,
        tenantId: newOrg.tenantId,
        eventOrganizerId: newOrg.id,
      }));

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tenantId;
        return newErrors;
      });

      setOpenAddOrgDialog(false);
      setNewOrgName("");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create organization. Please try again.";

      setOrgError(errorMessage);
    } finally {
      setIsCreatingOrg(false);
    }
  };

  // Handle file upload
  const handleFileChange = (file: File | null) => {
    setBannerFile(file);
    if (errors.bannerImage) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.bannerImage;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.eventOrganizerId || formData.eventOrganizerId === "") {
      newErrors.tenantId = "Event organizer is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.timeZone) {
      newErrors.timeZone = "Time zone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setApiError("");
    setErrors({});
    const isValid = validateForm();

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { capacity, price, currency, ...apiData } = formData;

      const eventOrganizerIdForApi = formData.eventOrganizerId;

      if (!eventOrganizerIdForApi || eventOrganizerIdForApi === "") {
        throw new Error("Invalid organization selection");
      }

      console.log(
        "Event Organizer ID being sent to API:",
        eventOrganizerIdForApi
      );

      const requestPayload = {
        eventOrganizerId: eventOrganizerIdForApi,
        name: apiData.name,
        slug: apiData.name.toLowerCase().replace(/\s+/g, "-"),
        description: apiData.description || null,
        eventDate: apiData.startDate,
        timeZone: apiData.timeZone || "Asia/Kolkata",
        venueName: apiData.location || null,
        venueAddress:
          `${apiData.city}, ${apiData.state}, ${apiData.country}, ${apiData.zipCode}` || null,
        city: apiData.city || null,
        state: apiData.state || null,
        country: apiData.country || null,
        zipCode: apiData.zipCode || null,
        venueLatitude: null,
        venueLongitude: null,
        status: EventStatus.Draft,
        maxParticipants: 1000,
        registrationDeadline:
          apiData.registrationCloseDate || apiData.startDate || null,
        eventType: apiData.eventType,
        eventSettings: eventSettings
          ? {
            removeBanner: eventSettings.removeBanner || false,
            published: eventSettings.published || false,
            rankOnNet:
              eventSettings.rankOnNet !== undefined
                ? eventSettings.rankOnNet
                : true,
            showResultSummaryForRaces:
              eventSettings.showResultSummaryForRaces !== undefined
                ? eventSettings.showResultSummaryForRaces
                : true,
            useOldData: eventSettings.useOldData || false,
            confirmedEvent: eventSettings.confirmedEvent || false,
            allowNameCheck:
              eventSettings.allowNameCheck !== undefined
                ? eventSettings.allowNameCheck
                : true,
            allowParticipantEdit:
              eventSettings.allowParticipantEdit !== undefined
                ? eventSettings.allowParticipantEdit
                : true,
          }
          : {
            removeBanner: false,
            published: false,
            rankOnNet: true,
            showResultSummaryForRaces: true,
            useOldData: false,
            confirmedEvent: false,
            allowNameCheck: true,
            allowParticipantEdit: true,
          },

        leaderboardSettings: leaderBoardSettings
          ? {
            showOverallResults:
              leaderBoardSettings.showOverallResults || false,
            showCategoryResults:
              leaderBoardSettings.showCategoryResults || false,
            showGenderResults: true,
            showAgeGroupResults: true,
            sortByOverallChipTime:
              leaderBoardSettings.sortByOverallChipTime || false,
            sortByOverallGunTime:
              leaderBoardSettings.sortByOverallGunTime || false,
            sortByCategoryChipTime:
              leaderBoardSettings.sortByCategoryChipTime || false,
            sortByCategoryGunTime:
              leaderBoardSettings.sortByCategoryGunTime || false,
            numberOfResultsToShowOverall:
              leaderBoardSettings.numberOfResultsToShowOverall || 10,
            numberOfResultsToShowCategory:
              leaderBoardSettings.numberOfResultsToShowCategory || 5,
            enableLiveLeaderboard: true,
            showSplitTimes: true,
            showPace: true,
            showTeamResults: false,
            showMedalIcon: true,
            allowAnonymousView: true,
            autoRefreshIntervalSec: 30,
            maxDisplayedRecords: Math.max(
              leaderBoardSettings.numberOfResultsToShowOverall || 10,
              leaderBoardSettings.numberOfResultsToShowCategory || 5
            ),
          }
          : {
            showOverallResults: false,
            showCategoryResults: false,
            showGenderResults: true,
            showAgeGroupResults: true,
            sortByOverallChipTime: false,
            sortByOverallGunTime: false,
            sortByCategoryChipTime: false,
            sortByCategoryGunTime: false,
            numberOfResultsToShowOverall: 10,
            numberOfResultsToShowCategory: 5,
            enableLiveLeaderboard: true,
            showSplitTimes: true,
            showPace: true,
            showTeamResults: false,
            showMedalIcon: true,
            allowAnonymousView: true,
            autoRefreshIntervalSec: 30,
            maxDisplayedRecords: 100,
          },
      };
      const createdEvent = await EventService.createEvent(
        requestPayload as any
      );

      setSnackbar({
        open: true,
        message: `Event "${requestPayload.name}" created successfully!`,
        severity: "success",
      });
      // Redirect after 1 second (1000 ms)
      setTimeout(async () => {
        if (bannerFile && createdEvent.id) {
          await EventService.uploadBannerImage(createdEvent.id, bannerFile);
        }
        navigate("/events/events-dashboard");
      }, 1000);
    } catch (error: any) {
      let errorMessage = "Failed to create event. Please try again.";

      if (error.response) {
        if (error.response.data?.errors) {
          setErrors(error.response.data.errors);
          errorMessage = "Please fix the validation errors below.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage =
            "Authentication failed. Please check if you are logged in and your token is valid.";
        } else if (error.response.status === 403) {
          errorMessage = "You do not have permission to create events.";
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setApiError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      )
    ) {
      navigate("/events");
    }
  };

  const eventTypeOptions = (
    Object.values(EventType) as Array<string | number>
  ).map((type) => ({
    value: type as string | number,
    label: String(type),
  }));

  const handleBack = () => {
    navigate(`/events/events-dashboard`);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Event
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the details below to create a new event
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* API Error Alert */}
          {apiError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setApiError("")}
            >
              <AlertTitle>Error</AlertTitle>
              {apiError}
            </Alert>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Please fix the following errors:</AlertTitle>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Basic Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              {/* Left Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* Event Name */}
                <TextField
                  fullWidth
                  label="Event Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="Enter event name"
                  required
                />

                {/* Organization Autocomplete with Add New */}
                <Autocomplete
                  fullWidth
                  options={organizations}
                  getOptionLabel={(option) =>
                    option.name || option.organizerName || ""
                  }
                  value={selectedOrganization}
                  onChange={handleOrganizationChange}
                  loading={isLoadingOrgs}
                  disabled={isLoadingOrgs}
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option) =>
                      (option.name || option.organizerName || "")
                        .toLowerCase()
                        .includes(params.inputValue.toLowerCase())
                    );

                    // Show "Add New" option if no exact match found
                    if (
                      params.inputValue !== "" &&
                      !filtered.some(
                        (option) =>
                          (
                            option.name ||
                            option.organizerName ||
                            ""
                          ).toLowerCase() === params.inputValue.toLowerCase()
                      )
                    ) {
                      filtered.push({
                        id: "add-new",
                        name: `Add "${params.inputValue}"`,
                        organizerName: params.inputValue,
                        tenantId: "",
                      } as EventOrganizer);
                    }

                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Event Organizer"
                      placeholder="Search or add new organizer"
                      required
                      error={!!errors.tenantId}
                      helperText={
                        errors.tenantId ||
                        (isLoadingOrgs
                          ? "Loading organizations..."
                          : `${organizations.length} organization(s) available`)
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingOrgs ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(rawProps, option) => {
                    // Fix: don't spread key from props
                    const { key, ...props } = rawProps as any;

                    if (option.id === "add-new") {
                      return (
                        <li
                          key={key}
                          {...props}
                          style={{
                            backgroundColor: "#f0f0f0",
                            fontWeight: "bold",
                            color: "#1976d2",
                          }}
                          onClick={(e) => {
                            props.onClick?.(e);
                            handleAddNewOrganization(
                              option.organizerName || ""
                            );
                          }}
                        >
                          + {option.name}
                        </li>
                      );
                    }

                    return (
                      <li key={key} {...props}>
                        {option.name ||
                          option.organizerName ||
                          `Organization ${option.id}`}
                      </li>
                    );
                  }}
                  noOptionsText="Type to search or add new organizer"
                />

                {/* Event Type */}
                <FormControl fullWidth error={!!errors.eventType} required>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleSelectChange}
                    label="Event Type"
                  >
                    {eventTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.eventType && (
                    <FormHelperText>{errors.eventType}</FormHelperText>
                  )}
                </FormControl>
              </Stack>

              {/* Right Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe your event"
                  multiline
                  rows={1}
                />

                <TextField
                  fullWidth
                  label="SMS Text"
                  name="smsText"
                  value={formData.smsText}
                  onChange={handleInputChange}
                  error={!!errors.smsText}
                  helperText={errors.smsText}
                  placeholder="Enter SMS text"
                  required
                  multiline
                  disabled={userRole !== "superadmin"}
                  rows={1}
                />

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {bannerFile ? bannerFile.name : "Upload Event Banner Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(file);
                    }}
                  />
                </Button>
                {errors.bannerImage && (
                  <FormHelperText error>{errors.bannerImage}</FormHelperText>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Event Schedule */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Event Schedule
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Event Date & Time"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={!!errors.startDate}
                  helperText={
                    errors.startDate || "Event date is required"
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().slice(0, 16),
                  }}
                />
              </Stack>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <FormControl fullWidth error={!!errors.timeZone} required>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleSelectChange}
                    label="Time Zone"
                  >
                    {timeZoneOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.timeZone && (
                    <FormHelperText>{errors.timeZone}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          {/* Location Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Location Details
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Venue/Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="Enter venue or starting location"
                  required
                />

                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  error={!!errors.city}
                  helperText={errors.city}
                  placeholder="Enter city"
                  required
                />

                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  error={!!errors.country}
                  helperText={errors.country}
                  placeholder="Enter country"
                  required
                />
              </Stack>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  placeholder="Enter state or province"
                />

                <TextField
                  fullWidth
                  label="Zip/Postal Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                  placeholder="Enter zip or postal code"
                />
              </Stack>
            </Stack>
          </Box>

          {/* Event Settings & Leaderboard Settings */}
          <Box sx={{ mb: 4 }}>
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
              {/* Event Settings */}
              <Box sx={{ flex: 1, pr: { xs: 0, md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Event Settings
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.removeBanner}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              removeBanner: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Remove Banner"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.published}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              published: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Publish Event"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.rankOnNet}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              rankOnNet: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Rank On Net"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.allowParticipantEdit}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              allowParticipantEdit: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Allow Participant Edit"
                    />
                  </Stack>

                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.useOldData}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              useOldData: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Use Old Data"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.confirmedEvent}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              confirmedEvent: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Confirmed Event"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.allowNameCheck}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              allowNameCheck: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Allow Name Check"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.showResultSummaryForRaces}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              showResultSummaryForRaces: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Show Result Summary"
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Leaderboard Settings */}
              <LeaderboardSettingsComponent
                settings={leaderBoardSettings}
                onSettingsChange={setLeaderBoardSettings}
                showOverrideToggle={false}
                title="Leaderboard Settings"
              />
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
              onClick={handleCancel}
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
              disabled={isSubmitting || isLoadingOrgs}
              size="large"
              fullWidth={false}
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Add New Organization Dialog */}
      <Dialog
        open={openAddOrgDialog}
        onClose={() => !isCreatingOrg && setOpenAddOrgDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            error={!!orgError}
            helperText={orgError}
            disabled={isCreatingOrg}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenAddOrgDialog(false)}
            disabled={isCreatingOrg}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrganization}
            variant="contained"
            disabled={isCreatingOrg || !newOrgName.trim()}
            startIcon={
              isCreatingOrg ? <CircularProgress size={20} /> : undefined
            }
          >
            {isCreatingOrg ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};
