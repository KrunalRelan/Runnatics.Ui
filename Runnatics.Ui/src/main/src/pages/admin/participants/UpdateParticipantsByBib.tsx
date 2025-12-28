import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  Download,
  Close,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { UpdateParticipantsByBibResponse } from "@/main/src/models/participants";

interface UpdateParticipantsByBibProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  eventId: string;
  raceId: string;
}

const UpdateParticipantsByBib: React.FC<UpdateParticipantsByBibProps> = ({
  open,
  onClose,
  onComplete,
  eventId,
  raceId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updateResult, setUpdateResult] = useState<UpdateParticipantsByBibResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
        setUpdateResult(null);
      } else {
        setError("Please select a valid CSV file");
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setUpdateResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ParticipantService.updateParticipantsByBib(
        eventId,
        raceId,
        selectedFile
      );

      setUpdateResult(response.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || "Update failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUpdateResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCompleteAndClose = () => {
    handleReset();
    onComplete();
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "Bib,Name,Gender,Age Category,Email,Mobile\n" +
      "101,John Doe,Male,18 to 35,john@example.com,1234567890\n" +
      "102,Jane Smith,Female,35.1 to 45,jane@example.com,9876543210\n" +
      "103,Bob Johnson,M,45.1 to 55,bob@example.com,5551234567\n" +
      "104,Alice Williams,F,55.1 to 65,alice@example.com,5559876543\n" +
      "105,Charlie Brown,Male,Above 75,charlie@example.com,5555555555";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "participant_update_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case "Completed":
        return "success";
      case "PartiallyCompleted":
        return "warning";
      case "Failed":
        return "error";
      default:
        return "warning";
    }
  };

  const renderFileUpload = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Upload a CSV file to update participant details by bib number
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will update existing participants (created via "Add Participant Range") with their complete information.
          The CSV file must contain bib numbers that already exist in the system.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadTemplate}
          size="small"
          sx={{ mb: 3 }}
        >
          Download CSV Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          border: "2px dashed",
          borderColor: selectedFile ? "primary.main" : "divider",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          bgcolor: selectedFile ? "action.hover" : "background.default",
          transition: "all 0.2s",
          mb: 3,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input">
          <IconButton
            component="span"
            color="primary"
            sx={{
              bgcolor: "primary.lighter",
              mb: 2,
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            <CloudUpload fontSize="large" />
          </IconButton>
        </label>

        {selectedFile ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                {selectedFile.name}
              </Typography>
              <IconButton size="small" onClick={handleRemoveFile} color="error">
                <Close fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click the icon above or drag and drop a CSV file here
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderResults = () => {
    if (!updateResult) return null;

    return (
      <Box>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          {updateResult.status === "Completed" && (
            <CheckCircle color="success" fontSize="large" />
          )}
          {updateResult.status === "PartiallyCompleted" && (
            <Warning color="warning" fontSize="large" />
          )}
          {updateResult.status === "Failed" && (
            <ErrorIcon color="error" fontSize="large" />
          )}
          <Box>
            <Typography variant="h6" gutterBottom>
              Update {updateResult.status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processed at: {new Date(updateResult.processedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Alert severity={getStatusColor(updateResult.status)} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Success:</strong> {updateResult.successCount} participants updated
          </Typography>
          {updateResult.errorCount > 0 && (
            <Typography variant="body2">
              <strong>Errors:</strong> {updateResult.errorCount} participants failed
            </Typography>
          )}
          {updateResult.notFoundCount > 0 && (
            <Typography variant="body2">
              <strong>Not Found:</strong> {updateResult.notFoundCount} bib numbers not found
            </Typography>
          )}
        </Alert>

        {updateResult.notFoundBibs && updateResult.notFoundBibs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Bib Numbers Not Found:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {updateResult.notFoundBibs.slice(0, 10).map((bib, index) => (
                <Chip key={index} label={bib} size="small" color="warning" />
              ))}
              {updateResult.notFoundBibs.length > 10 && (
                <Chip
                  label={`+${updateResult.notFoundBibs.length - 10} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {updateResult.errors && updateResult.errors.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Errors:
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Bib</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {updateResult.errors.slice(0, 5).map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.rowNumber}</TableCell>
                      <TableCell>
                        <Chip label={error.bib} size="small" />
                      </TableCell>
                      <TableCell>{error.name}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="error">
                          {error.errorMessage}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {updateResult.errors.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Showing 5 of {updateResult.errors.length} errors
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Update Participants by Bib Number</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {!updateResult && renderFileUpload()}
        {updateResult && renderResults()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!updateResult ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={!selectedFile || loading}
              startIcon={<CloudUpload />}
            >
              {loading ? "Updating..." : "Update Participants"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleReset} disabled={loading}>
              Update More
            </Button>
            <Button variant="contained" onClick={handleCompleteAndClose}>
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpdateParticipantsByBib;
