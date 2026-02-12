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
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  CheckCircle,
  InsertDriveFile,
  Schedule,
  Memory,
  Storage,
  Timeline,
} from "@mui/icons-material";
import PageContainer from "@/main/src/components/PageContainer";
import { RFIDService } from "@/main/src/services/RFIDService";
import { RFIDUploadState } from "@/main/src/models/rfid";

const RFIDFileUpload: React.FC = () => {
  const [state, setState] = useState<RFIDUploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    uploadResult: null,
    error: null,
    isDragging: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<RFIDUploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const validateAndSetFile = useCallback((file: File) => {
    const validation = RFIDService.validateFileName(file.name);
    
    if (!validation.isValid) {
      updateState({ error: validation.error || 'Invalid file', selectedFile: null });
      return;
    }

    updateState({
      selectedFile: file,
      error: null,
      uploadResult: null,
    });
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
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
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!state.selectedFile) return;

    updateState({
      isUploading: true,
      error: null,
      uploadResult: null,
      uploadProgress: 0,
    });

    try {
      const response = await RFIDService.uploadRFIDFileAuto(
        state.selectedFile,
        {},
        (progress) => updateState({ uploadProgress: progress })
      );

      if (response.message) {
        updateState({
          uploadResult: response.message,
          selectedFile: null,
          isUploading: false,
          uploadProgress: 100,
        });
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Please try again.";
      
      updateState({
        error: errorMessage,
        isUploading: false,
        uploadProgress: 0,
      });
    }
  };

  const handleClear = () => {
    updateState({
      selectedFile: null,
      error: null,
      uploadResult: null,
      uploadProgress: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadAnother = () => {
    updateState({
      selectedFile: null,
      uploadResult: null,
      error: null,
      uploadProgress: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case "uploaded":
      case "completed":
        return "success";
      case "processing":
        return "info";
      case "failed":
        return "error";
      case "uploading":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <PageContainer title="Upload RFID Reader File">
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Upload RFID reader database files (.db, .sqlite) with automatic device and event detection.
            <br />
            <strong>Filename format:</strong> YYYY-MM-DD_DeviceName.db (e.g., 2026-01-25_00162512dbb0.db)
          </Typography>
        </Alert>

        {/* Error Alert */}
        {state.error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => updateState({ error: null })}
          >
            {state.error}
          </Alert>
        )}

        {/* Success Result */}
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
                    File has been processed and data extracted
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <InsertDriveFile fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      File Name
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {state.uploadResult.fileName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Memory fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Total Readings
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="primary.main" fontWeight={600}>
                    {state.uploadResult.totalReadings.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Timeline fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Unique Tags
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="secondary.main" fontWeight={600}>
                    {state.uploadResult.uniqueEpcs}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Storage fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      File Size
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {RFIDService.formatBytes(state.uploadResult.fileSizeBytes)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={state.uploadResult.status.toUpperCase()} 
                    color={getStatusColor(state.uploadResult.status)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Time Range
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {RFIDService.formatTimestamp(state.uploadResult.timeRangeStart)}
                    {" → "}
                    {RFIDService.formatTimestamp(state.uploadResult.timeRangeEnd)}
                  </Typography>
                </Grid>

                {state.uploadResult.uploadBatchId && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Batch ID: <code>{state.uploadResult.uploadBatchId}</code>
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Validation Errors */}
              {state.uploadResult.errors && state.uploadResult.errors.length > 0 && (
                <Box mt={3}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Found {state.uploadResult.errors.length} validation warning(s)
                  </Alert>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
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
                        {state.uploadResult.errors.map((err, idx) => (
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

              <Box mt={3}>
                <Button variant="contained" onClick={handleUploadAnother}>
                  Upload Another File
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        {!state.uploadResult && (
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
              accept=".db,.sqlite"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
              disabled={state.isUploading}
            />

            {state.selectedFile ? (
              // Selected file display
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    disabled={state.isUploading}
                    size="small"
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Progress bar */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                      startIcon={<CloudUpload />}
                    >
                      Upload File
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Choose Different File
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              // Drop zone
              <Box>
                <CloudUpload sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag and drop RFID file here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                  Supported formats: .db, .sqlite
                  <br />
                  Filename format: YYYY-MM-DD_DeviceName.db
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Format Requirements */}
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            File Requirements
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>File type:</strong> SQLite database files (.db, .sqlite)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Filename format:</strong> YYYY-MM-DD_DeviceName.db
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Device name:</strong> Extracted from the part after the first underscore
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Auto-detection:</strong> Event and race are automatically determined from device assignment
            </Typography>
          </Box>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Valid Filename Examples
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip size="small" label="2026-01-25_00162512dbb0.db" color="success" variant="outlined" />
            <Chip size="small" label="2026-01-25_StartLine.db" color="success" variant="outlined" />
            <Chip size="small" label="2024-12-15_FinishLine_A.db" color="success" variant="outlined" />
          </Box>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Invalid Filename Examples
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip size="small" label="readings.db" color="error" variant="outlined" />
            <Chip size="small" label="2026-01-25.db" color="error" variant="outlined" />
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default RFIDFileUpload;
