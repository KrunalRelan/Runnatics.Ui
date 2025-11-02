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
} from "@mui/material";
import { EventService } from "../../../services/EventService";
import { EventType } from "@/main/src/models";
import { CreateEventRequest } from "@/main/src/models";
import { EventOrganizerService } from "@/main/src/services/EventOrganizerService";

interface FormErrors {
  [key: string]: string;
}

interface Organization {
  id: string;
  name: string;
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

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
    currency: "USD",
  });

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.registrationOpenDate) {
      newErrors.registrationOpenDate = "Registration open date is required";
    }

    if (!formData.registrationCloseDate) {
      newErrors.registrationCloseDate = "Registration close date is required";
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

    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    // Date and time validations
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      // Compare timestamps to include both date and time
      if (end.getTime() <= start.getTime()) {
        newErrors.endDate = "End date and time must be after start date and time";
      }
    }

    if (formData.registrationOpenDate && formData.registrationCloseDate) {
      const regOpen = new Date(formData.registrationOpenDate);
      const regClose = new Date(formData.registrationCloseDate);

      // Compare timestamps to include both date and time
      if (regClose.getTime() <= regOpen.getTime()) {
        newErrors.registrationCloseDate =
          "Registration close date and time must be after open date and time";
      }
    }

    if (formData.registrationCloseDate && formData.startDate) {
      const regClose = new Date(formData.registrationCloseDate);
      const eventStart = new Date(formData.startDate);

      // Compare timestamps to include both date and time
      if (regClose.getTime() > eventStart.getTime()) {
        newErrors.registrationCloseDate =
          "Registration must close before event starts";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create event
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
    { value: "AUD", label: "AUD - Australian Dollar" }
  ];

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
          {/* Basic Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack spacing={3}>
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
                <InputLabel>Organization</InputLabel>
                <Select
                  name="organizationId"
                  value={formData.organizationId || ""}
                  onChange={handleSelectChange}
                  label="Organization"
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
                required
                multiline
                rows={6}
              />

              {/* Event Type and Banner - Side by Side */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                </Box>

                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Event Schedule */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Event Schedule
            </Typography>

            <Stack spacing={3}>
              {/* Start and End Date - Side by Side */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Start Date & Time"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
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
                  />
                </Box>
              </Box>

              {/* Registration Dates - Side by Side */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
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
                  />
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Location Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Location Details
            </Typography>

            <Stack spacing={3}>
              {/* Venue */}
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

              {/* City and State - Side by Side */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                </Box>

                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Box>

              {/* Country and Zip - Side by Side */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                </Box>

                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Registration & Pricing */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Registration & Pricing
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box sx={{ flex: 1 }}>
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
              </Box>

              <Box sx={{ flex: 1 }}>
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
              </Box>

              <Box sx={{ flex: 1 }}>
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
              </Box>
            </Box>
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
