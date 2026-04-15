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
  TextField,
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
  const [confirmBib, setConfirmBib] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const bibMatches = confirmBib.trim() === String(participant?.bib || "").trim();

  const handleClose = () => {
    setError(null);
    setLoading(false);
    setConfirmBib("");
    onClose();
  };

  const handleDelete = async () => {
    if (!participant?.id) {
      setError("Participant ID is missing");
      return;
    }

    if (!bibMatches) {
      setError("BIB number does not match. Please type the exact BIB number to confirm.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ParticipantService.deleteParticipant(participant.id);

      setSnackbar({
        open: true,
        message: "Participant deleted successfully!",
        severity: "success",
      });

      onDelete();

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error deleting participant:", err);

      let errorMessage = "Failed to delete participant. Please try again.";

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
            <WarningAmber color="error" />
            <Typography variant="h6" component="span" color="error">
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

          {participant && (
            <>
              <Alert severity="warning" sx={{ mt: error ? 1 : 2, mb: 2 }}>
                You are about to permanently delete participant{" "}
                <strong>{participant.fullName || participant.name || "Unknown"}</strong>{" "}
                (BIB #{participant.bib}). This action cannot be undone.
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
                  <strong>BIB:</strong> {participant.bib}
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

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Type BIB number <strong>{participant.bib}</strong> to confirm deletion:
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={`Type ${participant.bib} to confirm`}
                value={confirmBib}
                onChange={(e) => setConfirmBib(e.target.value)}
                error={confirmBib.length > 0 && !bibMatches}
                helperText={
                  confirmBib.length > 0 && !bibMatches
                    ? "BIB number does not match"
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
            disabled={loading || !bibMatches}
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
