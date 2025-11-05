// src/main/src/pages/CreateEvent.tsx

import React, { useState, useEffect } from "react";
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
  const [organizations, setOrganizations] = useState<EventOrganizer[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Event Settings state
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    RemoveBanner: false,
    PublishEvent: true,
    RankOnNet: false,
    AllowParticipantsEdit: false,
    UseOldData: false,
    ConfirmedEvent: false,
    AllNameCheck: false,
    ShowResultsSummaryForRaces: false,
  });

  // Leaderboard settings state
  // Logic:
  // - ShowOverallResults and ShowCategoryResults can be toggled independently
  // - When enabled, at least one time type (Chip or Gun) must be selected
  // - Chip Time and Gun Time are mutually exclusive (only one can be active at a time)
  // - Time type switches are disabled when parent result toggle is off
  // - NumberOfResultsToShow applies to both Overall and Category results
  const [leaderBoardSettings, setLeaderBoardSettings] =
    useState<LeaderBoardSettings>({
      ShowOverallResults: true,
      ShowCategoryResults: true,
      SortByCategoryChipTime: true,
      SortByOverallChipTime: true,
      SortByOverallGunTime: false,
      SortByCategoryGunTime: false,
      NumberOfResultsToShow: 5,
    });

  const [formData, setFormData] = useState<CreateEventRequest>({
    organizationId: null,
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
    capacity: 0,
    price: 0,
    // currency: "INR",
    timeZone: "Asia/Kolkata", // Default to India timezone
    smsText: "",
    leaderBoardSettings: {
      ShowOverallResults: true,
      ShowCategoryResults: true,
      SortByOverallChipTime: true,
      SortByCategoryChipTime: true,
      SortByOverallGunTime: true,
      SortByCategoryGunTime: true,
      NumberOfResultsToShow: 5,
    },
    eventSettings: {
      RemoveBanner: false,
      PublishEvent: true,
      RankOnNet: false,
      AllowParticipantsEdit: false,
      UseOldData: false,
      ConfirmedEvent: true,
      AllNameCheck: true,
      ShowResultsSummaryForRaces: false,
    },
  });

  // derive user role from localStorage (fallback to empty string if not set)
  //TODO: I want to take this from context later. when i integrate auth.
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") || "" : "";

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Sync event settings and leaderboard settings with formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      eventSettings,
      leaderBoardSettings,
    }));
  }, [eventSettings, leaderBoardSettings]);

  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrgs(true);
      const response = await EventOrganizerService.getOrganizations();
      setOrganizations(response);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setErrors((prev) => ({
        ...prev,
        organizationId: "Failed to load organizations",
      }));
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  // Handle input changes for TextField
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
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

    setFormData((prev) => ({
      ...prev,
      [name as string]: value === "" ? null : value,
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

    // Organization validation - N/A is acceptable
    if (formData.organizationId == null) {
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

    // if (formData.capacity <= 0) {
    //   newErrors.capacity = "Capacity must be greater than 0";
    // }

    // if (formData.price < 0) {
    //   newErrors.price = "Price cannot be negative";
    // }

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

    const isValid = validateForm();

    if (!isValid) {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Create event
      console.log("Calling EventService.createEvent with data:", formData);
      const createdEvent = await EventService.createEvent(formData);

      // Upload banner image if provided
      if (bannerFile && createdEvent.id) {
        await EventService.uploadBannerImage(createdEvent.id, bannerFile);
      }

      // Show success message
      alert("Event created successfully!");

      // Navigate to events list or event detail page
      navigate("/events");
    } catch (error: any) {
      console.error("Error creating event:", error);

      // Handle API errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to create event. Please try again."
        );
      }
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

  // Currency options
  const currencyOptions = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ];

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
          {/* Error Summary */}
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
                        {org.name}
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
                  helperText={errors.startDate}
                  required
                  InputLabelProps={{ shrink: true }}
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
                          checked={eventSettings.RemoveBanner}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              RemoveBanner: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Remove Banner"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.PublishEvent}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              PublishEvent: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Publish Event"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.RankOnNet}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              RankOnNet: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Rank On Net"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.AllowParticipantsEdit}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              AllowParticipantsEdit: e.target.checked,
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
                          checked={eventSettings.UseOldData}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              UseOldData: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Use Old Data"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.ConfirmedEvent}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              ConfirmedEvent: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Confirmed Event"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.AllNameCheck}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              AllNameCheck: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="All Name Check"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventSettings.ShowResultsSummaryForRaces}
                          onChange={(e) =>
                            setEventSettings((prev) => ({
                              ...prev,
                              ShowResultsSummaryForRaces: e.target.checked,
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

                {/* Shared setting for number of results - centered below both columns */}
                {(leaderBoardSettings.ShowOverallResults ||
                  leaderBoardSettings.ShowCategoryResults) && (
                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      label="Number of Results to Show"
                      type="number"
                      value={leaderBoardSettings.NumberOfResultsToShow || 5}
                      onChange={(e) =>
                        setLeaderBoardSettings((prev) => ({
                          ...prev,
                          NumberOfResultsToShow: parseInt(e.target.value) || 5,
                        }))
                      }
                      placeholder="Enter number of results"
                      size="small"
                      inputProps={{ min: 1, step: 1 }}
                      helperText="Applies to both Overall and Category results"
                      sx={{ width: { xs: "100%", sm: "300px" } }}
                    />
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Registration & Pricing */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Registration & Pricing
            </Typography>

            {/* Two Column Layout */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* Left Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* Capacity */}
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  error={!!errors.capacity}
                  helperText={errors.capacity}
                  placeholder="Maximum participants"
                  required
                  inputProps={{ min: 1, step: 1 }}
                />

                {/* Currency */}
                <FormControl fullWidth error={!!errors.currency} required>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleSelectChange}
                    label="Currency"
                  >
                    {currencyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.currency && (
                    <FormHelperText>{errors.currency}</FormHelperText>
                  )}
                </FormControl>
              </Stack>

              {/* Right Column */}
              <Stack spacing={3} sx={{ flex: 1 }}>
                {/* Registration Price */}
                <TextField
                  fullWidth
                  label="Registration Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  placeholder="0.00"
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Stack>
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
