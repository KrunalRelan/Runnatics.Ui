import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Participant } from "@/main/src/models/races/Participant";
import { ParticipantService } from "@/main/src/services/ParticipantService";

interface EditParticipantProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (participant: Participant) => void;
  participant: Participant | null;
}

const EditParticipant: React.FC<EditParticipantProps> = ({
  open,
  onClose,
  onUpdate,
  participant,
}) => {
  const [formData, setFormData] = useState<Participant>({
    bib: "",
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    category: "",
    status: "Registered",
    checkIn: false,
    chipId: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Populate form when participant prop changes
  useEffect(() => {
    if (participant && open) {
      setFormData({
        id: participant.id,
        bib: participant.bib || "",
        firstName: participant.firstName || "",
        lastName: participant.lastName || "",
        fullName: participant.fullName || "",
        email: participant.email || "",
        phone: participant.phone || "",
        gender: participant.gender || "",
        category: participant.category || "",
        status: participant.status || "Registered",
        checkIn: participant.checkIn || false,
        chipId: participant.chipId || "",
      });
    }
  }, [participant, open]);

  const handleFormChange = (
    field: keyof Participant,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      bib: "",
      firstName: "",
      lastName: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      category: "",
      status: "Registered",
      checkIn: false,
      chipId: "",
    });
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    setLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.bib || formData.bib.trim() === "") {
      setError("Please enter a Bib Number");
      return;
    }

    if (!formData.id) {
      setError("Participant ID is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to edit participant - only send non-empty values
      await ParticipantService.editParticipant(formData.id, {
        bibNumber: formData.bib,
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        gender: formData.gender?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        chipId: formData.chipId?.trim() || undefined,
        checkIn: formData.checkIn || false,
      });

      // Auto-generate fullName from firstName and lastName for local state
      const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();

      // Create participant object for parent component callback
      const updatedParticipant: Participant = {
        ...formData,
        fullName: fullName || undefined,
        name: fullName || undefined,
      };

      // Show success message
      setSnackbar({
        open: true,
        message: "Participant updated successfully!",
        severity: "success",
      });

      // Call parent callback to refresh the list
      onUpdate(updatedParticipant);

      // Close dialog after a short delay to allow user to see the success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error editing participant:", err);

      // Extract error message from various possible response formats
      let errorMessage = "Failed to update participant. Please try again.";

      if (err.response?.data) {
        const data = err.response.data;

        // Check for validation errors from ASP.NET
        if (data.errors && typeof data.errors === 'object') {
          // Format validation errors
          const validationErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msgs}`;
            })
            .join('; ');
          errorMessage = validationErrors;
        }
        // Check for title/detail error format
        else if (data.title || data.detail) {
          errorMessage = data.detail || data.title;
        }
        // Check for simple message string
        else if (typeof data === 'string') {
          errorMessage = data;
        }
        // Check for message property
        else if (data.message) {
          errorMessage = data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleClose();
        }}
        maxWidth="sm"
        fullWidth
      >
      <DialogTitle>Edit Participant</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: error ? 1 : 2 }}>
          {/* Bib Number - REQUIRED */}
          <TextField
            label="Bib Number"
            value={formData.bib}
            onChange={(e) => handleFormChange("bib", e.target.value)}
            fullWidth
            required
            size="small"
            helperText="Required field"
          />

          {/* Name Fields - Optional */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>

          {/* Contact Information - Optional */}
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange("email", e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFormChange("phone", e.target.value)}
            fullWidth
            size="small"
          />

          {/* Gender and Category - Optional */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e: SelectChangeEvent) =>
                  handleFormChange("gender", e.target.value)
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => handleFormChange("category", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., Open, Veteran, Junior"
            />
          </Stack>

          {/* Chip ID and Status - Optional */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Chip ID"
              value={formData.chipId}
              onChange={(e) => handleFormChange("chipId", e.target.value)}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e: SelectChangeEvent) =>
                  handleFormChange("status", e.target.value as any)
                }
              >
                <MenuItem value="Registered">Registered</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Check In - Optional */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.checkIn}
                onChange={(e) =>
                  handleFormChange("checkIn", e.target.checked)
                }
              />
            }
            label="Check In"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.bib}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Updating..." : "Update Participant"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Success/Error Snackbar */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default EditParticipant;
