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
    name: "",
    gender: "Male",
    category: "Open",
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
      name: "",
      gender: "Male",
      category: "Open",
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
    // Validate required fields
    if (!formData.bib || !formData.name || !formData.chipId) {
      alert("Please fill in all required fields (Bib, Name, and Chip ID)");
      return;
    }

    // Create participant with additional fields
    const participantToAdd: Participant = {
      ...formData,
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
          <Stack direction="row" spacing={2}>
            <TextField
              label="Bib Number"
              value={formData.bib}
              onChange={(e) => handleFormChange("bib", e.target.value)}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Chip ID"
              value={formData.chipId}
              onChange={(e) => handleFormChange("chipId", e.target.value)}
              fullWidth
              required
              size="small"
            />
          </Stack>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            fullWidth
            required
            size="small"
          />
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
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e: SelectChangeEvent) =>
                  handleFormChange("category", e.target.value)
                }
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Veteran">Veteran</MenuItem>
                <MenuItem value="Junior">Junior</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e: SelectChangeEvent) =>
                  handleFormChange("status", e.target.value)
                }
              >
                <MenuItem value="Registered">Registered</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
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
              sx={{ width: "100%" }}
            />
          </Stack>
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
