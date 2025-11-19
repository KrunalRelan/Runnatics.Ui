// src/main/src/pages/admin/events/EditEvent.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { EventService } from "../../../services/EventService";
import {
  EventOrganizer,
  EventType,
  timeZoneOptions,
  EventSettings,
  LeaderBoardSettings,
  Event,
} from "@/main/src/models";
import { CreateEventRequest } from "@/main/src/models";
import { EventOrganizerService } from "@/main/src/services/EventOrganizerService";
import { EventRequest } from "@/main/src/models/EventRequest";

interface FormErrors {
  [key: string]: string;
}

export const EditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [organizations, setOrganizations] = useState<EventOrganizer[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isEventInPast, setIsEventInPast] = useState(false);

  // Guard to prevent duplicate fetches (React 18 StrictMode)
  const hasFetchedRef = useRef(false);

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

  // Leaderboard settings state
  const [leaderBoardSettings, setLeaderBoardSettings] =
    useState<LeaderBoardSettings>({
      ShowOverallResults: true,
      ShowCategoryResults: true,
      SortByCategoryChipTime: true,
      SortByOverallChipTime: true,
      SortByOverallGunTime: false,
      SortByCategoryGunTime: false,
      NumberOfResultsToShowOverall: 10,
      NumberOfResultsToShowCategory: 5,
    });

  const [formData, setFormData] = useState<EventRequest>({
      eventOrganizerId: "",
    name: "",
    description: "",
    eventType: EventType.Marathon,
    eventDate: "",
    bannerImageUrl: "",
    venueName: "",
    venueAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    timeZone: "Asia/Kolkata",
    smsText: "",
    leaderBoardSettings: {
      ShowOverallResults: true,
      ShowCategoryResults: true,
      SortByOverallChipTime: true,
      SortByCategoryChipTime: true,
      SortByOverallGunTime: true,
      SortByCategoryGunTime: true,
      NumberOfResultsToShowOverall: 10,
      NumberOfResultsToShowCategory: 5,
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

  // -------- FETCH EVENT + ORGS (with StrictMode-safe guard) ----------
  useEffect(() => {
    if (!id) {
      setApiError("No event ID provided");
      setIsLoading(false);
      setIsLoadingOrgs(false);
      return;
    }

    // Prevent duplicate fetches in React 18 StrictMode
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingOrgs(true);

        const [eventResponse, orgsResponse] = await Promise.all([
          EventService.getEventById(id),
          EventOrganizerService.getOrganizations(),
        ]);

        const eventData: Event = eventResponse.message || eventResponse;

        const mappedOrgs = orgsResponse.map((org: EventOrganizer) => ({
          id: org.id,
          tenantId: org.tenantId,
          name: org.name || org.organizerName || "",
          organizerName: org.organizerName || org.name || "",
        }));

        setOrganizations(mappedOrgs);
        populateFormData(eventData, mappedOrgs);
      } catch (error: any) {
        let errorMessage = "Failed to fetch event data. Please try again.";
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
        setIsLoadingOrgs(false);
      }
    };

    fetchData();
  }, [id]);

  // Populate form data from event object
  const populateFormData = (event: Event, availableOrgs: EventOrganizer[]) => {
    // Check if event is in the past
    if (event.eventDate) {
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      setIsEventInPast(eventDate < now);
    }

    // Parse city, state, country from venueAddress
    let city = "";
    let state = "";
    let country = "";

    if (event.venueAddress) {
      const parts = event.venueAddress.split(",").map((p: string) => p.trim());
      if (parts.length >= 3) {
        country = parts[parts.length - 1] || ""; // Last part is country
        const stateWithZip = parts[parts.length - 2] || "";
        state = stateWithZip.replace(/\d+/g, "").trim(); // Remove numbers
        city = parts[parts.length - 3] || ""; // Third from last is city
      }
    }

    // Find matching organization
    let selectedOrgId = "";

    if (event.tenantId) {
      const matchingOrg = availableOrgs.find(
        (org) => org.id === event.organizerId
      );

      if (matchingOrg) {
        selectedOrgId = matchingOrg.id;
      } else {
        const placeholderOrg: EventOrganizer = {
          id: event.tenantId,
          tenantId: event.tenantId,
          name: event.eventOrganizerName || `Organization (${event.tenantId})`,
          organizerName: event.eventOrganizerName || "",
        };
        availableOrgs.push(placeholderOrg);
        setOrganizations([...availableOrgs]);
        selectedOrgId = placeholderOrg.id;
      }
    } else if (event.organizerId) {
      selectedOrgId = event.organizerId;
      const orgExists = availableOrgs.some(
        (org) => org.id === event.organizerId
      );
      if (!orgExists) {
        const placeholderOrg: EventOrganizer = {
          id: event.organizerId,
          tenantId: event.organizerId,
          name:
            event.eventOrganizerName || `Organization (${event.organizerId})`,
          organizerName: event.eventOrganizerName || "",
        };
        availableOrgs.push(placeholderOrg);
        setOrganizations([...availableOrgs]);
      }
    }

    const mappedFormData: EventRequest = {
      
      eventOrganizerId: selectedOrgId,
      name: event.name || "",
      description: event.description || "",
      eventType: (event.eventType as EventType) || EventType.Marathon,
      eventDate: event.eventDate || "",
      timeZone: event.timeZone || "Asia/Kolkata",
      venueName: event.venueName || "",
      venueAddress: event.venueAddress || "",
      city: city,
      state: state,
      country: country,
      zipCode: event.zipCode || "",
      bannerImageUrl: event.bannerImageUrl || "",
      
      leaderBoardSettings: {
        ShowOverallResults:
          event.leaderboardSettings?.ShowOverallResults ?? true,
        ShowCategoryResults:
          event.leaderboardSettings?.ShowCategoryResults ?? true,
        SortByOverallChipTime:
          event.leaderboardSettings?.SortByOverallChipTime ?? true,
        SortByCategoryChipTime:
          event.leaderboardSettings?.SortByCategoryChipTime ?? true,
        SortByOverallGunTime:
          event.leaderboardSettings?.SortByOverallGunTime ?? false,
        SortByCategoryGunTime:
          event.leaderboardSettings?.SortByCategoryGunTime ?? false,
        NumberOfResultsToShowOverall:
          event.leaderboardSettings?.NumberOfResultsToShowOverall ?? 10,
        NumberOfResultsToShowCategory:
          event.leaderboardSettings?.NumberOfResultsToShowCategory ?? 5,
      },
      eventSettings: {
        removeBanner: event.eventSettings?.removeBanner ?? false,
        published: event.eventSettings?.published ?? false,
        rankOnNet: event.eventSettings?.rankOnNet ?? false,
        allowParticipantEdit:
          event.eventSettings?.allowParticipantEdit ?? false,
        useOldData: event.eventSettings?.useOldData ?? false,
        confirmedEvent: event.eventSettings?.confirmedEvent ?? false,
        allowNameCheck: event.eventSettings?.allowNameCheck ?? false,
        showResultSummaryForRaces:
          event.eventSettings?.showResultSummaryForRaces ?? false,
      },
    };

    setFormData(mappedFormData);

    if (event.eventSettings) {
      const mappedEventSettings: EventSettings = {
        id: event.eventSettings.id,
        eventId: event.eventSettings.eventId,
        removeBanner: event.eventSettings.removeBanner ?? false,
        published: event.eventSettings.published ?? false,
        rankOnNet: event.eventSettings.rankOnNet ?? false,
        showResultSummaryForRaces:
          event.eventSettings.showResultSummaryForRaces ?? false,
        useOldData: event.eventSettings.useOldData ?? false,
        confirmedEvent: event.eventSettings.confirmedEvent ?? false,
        allowNameCheck: event.eventSettings.allowNameCheck ?? false,
        allowParticipantEdit: event.eventSettings.allowParticipantEdit ?? false,
        createdAt: event.eventSettings.createdAt,
      };
      setEventSettings(mappedEventSettings);
    }

    if (event.leaderboardSettings) {
      const mappedLeaderboardSettings: LeaderBoardSettings = {
        ShowOverallResults:
          event.leaderboardSettings.ShowOverallResults ?? true,
        ShowCategoryResults:
          event.leaderboardSettings.ShowCategoryResults ?? true,
        SortByOverallChipTime:
          event.leaderboardSettings.SortByOverallChipTime ?? false,
        SortByCategoryChipTime:
          event.leaderboardSettings.SortByCategoryChipTime ?? false,
        SortByOverallGunTime:
          event.leaderboardSettings.SortByOverallGunTime ?? false,
        SortByCategoryGunTime:
          event.leaderboardSettings.SortByCategoryGunTime ?? false,
        NumberOfResultsToShowOverall:
          event.leaderboardSettings.NumberOfResultsToShowOverall ?? 10,
        NumberOfResultsToShowCategory:
          event.leaderboardSettings.NumberOfResultsToShowCategory ?? 5,
      };
      setLeaderBoardSettings(mappedLeaderboardSettings);
    }
  };

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
      newErrors.eventOrganizerId = "Please select an event organizer";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }
      if (!formData.eventDate) {
        newErrors.eventDate = "Event date is required";
      }
      if (!(formData.venueName ?? "").trim()) {
        newErrors.venueName = "Venue name is required";
      }
      if (!(formData.venueAddress ?? "").trim()) {
        newErrors.venueAddress = "Venue address is required";
      }
      if (!(formData.city ?? "").trim()) {
        newErrors.city = "City is required";
      }
      if (!(formData.state ?? "").trim()) {
        newErrors.state = "State is required";
      }
      if (!(formData.country ?? "").trim()) {
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

    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { ...apiData } = formData;

      const selectedOrgId = apiData.eventOrganizerId;
      let eventOrganizerIdForApi: string;

      if (typeof selectedOrgId === "string") {
        eventOrganizerIdForApi = selectedOrgId;
      } else {
        throw new Error("Invalid organization selection");
      }

      const requestPayload: EventRequest = {
        eventOrganizerId: eventOrganizerIdForApi,
        name: apiData.name,
        description: apiData.description || "",
        eventDate: apiData.eventDate,
        timeZone: apiData.timeZone || "Asia/Kolkata",
        smsText: apiData.smsText || "",
        leaderBoardSettings: leaderBoardSettings,
        eventSettings: eventSettings,
        eventType: apiData.eventType
      };
      
      const updatedEvent = await EventService.updateEvent(id!, requestPayload);

      if (bannerFile && updatedEvent.id) {
        await EventService.uploadBannerImage(updatedEvent.id, bannerFile);
      }

      navigate("/events/events-dashboard");
    } catch (error: any) {
      let errorMessage = "Failed to update event. Please try again.";

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
          errorMessage = "You do not have permission to update events.";
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

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Event type options for dropdown
  const eventTypeOptions = [
    { value: EventType.Marathon, label: "Marathon" },
    { value: EventType.HalfMarathon, label: "Half Marathon" },
    { value: EventType.TenK, label: "10K" },
    { value: EventType.FiveK, label: "5K" },
    { value: EventType.Trail, label: "Trail Run" },
    { value: EventType.Triathlon, label: "Triathlon" },
    { value: EventType.Cycling, label: "Cycling" },
    { value: EventType.Walking, label: "Walking" },
    { value: EventType.Other, label: "Other" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Event
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* Left Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Event Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., City Marathon 2024"
                  required
                />

                <FormControl
                  fullWidth
                  error={!!errors.eventOrganizerId}
                  required
                  disabled={isLoadingOrgs}
                >
                  <InputLabel>Event Organizer</InputLabel>
                  <Select
                    name="eventOrganizerId" // <-- key name
                    value={formData.eventOrganizerId || ""} // <-- bind to eventOrganizerId
                    onChange={handleSelectChange}
                    label="Event Organizer"
                  >
                    <MenuItem value="">
                      <em>Select an event organizer</em>
                    </MenuItem>
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name ||
                          org.organizerName ||
                          `Organization ${org.id}`}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.eventOrganizerId && (
                    <FormHelperText>{errors.eventOrganizerId}</FormHelperText>
                  )}
                  {isLoadingOrgs && (
                    <FormHelperText>Loading organizations...</FormHelperText>
                  )}
                  {!formData.eventOrganizerId &&
                    !errors.eventOrganizerId &&
                    !isLoadingOrgs && (
                      <FormHelperText sx={{ color: "warning.main" }}>
                        Please select an event organizer for this event.
                      </FormHelperText>
                    )}
                </FormControl>

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
                  multiline
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

            {isEventInPast && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This event is in the past. The event date and time zone cannot
                be modified.
              </Alert>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Stack spacing={3} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Event Date & Time"
                  name="eventDate"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  error={!!errors.eventDate}
                  helperText={
                    isEventInPast
                      ? "Cannot modify date for past events"
                      : errors.eventDate
                  }
                  required
                  disabled={isEventInPast}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <FormControl
                  fullWidth
                  error={!!errors.timeZone}
                  required
                  disabled={isEventInPast}
                >
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
                  {isEventInPast && !errors.timeZone && (
                    <FormHelperText>
                      Cannot modify time zone for past events
                    </FormHelperText>
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
                  name="venueAddress"
                  value={formData.venueAddress}
                  onChange={handleInputChange}
                  error={!!errors.venueAddress}
                  helperText={errors.venueAddress}
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
              <Box sx={{ flex: 1, pl: { xs: 0, md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Leaderboard Settings
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {/* Overall Results */}
                  <Stack spacing={1.5} sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, pl: "16px", mb: 0.5 }}
                    >
                      Overall Results
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.ShowOverallResults}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setLeaderBoardSettings((prev) => {
                              if (
                                isChecked &&
                                !prev.SortByOverallChipTime &&
                                !prev.SortByOverallGunTime
                              ) {
                                return {
                                  ...prev,
                                  ShowOverallResults: true,
                                  SortByOverallChipTime: true,
                                  SortByOverallGunTime: false,
                                };
                              }
                              return { ...prev, ShowOverallResults: isChecked };
                            });
                          }}
                        />
                      }
                      label="Show Overall Results"
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        pl: "16px",
                        mb: 0.5,
                        opacity: leaderBoardSettings.ShowOverallResults
                          ? 1
                          : 0.5,
                      }}
                    >
                      Overall Result Sort By
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.SortByOverallChipTime}
                          disabled={!leaderBoardSettings.ShowOverallResults}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeaderBoardSettings((prev) => ({
                                ...prev,
                                SortByOverallChipTime: true,
                                SortByOverallGunTime: false,
                              }));
                            }
                          }}
                        />
                      }
                      label="Chip Time"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.SortByOverallGunTime}
                          disabled={!leaderBoardSettings.ShowOverallResults}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeaderBoardSettings((prev) => ({
                                ...prev,
                                SortByOverallGunTime: true,
                                SortByOverallChipTime: false,
                              }));
                            }
                          }}
                        />
                      }
                      label="Gun Time"
                    />
                  </Stack>

                  {/* Category Results */}
                  <Stack spacing={1.5} sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, pl: "16px", mb: 0.5 }}
                    >
                      Category Results
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.ShowCategoryResults}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setLeaderBoardSettings((prev) => {
                              if (
                                isChecked &&
                                !prev.SortByCategoryChipTime &&
                                !prev.SortByCategoryGunTime
                              ) {
                                return {
                                  ...prev,
                                  ShowCategoryResults: true,
                                  SortByCategoryChipTime: true,
                                  SortByCategoryGunTime: false,
                                };
                              }
                              return {
                                ...prev,
                                ShowCategoryResults: isChecked,
                              };
                            });
                          }}
                        />
                      }
                      label="Show Category Results"
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        pl: "16px",
                        mb: 0.5,
                        opacity: leaderBoardSettings.ShowCategoryResults
                          ? 1
                          : 0.5,
                      }}
                    >
                      Category Result Sort By
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.SortByCategoryChipTime}
                          disabled={!leaderBoardSettings.ShowCategoryResults}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeaderBoardSettings((prev) => ({
                                ...prev,
                                SortByCategoryChipTime: true,
                                SortByCategoryGunTime: false,
                              }));
                            }
                          }}
                        />
                      }
                      label="Chip Time"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={leaderBoardSettings.SortByCategoryGunTime}
                          disabled={!leaderBoardSettings.ShowCategoryResults}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeaderBoardSettings((prev) => ({
                                ...prev,
                                SortByCategoryGunTime: true,
                                SortByCategoryChipTime: false,
                              }));
                            }
                          }}
                        />
                      }
                      label="Gun Time"
                    />
                  </Stack>
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={3}
                  sx={{ mt: 3 }}
                >
                  {leaderBoardSettings.ShowOverallResults && (
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Overall Results to Show"
                        type="number"
                        value={
                          leaderBoardSettings.NumberOfResultsToShowOverall || 10
                        }
                        onChange={(e) =>
                          setLeaderBoardSettings((prev) => ({
                            ...prev,
                            NumberOfResultsToShowOverall:
                              parseInt(e.target.value) || 10,
                          }))
                        }
                        placeholder="Enter number of overall results"
                        size="small"
                        inputProps={{ min: 1, step: 1 }}
                        helperText="Number of overall results to display"
                      />
                    </Box>
                  )}

                  {leaderBoardSettings.ShowCategoryResults && (
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Category Results to Show"
                        type="number"
                        value={
                          leaderBoardSettings.NumberOfResultsToShowCategory || 5
                        }
                        onChange={(e) =>
                          setLeaderBoardSettings((prev) => ({
                            ...prev,
                            NumberOfResultsToShowCategory:
                              parseInt(e.target.value) || 5,
                          }))
                        }
                        placeholder="Enter number of category results"
                        size="small"
                        inputProps={{ min: 1, step: 1 }}
                        helperText="Number of category results to display"
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/events/events-dashboard")}
              disabled={isSubmitting}
              size="large"
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};
