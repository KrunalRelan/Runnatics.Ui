// src/main/src/pages/admin/events/EditEvent.tsx

import React, { useState, useEffect } from "react";
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
  EventStatus,
  Event,
} from "@/main/src/models";
import { CreateEventRequest } from "@/main/src/models";
import { EventOrganizerService } from "@/main/src/services/EventOrganizerService";

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

  const [formData, setFormData] = useState<CreateEventRequest>({
    tenantId: "", // Stores the selected organization's ID (for dropdown)
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

  // Fetch event data and organizations on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingOrgs(true);

        // Fetch both event data and organizations in parallel
        const [eventResponse, orgsResponse] = await Promise.all([
          EventService.getEventById(id!),
          EventOrganizerService.getOrganizations(),
        ]);

        if (isMounted) {
          // Extract event data from ResponseBase wrapper
          const eventData = eventResponse.message || eventResponse;

          console.log("📦 Raw event response:", eventResponse);
          console.log("📦 Raw event data:", eventData);
          console.log("📦 Raw organizations response:", orgsResponse);

          // Map organizations
          const mappedOrgs = orgsResponse.map((org) => ({
            id: org.id,
            tenantId: org.tenantId,
            name: org.name || org.organizerName || "",
            organizerName: org.organizerName || org.name || "",
          }));

          console.log("🗂️ Mapped organizations:", mappedOrgs);

          setOrganizations(mappedOrgs);

          // Populate form with event data
          populateFormData(eventData, mappedOrgs);
        }
      } catch (error: any) {
        console.error("Error fetching event data:", error);

        if (isMounted) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to load event data. Please try again.";
          setApiError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingOrgs(false);
        }
      }
    };

    if (id) {
      fetchData();
    } else {
      setApiError("No event ID provided");
      setIsLoading(false);
      setIsLoadingOrgs(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Populate form data from event object
  const populateFormData = (event: Event, availableOrgs: EventOrganizer[]) => {
    console.log("📋 Populating form with event data:", event);

    // Check if event is in the past
    if (event.eventDate) {
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      setIsEventInPast(eventDate < now);
    }

    // Parse city, state, country from venueAddress
    // Format: "City, State, Country" or "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India"
    let city = "";
    let state = "";
    let country = "";

    if (event.venueAddress) {
      const parts = event.venueAddress.split(",").map((p: string) => p.trim());
      if (parts.length >= 3) {
        country = parts[parts.length - 1] || ""; // Last part is country
        // Second to last might have zip code, extract state from it
        const stateWithZip = parts[parts.length - 2] || "";
        state = stateWithZip.replace(/\d+/g, "").trim(); // Remove numbers to get state
        city = parts[parts.length - 3] || ""; // Third from last is city
      }
    }

    // Find the organization that matches this event's tenantId
    // The event has a tenantId which identifies which tenant/organization it belongs to
    let selectedOrgId = "";

    if (event.tenantId) {
      console.log("🔍 Event tenantId:", event.tenantId);

      // Find organization where tenantId matches
      const matchingOrg = availableOrgs.find(
        (org) => org.tenantId === event.tenantId
      );

      if (matchingOrg) {
        selectedOrgId = matchingOrg.id;
        console.log("✅ Found matching organization:", matchingOrg);
      } else {
        console.warn("⚠️ No organization found with tenantId:", event.tenantId);
        // Add a placeholder organization if not found
        const placeholderOrg: EventOrganizer = {
          id: event.tenantId,
          tenantId: event.tenantId,
          name: event.eventOrganizerName || `Organization (${event.tenantId})`,
          organizerName: event.eventOrganizerName || "",
        };
        availableOrgs.push(placeholderOrg);
        setOrganizations([...availableOrgs]);
        selectedOrgId = placeholderOrg.id;
        console.log("➕ Added placeholder organization:", placeholderOrg);
      }
    } else if (event.organizerId) {
      // Fallback to organizerId if tenantId is not available
      console.log("🔍 Using organizerId as fallback:", event.organizerId);
      selectedOrgId = event.organizerId;

      // Check if this org exists
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
        console.log(
          "➕ Added placeholder organization for organizerId:",
          placeholderOrg
        );
      }
    }

    // Map event data to form fields
    const mappedFormData = {
      tenantId: selectedOrgId, // Store selected organization's ID
      name: event.name || "",
      description: event.description || "",
      eventType: (event.eventType as EventType) || EventType.Marathon,
      startDate: event.eventDate
        ? new Date(event.eventDate).toISOString().slice(0, 16)
        : "",
      endDate: event.endDate
        ? new Date(event.endDate).toISOString().slice(0, 16)
        : "",
      registrationOpenDate: event.registrationOpenDate
        ? new Date(event.registrationOpenDate).toISOString().slice(0, 16)
        : "",
      registrationCloseDate: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
        : event.registrationCloseDate
        ? new Date(event.registrationCloseDate).toISOString().slice(0, 16)
        : "",
      location: event.venueName || event.location || "",
      city: city || event.city || "",
      state: state || event.state || "",
      country: country || event.country || "",
      zipCode: event.zipCode || "",
      capacity: event.maxParticipants || event.capacity || undefined,
      price: event.price || undefined,
      currency: event.currency || "INR",
      timeZone: event.timeZone || "Asia/Kolkata",
      smsText: "",
      leaderBoardSettings: {
        ShowOverallResults:
          event.leaderboardSettings?.ShowOverallResults ??
          event.leaderboardSettings?.ShowOverallResults ??
          true,
        ShowCategoryResults:
          event.leaderboardSettings?.ShowCategoryResults ??
          event.leaderboardSettings?.ShowCategoryResults ??
          true,
        SortByOverallChipTime:
          event.leaderboardSettings?.SortByOverallChipTime ??
          event.leaderboardSettings?.SortByOverallChipTime ??
          true,
        SortByCategoryChipTime:
          event.leaderboardSettings?.SortByCategoryChipTime ??
          event.leaderboardSettings?.SortByCategoryChipTime ??
          true,
        SortByOverallGunTime:
          event.leaderboardSettings?.SortByOverallGunTime ??
          event.leaderboardSettings?.SortByOverallGunTime ??
          false,
        SortByCategoryGunTime:
          event.leaderboardSettings?.SortByCategoryGunTime ??
          event.leaderboardSettings?.SortByCategoryGunTime ??
          false,
        NumberOfResultsToShowOverall:
          event.leaderboardSettings?.NumberOfResultsToShowOverall ??
          event.leaderboardSettings?.NumberOfResultsToShowOverall ??
          10,
        NumberOfResultsToShowCategory:
          event.leaderboardSettings?.NumberOfResultsToShowCategory ??
          event.leaderboardSettings?.NumberOfResultsToShowCategory ??
          5,
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
    console.log("✅ Form data set:", mappedFormData);
    console.log(
      "🆔 Selected organization ID in form:",
      mappedFormData.tenantId
    );

    // Set separate state for eventSettings and leaderBoardSettings
    if (event.eventSettings) {
      const mappedEventSettings = {
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
      const mappedLeaderboardSettings = {
        ShowOverallResults:
          event.leaderboardSettings.ShowOverallResults ??
          event.leaderboardSettings.ShowOverallResults ??
          true,
        ShowCategoryResults:
          event.leaderboardSettings.ShowCategoryResults ??
          event.leaderboardSettings.ShowCategoryResults ??
          true,
        SortByOverallChipTime:
          event.leaderboardSettings.SortByOverallChipTime ??
          event.leaderboardSettings.SortByOverallChipTime ??
          false,
        SortByCategoryChipTime:
          event.leaderboardSettings.SortByCategoryChipTime ??
          event.leaderboardSettings.SortByCategoryChipTime ??
          false,
        SortByOverallGunTime:
          event.leaderboardSettings.SortByOverallGunTime ??
          event.leaderboardSettings.SortByOverallGunTime ??
          false,
        SortByCategoryGunTime:
          event.leaderboardSettings.SortByCategoryGunTime ??
          event.leaderboardSettings.SortByCategoryGunTime ??
          false,
        NumberOfResultsToShowOverall:
          event.leaderboardSettings.NumberOfResultsToShowOverall ??
          event.leaderboardSettings.NumberOfResultsToShowOverall ??
          10,
        NumberOfResultsToShowCategory:
          event.leaderboardSettings.NumberOfResultsToShowCategory ??
          event.leaderboardSettings.NumberOfResultsToShowCategory ??
          5,
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

    let processedValue = value === "" ? null : value;

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

    // Organization/Tenant validation
    if (!formData.tenantId || formData.tenantId === "") {
      newErrors.tenantId = "Please select an event organizer";
    }

    // Required field validations
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

    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { capacity, price, currency, ...apiData } = formData;

      // Get the selected organization ID from the form
      // This is the organization's ID (not tenantId)
      const selectedOrgId = apiData.tenantId;

      // Convert to number for API
      let eventOrganizerIdForApi: number;
      if (typeof selectedOrgId === "string") {
        eventOrganizerIdForApi = parseInt(selectedOrgId, 10);
      } else if (typeof selectedOrgId === "number") {
        eventOrganizerIdForApi = selectedOrgId;
      } else {
        throw new Error("Invalid organization selection");
      }

      const requestPayload = {
        // Send the organization ID as eventOrganizerId (API expects this)
        eventOrganizerId: eventOrganizerIdForApi,
        name: apiData.name,
        slug: apiData.name.toLowerCase().replace(/\s+/g, "-"),
        description: apiData.description || null,
        eventDate: apiData.startDate,
        timeZone: apiData.timeZone || "Asia/Kolkata",
        venueName: apiData.location || null,
        venueAddress:
          `${apiData.city}, ${apiData.state}, ${apiData.country}` || null,
        venueLatitude: null,
        venueLongitude: null,
        status: EventStatus.Draft,
        maxParticipants: 1000,
        registrationDeadline:
          apiData.registrationCloseDate || apiData.startDate || null,

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
                leaderBoardSettings.ShowOverallResults || false,
              showCategoryResults:
                leaderBoardSettings.ShowCategoryResults || false,
              showGenderResults: true,
              showAgeGroupResults: true,
              sortByOverallChipTime:
                leaderBoardSettings.SortByOverallChipTime || false,
              sortByOverallGunTime:
                leaderBoardSettings.SortByOverallGunTime || false,
              sortByCategoryChipTime:
                leaderBoardSettings.SortByCategoryChipTime || false,
              sortByCategoryGunTime:
                leaderBoardSettings.SortByCategoryGunTime || false,
              numberOfResultsToShowOverall:
                leaderBoardSettings.NumberOfResultsToShowOverall || 10,
              numberOfResultsToShowCategory:
                leaderBoardSettings.NumberOfResultsToShowCategory || 5,
              enableLiveLeaderboard: true,
              showSplitTimes: true,
              showPace: true,
              showTeamResults: false,
              showMedalIcon: true,
              allowAnonymousView: true,
              autoRefreshIntervalSec: 30,
              maxDisplayedRecords: Math.max(
                leaderBoardSettings.NumberOfResultsToShowOverall || 10,
                leaderBoardSettings.NumberOfResultsToShowCategory || 5
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

      console.log("📤 Submitting payload:", requestPayload);

      // Update event
      const updatedEvent = await EventService.updateEvent(
        id!,
        requestPayload as any
      );

      // Upload banner image if provided
      if (bannerFile && updatedEvent.id) {
        await EventService.uploadBannerImage(updatedEvent.id, bannerFile);
      }

      // Navigate back to events list
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

            {/* Two Column Layout */}
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
                  error={!!errors.tenantId}
                  required
                  disabled={isLoadingOrgs}
                >
                  <InputLabel>Event Organizer</InputLabel>
                  <Select
                    name="tenantId"
                    value={formData.tenantId || ""}
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
                  {errors.tenantId && (
                    <FormHelperText>{errors.tenantId}</FormHelperText>
                  )}
                  {isLoadingOrgs && (
                    <FormHelperText>Loading organizations...</FormHelperText>
                  )}
                  {!formData.tenantId && !errors.tenantId && !isLoadingOrgs && (
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
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={!!errors.startDate}
                  helperText={
                    isEventInPast
                      ? "Cannot modify date for past events"
                      : errors.startDate
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
              <Box sx={{ flex: 1, pl: { xs: 0, md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Leaderboard Settings
                </Typography>
                {/* Two Sub-columns for Leaderboard Settings */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {/* Left Sub-column - Overall Results */}
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
                              // When enabling, ensure at least one time type is selected
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

                  {/* Right Sub-column - Category Results */}
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
                              // When enabling, ensure at least one time type is selected
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

                {/* Number of Results fields - positioned below each column */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={3}
                  sx={{ mt: 3 }}
                >
                  {/* Overall Results Count */}
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

                  {/* Category Results Count */}
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
