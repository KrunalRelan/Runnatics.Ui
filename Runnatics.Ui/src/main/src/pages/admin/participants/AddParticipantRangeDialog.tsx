import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { AddParticipantRangeDialogProps } from "@/main/src/models/participants/AddParticipantRangeDialogProps";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { AddParticipantRangeRequest } from "@/main/src/models/participants";

const AddParticipantRangeDialog: React.FC<AddParticipantRangeDialogProps> = ({
  open,
  onClose,
  onComplete,
  eventId,
  raceId,
}) => {
  const [prefix, setPrefix] = useState<string>("");
  const [fromBibNumber, setFromBibNumber] = useState<string>("");
  const [toBibNumber, setToBibNumber] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateInputs = (): string | null => {
    const fromNum = parseInt(fromBibNumber, 10);
    const toNum = parseInt(toBibNumber, 10);

    if (isNaN(fromNum) || fromNum < 1) {
      return "From Bib Number must be a valid positive number";
    }

    if (isNaN(toNum) || toNum < 1) {
      return "To Bib Number must be a valid positive number";
    }

    if (fromNum > toNum) {
      return "From Bib Number must be less than or equal to To Bib Number";
    }

    const rangeSize = toNum - fromNum + 1;
    if (rangeSize > 10000) {
      return "Range cannot exceed 10,000 bib numbers";
    }

    return null;
  };

  const handleSubmit = async () => {
    // Validate inputs
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: AddParticipantRangeRequest = {
        prefix: prefix.trim() || undefined,
        fromBibNumber: parseInt(fromBibNumber, 10),
        toBibNumber: parseInt(toBibNumber, 10),
        suffix: suffix.trim() || undefined,
      };

      const response = await ParticipantService.addParticipantRange(
        eventId,
        raceId,
        request
      );

      if (response.message === null) {
        setError(typeof response.message === 'string' ? response.message : "Failed to add participant range");
        return;
      }

      const result = response.message;
      
      // Build success message
      let message = `Successfully created ${result.totalCreated} participants.`;
      if (result.totalSkipped > 0) {
        message += ` ${result.totalSkipped} bib number(s) were skipped (already exist).`;
      }
      
      setSuccessMessage(message);
      
      // Reset form
      setPrefix("");
      setFromBibNumber("");
      setToBibNumber("");
      setSuffix("");

      // Notify parent component
      onComplete();

    } catch (err: any) {
      console.error("Failed to add participant range:", err);
      setError(
        err.response?.data?.error?.message || 
        err.response?.data?.error || 
        err.message || 
        "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccessMessage(null);
      onClose();
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1300,
        }}
        onClick={handleClose}
      >
        <Card 
          sx={{ width: "500px", maxWidth: "90%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add Participant Range
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                label="Prefix"
                placeholder="Enter prefix (optional)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                helperText="e.g., 'A' will create A1, A2, A3..."
              />
              <TextField
                label="From Bib Number"
                placeholder="Enter starting bib number"
                value={fromBibNumber}
                onChange={(e) => setFromBibNumber(e.target.value.replace(/\D/g, ''))}
                fullWidth
                size="small"
                required
                disabled={loading}
                type="text"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
              <TextField
                label="To Bib Number"
                placeholder="Enter ending bib number"
                value={toBibNumber}
                onChange={(e) => setToBibNumber(e.target.value.replace(/\D/g, ''))}
                fullWidth
                size="small"
                required
                disabled={loading}
                type="text"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
              <TextField
                label="Suffix"
                placeholder="Enter suffix (optional)"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                helperText="e.g., '-VIP' will create 1-VIP, 2-VIP..."
              />
            </Stack>

            {fromBibNumber && toBibNumber && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Preview: {prefix}{fromBibNumber}{suffix} to {prefix}{toBibNumber}{suffix}
                {" "}({parseInt(toBibNumber) - parseInt(fromBibNumber) + 1 || 0} bibs)
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !fromBibNumber || !toBibNumber}
                sx={{ textTransform: "none", minWidth: 120 }}
              >
                {loading ? <CircularProgress size={20} /> : "Add Range"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddParticipantRangeDialog;