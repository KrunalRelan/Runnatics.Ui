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
  TextField,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { Event } from "@/main/src/models";
import { EventService } from "@/main/src/services/EventService";

interface DeleteEventProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful delete so the parent can show a snackbar and re-fetch. */
  onDelete: () => void;
  event: Event | null;
}

// Confirmation dialog for deleting an event from the dashboard — mirrors the
// DeleteParticipant dialog: warning banner, details box, and a type-to-confirm
// gate (the event name here, since events have no BIB).
const DeleteEvent: React.FC<DeleteEventProps> = ({
  open,
  onClose,
  onDelete,
  event,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState<string>("");

  const nameMatches =
    confirmName.trim().toLowerCase() === (event?.name || "").trim().toLowerCase();

  const handleClose = () => {
    setError(null);
    setLoading(false);
    setConfirmName("");
    onClose();
  };

  const handleDelete = async () => {
    if (!event?.id) {
      setError("Event ID is missing");
      return;
    }

    if (!nameMatches) {
      setError("Event name does not match. Please type the exact event name to confirm.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await EventService.deleteEvent(event.id);
      onDelete();
      handleClose();
    } catch (err: any) {
      console.error("Error deleting event:", err);

      let errorMessage = "Failed to delete event. Please try again.";

      if (err.response?.data) {
        const data = err.response.data;

        if (data.errors && typeof data.errors === "object") {
          const validationErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages.join(", ") : messages;
              return `${field}: ${msgs}`;
            })
            .join("; ");
          errorMessage = validationErrors;
        } else if (data.title || data.detail) {
          errorMessage = data.detail || data.title;
        } else if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString()
    : null;

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
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmber color="error" />
          <Typography variant="h6" component="span" color="error">
            Delete Event
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

        {event && (
          <>
            <Alert severity="warning" sx={{ mt: error ? 1 : 2, mb: 2 }}>
              You are about to permanently delete event{" "}
              <strong>{event.name}</strong>
              {formattedDate ? ` (${formattedDate})` : ""}. All of its races,
              participants and results will no longer be accessible. This action
              cannot be undone.
            </Alert>

            <Box
              sx={{
                p: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2">
                <strong>Name:</strong> {event.name}
              </Typography>
              {formattedDate && (
                <Typography variant="body2">
                  <strong>Date:</strong> {formattedDate}
                </Typography>
              )}
              {event.city && (
                <Typography variant="body2">
                  <strong>City:</strong> {event.city}
                </Typography>
              )}
              {event.eventOrganizerName && (
                <Typography variant="body2">
                  <strong>Organizer:</strong> {event.eventOrganizerName}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Type the event name <strong>{event.name}</strong> to confirm deletion:
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={`Type ${event.name} to confirm`}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              error={confirmName.length > 0 && !nameMatches}
              helperText={
                confirmName.length > 0 && !nameMatches
                  ? "Event name does not match"
                  : ""
              }
              disabled={loading}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading || !nameMatches}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteEvent;
