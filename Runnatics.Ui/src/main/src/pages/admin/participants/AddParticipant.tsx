import React, { useState } from "react";
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
} from "@mui/material";
import { Participant } from "@/main/src/models/races/Participant";

interface AddParticipantProps {
  open: boolean;
  onClose: () => void;
  onAdd: (participant: Participant) => void;
  eventId?: string;
  raceId?: string;
}

const AddParticipant: React.FC<AddParticipantProps> = ({
  open,
  onClose,
  onAdd,
  eventId,
  raceId,
}) => {
  const [formData, setFormData] = useState<Participant>({
    bib: "",
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "Male",
    category: "",
    status: "Registered",
    checkIn: false,
    chipId: "",
  });

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
      gender: "Male",
      category: "",
      status: "Registered",
      checkIn: false,
      chipId: "",
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    // Validate only bib is required
    if (!formData.bib || formData.bib.trim() === "") {
      alert("Please enter a Bib Number");
      return;
    }

    // Auto-generate fullName from firstName and lastName
    const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();

    // Create participant with additional fields
    const participantToAdd: Participant = {
      ...formData,
      fullName: fullName || undefined,
      name: fullName || undefined,
      raceId: raceId,
      eventId: eventId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(participantToAdd);
    handleClose();
  };

  return (
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
      <DialogTitle>Add New Participant</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
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
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Participant
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddParticipant;
