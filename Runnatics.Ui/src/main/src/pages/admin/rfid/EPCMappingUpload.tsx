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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  CheckCircle,
  InsertDriveFile,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/main/src/components/PageContainer";
import { RFIDService } from "@/main/src/services/RFIDService";
import { EventService } from "@/main/src/services/EventService";
import { RaceService } from "@/main/src/services/RaceService";

interface UploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadResult: string | null;
  error: string | null;
  isDragging: boolean;
}

const EPCMappingUpload: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [eventError, setEventError] = useState("");
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    uploadResult: null,
    error: null,
    isDragging: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pastEventsQuery = useQuery({
    queryKey: ["events", "past"],
    queryFn: () => EventService.getPastEvents(),
  });

  const futureEventsQuery = useQuery({
    queryKey: ["events", "future"],
    queryFn: () => EventService.getFutureEvents(),
  });

  const racesQuery = useQuery({
    queryKey: ["races", selectedEventId],
    queryFn: () =>
      RaceService.getAllRaces({
        eventId: selectedEventId,
        searchCriteria: { pageNumber: 1, pageSize: 100 },
      }),
    enabled: !!selectedEventId,
  });

  const events = [
    ...(futureEventsQuery.data?.message ?? []),
    ...(pastEventsQuery.data?.message ?? []),
  ];
  const eventsLoading = pastEventsQuery.isLoading || futureEventsQuery.isLoading;
  const eventsError = pastEventsQuery.error || futureEventsQuery.error;
  const races = racesQuery.data?.message ?? [];

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

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedRaceId("");
    if (eventId) setEventError("");
  };

  const handleUpload = async () => {
    if (!state.selectedFile) return;

    if (!selectedEventId) {
      setEventError("Please select an event");
      return;
    }
    setEventError("");

    updateState({ isUploading: true, error: null, uploadResult: null, uploadProgress: 0 });

    try {
      const response = await RFIDService.uploadEPCMapping(
        selectedEventId,
        state.selectedFile,
        selectedRaceId || undefined,
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
            <strong>Required:</strong> Event &nbsp;|&nbsp; <strong>Optional:</strong> Race
          </Typography>
        </Alert>

        {state.error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => updateState({ error: null })}>
            {state.error}
          </Alert>
        )}

        {state.uploadResult && (
          <Card sx={{ mb: 3, bgcolor: "success.dark" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckCircle sx={{ fontSize: 40, color: "common.white" }} />
                <Box>
                  <Typography variant="h6" color="common.white" fontWeight={700}>
                    Upload Successful!
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
                    {typeof state.uploadResult === "string"
                      ? state.uploadResult
                      : "EPC mapping file processed."}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }} />
              <Button variant="contained" onClick={handleUploadAnother} sx={{ bgcolor: "common.white", color: "success.dark", "&:hover": { bgcolor: "grey.100" } }}>
                Upload Another File
              </Button>
            </CardContent>
          </Card>
        )}

        {!state.uploadResult && (
          <>
            {/* Event / Race dropdowns */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Event Details
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {/* Event dropdown */}
                <FormControl
                  size="small"
                  sx={{ minWidth: 260 }}
                  required
                  error={!!eventError}
                  disabled={state.isUploading}
                >
                  <InputLabel>Event</InputLabel>
                  <Select
                    value={selectedEventId}
                    label="Event"
                    onChange={(e) => handleEventChange(e.target.value)}
                    endAdornment={
                      eventsLoading ? (
                        <CircularProgress size={16} sx={{ mr: 2 }} />
                      ) : undefined
                    }
                  >
                    {eventsError && (
                      <MenuItem disabled>Failed to load events</MenuItem>
                    )}
                    {events.map((event) => (
                      <MenuItem key={event.id} value={event.id!}>
                        {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{eventError || "Required"}</FormHelperText>
                </FormControl>

                {/* Race dropdown */}
                <FormControl
                  size="small"
                  sx={{ minWidth: 260 }}
                  disabled={!selectedEventId || state.isUploading}
                >
                  <InputLabel>Race</InputLabel>
                  <Select
                    value={selectedRaceId}
                    label="Race"
                    onChange={(e) => setSelectedRaceId(e.target.value)}
                    endAdornment={
                      racesQuery.isLoading ? (
                        <CircularProgress size={16} sx={{ mr: 2 }} />
                      ) : undefined
                    }
                  >
                    <MenuItem value="">
                      <em>All races</em>
                    </MenuItem>
                    {races.map((race) => (
                      <MenuItem key={race.id} value={race.id}>
                        {race.title}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional</FormHelperText>
                </FormControl>
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
                  ? "primary.dark"
                  : state.selectedFile
                  ? "action.selected"
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
              onClick={() =>
                !state.isUploading && !state.selectedFile && fileInputRef.current?.click()
              }
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
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
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
              <strong>Event:</strong> Required — must select an existing event
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Race:</strong> Optional — leave as "All races" to apply mapping across all races
            </Typography>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default EPCMappingUpload;
