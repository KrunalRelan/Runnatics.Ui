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
} from "@mui/icons-material";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { UploadResponse, ProcessResponse } from "@/main/src/models/participants";

interface BulkUploadParticipantsProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  eventId: string;
  raceId?: string;
}

const BulkUploadParticipants: React.FC<BulkUploadParticipantsProps> = ({
  open,
  onClose,
  onComplete,
  eventId,
  raceId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Review, 3: Complete
  const [loading, setLoading] = useState<boolean>(false);
  const [importBatchId, setImportBatchId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [processResult, setProcessResult] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a valid CSV file");
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ParticipantService.uploadParticipantCSV(
        eventId,
        selectedFile,
        raceId
      );

      setUploadResult(response.message);
      setImportBatchId(response.message.importBatchId.toString());
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!importBatchId) {
      setError("No import batch to process");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ParticipantService.processParticipantImport(
        eventId,
        importBatchId,
        raceId
      );

      setProcessResult(response.message);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFile(null);
    setImportBatchId(null);
    setUploadResult(null);
    setProcessResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    link.download = "participants_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    handleReset();
    onClose();
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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Import Participants</Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 1 && "Step 1: Upload CSV File"}
              {step === 2 && "Step 2: Review Upload Results"}
              {step === 3 && "Step 3: Import Complete"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTemplate}
              fullWidth
              sx={{ mb: 3 }}
            >
              Download CSV Template
            </Button>

            <Box
              sx={{
                border: (theme) => `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                bgcolor: "action.hover",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.selected",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <CloudUpload sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click to select a CSV file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or drag and drop
              </Typography>
            </Box>

            {selectedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "primary.light",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500} color="primary.contrastText">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "primary.contrastText", opacity: 0.8 }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <IconButton onClick={handleRemoveFile} size="small" sx={{ color: "primary.contrastText" }}>
                  <Close />
                </IconButton>
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
                  Uploading and validating...
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                CSV Format Requirements:
              </Typography>
              <Typography variant="body2" component="div">
                <strong>Required columns:</strong> BIB, Name
              </Typography>
              <Typography variant="body2" component="div">
                <strong>Optional columns:</strong> Gender, Age Category, Email, Mobile
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Column names are case-insensitive and flexible (e.g., "bib", "Bib Number", or "number" all work)
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step 2: Review */}
        {step === 2 && uploadResult && (
          <Box>
            <Box display="flex" gap={2} mb={3}>
              <Paper sx={{ flex: 1, p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {uploadResult.totalRecords}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Records
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, textAlign: "center", bgcolor: "success.light" }}>
                <Typography variant="h4" color="success.dark">
                  {uploadResult.validRecords}
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Valid Records
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, textAlign: "center", bgcolor: "error.light" }}>
                <Typography variant="h4" color="error.dark">
                  {uploadResult.invalidRecords}
                </Typography>
                <Typography variant="body2" color="error.dark">
                  Invalid Records
                </Typography>
              </Paper>
            </Box>

            <Box mb={2}>
              <Typography variant="body2">
                <strong>File:</strong> {uploadResult.fileName}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{" "}
                <Chip
                  size="small"
                  label={uploadResult.status}
                  color={uploadResult.status === "Validated" ? "success" : "warning"}
                />
              </Typography>
            </Box>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Box>
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Found {uploadResult.errors.length} validation error(s)
                  </Typography>
                  <Typography variant="caption">
                    Rows with errors will be skipped during processing.
                  </Typography>
                </Alert>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Row</strong></TableCell>
                        <TableCell><strong>Field</strong></TableCell>
                        <TableCell><strong>Error</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uploadResult.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{err.rowNumber}</TableCell>
                          <TableCell>{err.field}</TableCell>
                          <TableCell>{err.message}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {err.value || "(empty)"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
                  Processing records...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Complete */}
        {step === 3 && processResult && (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Import Complete!
            </Typography>

            <Box display="flex" gap={2} justifyContent="center" my={3}>
              <Paper sx={{ p: 3, minWidth: 150, bgcolor: "success.light" }}>
                <Typography variant="h3" color="success.dark">
                  {processResult.successCount}
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Successfully Created
                </Typography>
              </Paper>
              {processResult.errorCount > 0 && (
                <Paper sx={{ p: 3, minWidth: 150, bgcolor: "error.light" }}>
                  <Typography variant="h3" color="error.dark">
                    {processResult.errorCount}
                  </Typography>
                  <Typography variant="body2" color="error.dark">
                    Errors
                  </Typography>
                </Paper>
              )}
            </Box>

            {processResult.errors && processResult.errors.length > 0 && (
              <Box mt={3}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Processing Errors
                  </Typography>
                </Alert>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Row</strong></TableCell>
                        <TableCell><strong>BIB</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Error</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {processResult.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{err.rowNumber}</TableCell>
                          <TableCell>{err.bib}</TableCell>
                          <TableCell>{err.name}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="error">
                              {err.errorMessage}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 1 && (
          <>
            <Button onClick={handleClose} variant="outlined" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || loading}
              startIcon={<CloudUpload />}
            >
              {loading ? "Uploading..." : "Upload & Validate"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Button onClick={handleReset} variant="outlined" disabled={loading}>
              Cancel & Upload New File
            </Button>
            <Button
              onClick={handleProcess}
              variant="contained"
              disabled={loading || !uploadResult || uploadResult.validRecords === 0}
              color="primary"
            >
              {loading ? "Processing..." : `Process ${uploadResult?.validRecords || 0} Valid Records`}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Button onClick={handleReset} variant="outlined">
              Import Another File
            </Button>
            <Button
              onClick={() => {
                handleClose();
                onComplete();
              }}
              variant="contained"
              color="success"
            >
              View Participants
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadParticipants;
