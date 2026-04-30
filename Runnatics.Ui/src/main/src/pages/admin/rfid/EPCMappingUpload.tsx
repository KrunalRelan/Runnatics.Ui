import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  LinearProgress,
  IconButton,
  Card,
  CardContent,
  TextField,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  CheckCircle,
  InsertDriveFile,
} from "@mui/icons-material";
import PageContainer from "@/main/src/components/PageContainer";
import { RFIDService } from "@/main/src/services/RFIDService";

interface UploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadResult: string | null;
  error: string | null;
  isDragging: boolean;
}

const EPCMappingUpload: React.FC = () => {
  const [eventId, setEventId] = useState("");
  const [raceId, setRaceId] = useState("");
  const [eventIdError, setEventIdError] = useState("");
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    uploadResult: null,
    error: null,
    isDragging: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<UploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const validateAndSetFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      updateState({ error: "Only CSV files (.csv) are supported", selectedFile: null });
      return;
    }
    updateState({ selectedFile: file, error: null, uploadResult: null });
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    updateState({ isDragging: true });
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    updateState({ isDragging: false });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    updateState({ isDragging: false });
    const file = event.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!state.selectedFile) return;

    if (!eventId.trim()) {
      setEventIdError("Event ID is required");
      return;
    }
    setEventIdError("");

    updateState({ isUploading: true, error: null, uploadResult: null, uploadProgress: 0 });

    try {
      const response = await RFIDService.uploadEPCMapping(
        eventId.trim(),
        state.selectedFile,
        raceId.trim() || undefined,
        (progress) => updateState({ uploadProgress: progress })
      );

      const resultMessage =
        (response as any)?.message ||
        (response as any)?.data?.message ||
        "EPC mapping uploaded successfully.";

      updateState({
        uploadResult: resultMessage,
        selectedFile: null,
        isUploading: false,
        uploadProgress: 100,
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Please try again.";

      updateState({ error: errorMessage, isUploading: false, uploadProgress: 0 });
    }
  };

  const handleClear = () => {
    updateState({ selectedFile: null, error: null, uploadResult: null, uploadProgress: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAnother = () => {
    updateState({ selectedFile: null, uploadResult: null, error: null, uploadProgress: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <PageContainer title="EPC & BIB Mapping Upload">
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Upload a CSV file containing EPC to BIB number mappings for a specific event and race.
            <br />
            <strong>Required:</strong> Event ID &nbsp;|&nbsp; <strong>Optional:</strong> Race ID
          </Typography>
        </Alert>

        {state.error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => updateState({ error: null })}>
            {state.error}
          </Alert>
        )}

        {state.uploadResult && (
          <Card sx={{ mb: 3, bgcolor: "success.light" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h6" color="success.dark">
                    Upload Successful!
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    {typeof state.uploadResult === "string" ? state.uploadResult : "EPC mapping file processed."}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Button variant="contained" onClick={handleUploadAnother}>
                Upload Another File
              </Button>
            </CardContent>
          </Card>
        )}

        {!state.uploadResult && (
          <>
            {/* Event / Race ID inputs */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Event Details
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  label="Event ID"
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    if (e.target.value.trim()) setEventIdError("");
                  }}
                  error={!!eventIdError}
                  helperText={eventIdError || "Required"}
                  required
                  size="small"
                  sx={{ minWidth: 200 }}
                  disabled={state.isUploading}
                />
                <TextField
                  label="Race ID"
                  value={raceId}
                  onChange={(e) => setRaceId(e.target.value)}
                  helperText="Optional"
                  size="small"
                  sx={{ minWidth: 200 }}
                  disabled={state.isUploading}
                />
              </Box>
            </Paper>

            {/* File drop zone */}
            <Paper
              sx={{
                p: 4,
                border: (theme) =>
                  `2px dashed ${
                    state.isDragging
                      ? theme.palette.primary.main
                      : state.selectedFile
                      ? theme.palette.success.main
                      : theme.palette.divider
                  }`,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: state.isDragging
                  ? "primary.light"
                  : state.selectedFile
                  ? "success.light"
                  : "action.hover",
                transition: "all 0.2s ease",
                cursor: state.isUploading ? "default" : "pointer",
                "&:hover": {
                  borderColor: state.isUploading ? undefined : "primary.main",
                  bgcolor: state.isUploading ? undefined : "action.selected",
                },
              }}
              onDragOver={!state.isUploading ? handleDragOver : undefined}
              onDragLeave={!state.isUploading ? handleDragLeave : undefined}
              onDrop={!state.isUploading ? handleDrop : undefined}
              onClick={() => !state.isUploading && !state.selectedFile && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
                disabled={state.isUploading}
              />

              {state.selectedFile ? (
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                    <InsertDriveFile sx={{ fontSize: 48, color: "success.main" }} />
                    <Box textAlign="left">
                      <Typography variant="body1" fontWeight={500}>
                        {state.selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {RFIDService.formatBytes(state.selectedFile.size)}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); handleClear(); }}
                      disabled={state.isUploading}
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  {state.isUploading && (
                    <Box sx={{ width: "100%", mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={state.uploadProgress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {state.uploadProgress}% uploaded
                      </Typography>
                    </Box>
                  )}

                  {!state.isUploading && (
                    <Box display="flex" gap={2} justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                        startIcon={<CloudUpload />}
                      >
                        Upload File
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Choose Different File
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag and drop EPC mapping CSV here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    or
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Browse Files
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    Supported format: .csv
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}

        {/* File requirements */}
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            File Requirements
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>File type:</strong> CSV (.csv)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Content:</strong> EPC to BIB number mapping rows
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Event ID:</strong> Must match an existing event in the system
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Race ID:</strong> Optional — filters mapping to a specific race
            </Typography>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default EPCMappingUpload;
