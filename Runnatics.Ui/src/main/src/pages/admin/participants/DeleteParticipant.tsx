import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Snackbar,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { Participant } from "@/main/src/models/races/Participant";
import { ParticipantService } from "@/main/src/services/ParticipantService";

interface DeleteParticipantProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  participant: Participant | null;
}

const DeleteParticipant: React.FC<DeleteParticipantProps> = ({
  open,
  onClose,
  onDelete,
  participant,
}) => {
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

  const handleClose = () => {
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!participant?.id) {
      setError("Participant ID is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ParticipantService.deleteParticipant(participant.id);

      // Show success message
      setSnackbar({
        open: true,
        message: "Participant deleted successfully!",
        severity: "success",
      });

      // Call parent callback to refresh the list
      onDelete();

      // Close dialog after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error deleting participant:", err);

      // Extract error message from various possible response formats
      let errorMessage = "Failed to delete participant. Please try again.";

      if (err.response?.data) {
        const data = err.response.data;

        // Check for validation errors from ASP.NET
        if (data.errors && typeof data.errors === "object") {
          const validationErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages)
                ? messages.join(", ")
                : messages;
              return `${field}: ${msgs}`;
            })
            .join("; ");
          errorMessage = validationErrors;
        }
        // Check for title/detail error format
        else if (data.title || data.detail) {
          errorMessage = data.detail || data.title;
        }
        // Check for simple message string
        else if (typeof data === "string") {
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
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmber color="warning" />
            <Typography variant="h6" component="span">
              Delete Participant
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, mt: 2 }}
              onClose={() => setError(null)}
            >
              <strong>Error:</strong> {error}
            </Alert>
          )}
          <Typography variant="body1" sx={{ mt: error ? 1 : 2 }}>
            Are you sure you want to delete this participant?
          </Typography>
          {participant && (
            <Box sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
              borderRadius: 1
            }}>
              <Typography variant="body2">
                <strong>Bib:</strong> {participant.bib}
              </Typography>
              {participant.fullName && (
                <Typography variant="body2">
                  <strong>Name:</strong> {participant.fullName}
                </Typography>
              )}
              {participant.email && (
                <Typography variant="body2">
                  <strong>Email:</strong> {participant.email}
                </Typography>
              )}
            </Box>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontStyle: "italic" }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

export default DeleteParticipant;
