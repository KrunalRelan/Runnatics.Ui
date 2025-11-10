// src/main/src/pages/CreateEvent.tsx

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
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material";
import { EventService } from "../../../services/EventService";
import {
  EventOrganizer,
  EventType,
  timeZoneOptions,
  EventSettings,
  LeaderBoardSettings,
} from "@/main/src/models";
import { CreateEventRequest } from "@/main/src/models";
import { EventOrganizerService } from "@/main/src/services/EventOrganizerService";

interface FormErrors {
  [key: string]: string;
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [organizations, setOrganizations] = useState<EventOrganizer[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  
  // Ref to prevent double API calls in React.StrictMode
  const hasFetchedOrgs = useRef(false);

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
    organizationId: "",
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
    capacity: undefined, // UI only, not sent to API
    price: undefined, // UI only, not sent to API
    currency: "INR", // UI only, not sent to API
    timeZone: "Asia/Kolkata", // Default to India timezone
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

  // derive user role from localStorage (fallback to empty string if not set)
  //TODO: I want to take this from context later. when i integrate auth.
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") || "" : "";

  // Fetch organizations on component mount
  useEffect(() => {
    // Skip if already fetched (prevents double call in React.StrictMode)
    if (hasFetchedOrgs.current) return;
    hasFetchedOrgs.current = true;

    let isMounted = true;

    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);
        const response = await EventOrganizerService.getOrganizations();
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Map API response to dropdown format
          const mappedOrgs = response.map(org => ({ 
            id: org.id,
            organizationId: org.organizationId,
            name: org.organizerName || org.name || '',
            organizerName: org.organizerName
          }));
          setOrganizations(mappedOrgs);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setErrors((prev) => ({
            ...prev,
            organizationId: "Failed to load organizations",
          }));
        }
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoadingOrgs(false);
        }
      }
    };

    fetchOrganizations();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
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

    // For number fields, allow empty values (undefined) or parse the number
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

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;

    // Special handling for organizationId
    // Keep "N/A" as-is for display, will convert to 1 when sending to API
    let processedValue = value === "" ? null : value;

    setFormData((prev) => ({
      ...prev,
      [name as string]: processedValue,
    }));

    // Clear error for this field
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

    // Organization validation - allow empty, N/A, or valid ID
    if (!formData.organizationId || formData.organizationId === "") {
      newErrors.organizationId = "Organization is required";
    }

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    // if (!formData.description.trim()) {
    //   newErrors.description = "Description is required";
    // }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      // Check if the date is in the past
      const selectedDate = new Date(formData.startDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.startDate = "Event date cannot be in the past";
      }
    }

    // if (!formData.endDate) {
    //   newErrors.endDate = "End date is required";
    // }

    // if (!formData.registrationOpenDate) {
    //   newErrors.registrationOpenDate = "Registration open date is required";
    // }

    // if (!formData.registrationCloseDate) {
    //   newErrors.registrationCloseDate = "Registration close date is required";
    // }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    // Capacity, price, and currency are UI-only fields (optional)
    // No validation needed as they're not sent to the API

    if (!formData.timeZone) {
      newErrors.timeZone = "Time zone is required";
    }

    // Date and time validations
    // // if (formData.startDate && formData.endDate) {
    // //   const start = new Date(formData.startDate);
    // //   const end = new Date(formData.endDate);

    // //   // Compare timestamps to include both date and time
    // //   if (end.getTime() <= start.getTime()) {
    // //     newErrors.endDate = "End date and time must be after start date and time";
    // //   }
    // }

    // if (formData.registrationOpenDate && formData.registrationCloseDate) {
    //   const regOpen = new Date(formData.registrationOpenDate);
    //   const regClose = new Date(formData.registrationCloseDate);

    //   // Compare timestamps to include both date and time
    //   if (regClose.getTime() <= regOpen.getTime()) {
    //     newErrors.registrationCloseDate =
    //       "Registration close date and time must be after open date and time";
    //   }
    // }

    // if (formData.registrationCloseDate && formData.startDate) {
    //   const regClose = new Date(formData.registrationCloseDate);
    //   const eventStart = new Date(formData.startDate);

    //   // Compare timestamps to include both date and time
    //   if (regClose.getTime() > eventStart.getTime()) {
    //     newErrors.registrationCloseDate =
    //       "Registration must close before event starts";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setApiError('');
    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Transform the form data to match the API structure
      // Exclude capacity, price, and currency (UI only fields)
      const { capacity, price, currency, ...apiData } = formData;
      
      // Get the event organizer ID from the dropdown selection
      // The organizationId field actually stores the event organizer's ID (not organization ID)
      let eventOrganizerIdForApi: number;
      if (apiData.organizationId === "N/A") {
        eventOrganizerIdForApi = 1;
      } else if (typeof apiData.organizationId === 'string') {
        eventOrganizerIdForApi = parseInt(apiData.organizationId, 10);
      } else if (typeof apiData.organizationId === 'number') {
        eventOrganizerIdForApi = apiData.organizationId;
      } else {
        // Default fallback if organizationId is null/undefined
        eventOrganizerIdForApi = 1;
      }
      
      console.log('Event Organizer ID being sent to API:', eventOrganizerIdForApi);
      
      // Create the API request payload to match C# EventRequest model
      const requestPayload = {
        // Map to C# property names (PascalCase)
        eventOrganizerId: eventOrganizerIdForApi, // Required in C#
        name: apiData.name, // Required
        slug: apiData.name.toLowerCase().replace(/\s+/g, '-'), // Required
        description: apiData.description || null,
        eventDate: apiData.startDate, // Required - DateTime
        timeZone: apiData.timeZone || "Asia/Kolkata",
        venueName: apiData.location || null,
        venueAddress: `${apiData.city}, ${apiData.state}, ${apiData.country}` || null,
        venueLatitude: null, // Optional
        venueLongitude: null, // Optional
        status: "Draft", // Default value
        maxParticipants: 1000, // Optional - default value
        registrationDeadline: apiData.registrationCloseDate || apiData.startDate || null,
        
        // Event Settings - nested object (matches EventSettingsRequest C# model)
        eventSettings: eventSettings ? {
          removeBanner: eventSettings.removeBanner || false,
          published: eventSettings.published || false,
          rankOnNet: eventSettings.rankOnNet !== undefined ? eventSettings.rankOnNet : true,
          showResultSummaryForRaces: eventSettings.showResultSummaryForRaces !== undefined ? eventSettings.showResultSummaryForRaces : true,
          useOldData: eventSettings.useOldData || false,
          confirmedEvent: eventSettings.confirmedEvent || false,
          allowNameCheck: eventSettings.allowNameCheck !== undefined ? eventSettings.allowNameCheck : true,
          allowParticipantEdit: eventSettings.allowParticipantEdit !== undefined ? eventSettings.allowParticipantEdit : true,
        } : {
          removeBanner: false,
          published: false,
          rankOnNet: true,
          showResultSummaryForRaces: true,
          useOldData: false,
          confirmedEvent: false,
          allowNameCheck: true,
          allowParticipantEdit: true,
        },
        
        // Leaderboard Settings - nested object (matches LeaderboardSettingsRequest C# model)
        leaderboardSettings: leaderBoardSettings ? {
          showOverallResults: leaderBoardSettings.ShowOverallResults || false,
          showCategoryResults: leaderBoardSettings.ShowCategoryResults || false,
          showGenderResults: true, // Default to true
          showAgeGroupResults: true, // Default to true
          sortByOverallChipTime: leaderBoardSettings.SortByOverallChipTime || false,
          sortByOverallGunTime: leaderBoardSettings.SortByOverallGunTime || false,
          sortByCategoryChipTime: leaderBoardSettings.SortByCategoryChipTime || false,
          sortByCategoryGunTime: leaderBoardSettings.SortByCategoryGunTime || false,
          numberOfResultsToShowOverall: leaderBoardSettings.NumberOfResultsToShowOverall || 10,
          numberOfResultsToShowCategory: leaderBoardSettings.NumberOfResultsToShowCategory || 5,
          enableLiveLeaderboard: true, // Default to true
          showSplitTimes: true, // Default to true
          showPace: true, // Default to true
          showTeamResults: false, // Default to false (as per C# model)
          showMedalIcon: true, // Default to true
          allowAnonymousView: true, // Default to true
          autoRefreshIntervalSec: 30, // Default 30 seconds
          maxDisplayedRecords: Math.max(
            leaderBoardSettings.NumberOfResultsToShowOverall || 10,
            leaderBoardSettings.NumberOfResultsToShowCategory || 5
          ),
        } : {
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
      
      console.log('Full API Request Payload:', requestPayload);
      
      // Create event
      const createdEvent = await EventService.createEvent(requestPayload as any);

      // Upload banner image if provided
      if (bannerFile && createdEvent.id) {
        await EventService.uploadBannerImage(createdEvent.id, bannerFile);
      }

      // Navigate to events list or event detail page
      navigate("/events/events-dashboard");
    } catch (error: any) {
      // Extract error message
      let errorMessage = 'Failed to create event. Please try again.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data?.errors) {
          // Validation errors
          setErrors(error.response.data.errors);
          errorMessage = 'Please fix the validation errors below.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please check if you are logged in and your token is valid.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create events.';
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        // Error in request setup
        errorMessage = error.message || errorMessage;
      }
      
      setApiError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      )
    ) {
      navigate("/events");
    }
  };

  // Event type options
  const eventTypeOptions = (
    Object.values(EventType) as Array<string | number>
  ).map((type) => ({
    value: type as string | number,
    label: String(type),
  }));


  // Generate timezone options with UTC offset
  // Common timezone options with UTC offsets

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
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
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError('')}>
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

            {/* Two Column Layout */}
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

                {/* Organization Dropdown */}
                <FormControl
                  fullWidth
                  error={!!errors.organizationId}
                  required
                  disabled={isLoadingOrgs}
                >
                  <InputLabel>Event Organizers</InputLabel>
                  <Select
                    name="organizationId"
                    value={formData.organizationId || ""}
                    onChange={handleSelectChange}
                    label="Event Organizers"
                  >
                    <MenuItem value="">
                      <em>Select an organization</em>
                    </MenuItem>
                    <MenuItem value="N/A">N/A</MenuItem>
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name || org.organizerName || `Organization ${org.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.organizationId && (
                    <FormHelperText>{errors.organizationId}</FormHelperText>
                  )}
                  {isLoadingOrgs && (
                    <FormHelperText>Loading organizations...</FormHelperText>
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
                {/* Description */}
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe your event"
                  // required
                  multiline
                  rows={1}
                />
                {/* SMS Text*/}
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
                {/* Banner Upload */}
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

            {/* Two Column Layout */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* Left Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* Start Date & Time */}
                <TextField
                  fullWidth
                  label="Event Date & Time"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={!!errors.startDate}
                  helperText={errors.startDate || "Event date cannot be in the past"}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().slice(0, 16), // Prevent past dates
                  }}
                />

                {/* Registration Opens
                <TextField
                  fullWidth
                  label="Registration Opens"
                  name="registrationOpenDate"
                  type="datetime-local"
                  value={formData.registrationOpenDate}
                  onChange={handleInputChange}
                  error={!!errors.registrationOpenDate}
                  helperText={errors.registrationOpenDate}
                  required
                  InputLabelProps={{ shrink: true }}
                /> */}

                {/* Time Zone */}
                {/* <FormControl fullWidth error={!!errors.timeZone} required>
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
                </FormControl> */}
              </Stack>

              {/* Right Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* End Date & Time */}
                {/* <TextField
                  fullWidth
                  label="End Date & Time"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  required
                  InputLabelProps={{ shrink: true }}
                /> */}
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

                {/* Registration Closes
                <TextField
                  fullWidth
                  label="Registration Closes"
                  name="registrationCloseDate"
                  type="datetime-local"
                  value={formData.registrationCloseDate}
                  onChange={handleInputChange}
                  error={!!errors.registrationCloseDate}
                  helperText={errors.registrationCloseDate}
                  required
                  InputLabelProps={{ shrink: true }}
                /> */}
              </Stack>
            </Stack>
          </Box>

          {/* Location Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Location Details
            </Typography>

            {/* Two Column Layout */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              {/* Left Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* Venue/Location */}
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

                {/* City */}
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

                {/* Country */}
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

              {/* Right Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* State/Province */}
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

                {/* Zip/Postal Code */}
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
              {/* Left Side - Event Settings */}
              <Box sx={{ flex: 1, pr: { xs: 0, md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Event Settings
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  {/* Left Sub-column */}
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
                      label="All Participants Edit"
                    />
                  </Stack>

                  {/* Right Sub-column */}
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
                      label="All Name Check"
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
                      label="Show Results Summary For Races"
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Right Side - Leaderboard Settings */}
              <Box sx={{ flex: 1, pl: { xs: 0, md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Leaderboard Settings
                </Typography>
                {/* Two Sub-columns for Leaderboard Settings */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {/* Left Sub-column */}
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

                  {/* Right Sub-column */}
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
                        value={leaderBoardSettings.NumberOfResultsToShowOverall || 10}
                        onChange={(e) =>
                          setLeaderBoardSettings((prev) => ({
                            ...prev,
                            NumberOfResultsToShowOverall: parseInt(e.target.value) || 10,
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
                        value={leaderBoardSettings.NumberOfResultsToShowCategory || 5}
                        onChange={(e) =>
                          setLeaderBoardSettings((prev) => ({
                            ...prev,
                            NumberOfResultsToShowCategory: parseInt(e.target.value) || 5,
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
    </Box>
  );
};
