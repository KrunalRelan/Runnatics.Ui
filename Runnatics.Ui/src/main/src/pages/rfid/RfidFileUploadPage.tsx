import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Collapse,
  Alert,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack,
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Cancel,
  AccessTime,
  Warning,
  Delete,
  Refresh,
  Visibility,
  Close,
  ExpandMore,
  ExpandLess,
  ErrorOutline,
} from '@mui/icons-material';
import * as signalR from '@microsoft/signalr';
import PageContainer from '../../components/PageContainer';
import { getColorPalette } from '../../theme/colorPalette';
import { FileUploadService } from '../../services/FileUploadService';
import config from '../../config/environment';
import {
  FileUploadStatusDto,
  FileUploadRecordDto,
  FileProcessingStatus,
  ReadRecordStatus,
} from '../../models/FileUpload';

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (duration: string | null): string => {
  if (!duration) return '-';
  const parts = duration.split(':');
  if (parts.length >= 3) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    if (hours > 0) return `${hours}h ${minutes}m ${seconds.toFixed(0)}s`;
    if (minutes > 0) return `${minutes}m ${seconds.toFixed(0)}s`;
    return `${seconds.toFixed(1)}s`;
  }
  return duration;
};

// File Drop Zone Component
interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading: boolean;
  acceptedFormats?: string[];
  isDark: boolean;
  colors: ReturnType<typeof getColorPalette>;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  isUploading,
  acceptedFormats = ['.csv', '.json', '.txt'],
  isDark,
  colors,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedFormats.includes(ext);
      });

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, acceptedFormats]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected]
  );

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      sx={{
        border: `2px dashed ${isDragOver ? colors.primary.main : colors.border.main}`,
        borderRadius: '16px',
        p: 6,
        textAlign: 'center',
        cursor: isUploading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        bgcolor: isDragOver
          ? alpha(colors.primary.main, isDark ? 0.15 : 0.08)
          : colors.background.subtle,
        opacity: isUploading ? 0.5 : 1,
        '&:hover': {
          borderColor: colors.primary.main,
          bgcolor: alpha(colors.primary.main, isDark ? 0.1 : 0.05),
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      <CloudUpload
        sx={{
          fontSize: 64,
          color: isDragOver ? colors.primary.main : colors.text.secondary,
          mb: 2,
        }}
      />

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: colors.text.primary, mb: 1 }}
      >
        {isDragOver ? 'Drop files here' : 'Drag & drop RFID read files'}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
        or click to browse
      </Typography>
      <Typography variant="caption" sx={{ color: colors.text.disabled }}>
        Supported formats: {acceptedFormats.join(', ')}
      </Typography>
    </Box>
  );
};

// Upload Progress Component
interface UploadProgressProps {
  files: File[];
  uploadProgress: Map<string, number>;
  onRemove: (fileName: string) => void;
  colors: ReturnType<typeof getColorPalette>;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  files,
  uploadProgress,
  onRemove,
  colors,
}) => {
  return (
    <Stack spacing={1.5} sx={{ mt: 3 }}>
      {files.map((file) => {
        const progress = uploadProgress.get(file.name) || 0;
        const isComplete = progress === 100;

        return (
          <Box
            key={file.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: colors.background.subtle,
              borderRadius: '12px',
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <InsertDriveFile sx={{ color: colors.text.secondary, fontSize: 28 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                {formatFileSize(file.size)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(colors.primary.main, 0.15),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: isComplete ? colors.success.main : colors.primary.main,
                  },
                }}
              />
            </Box>
            {isComplete ? (
              <CheckCircle sx={{ color: colors.success.main, fontSize: 24 }} />
            ) : (
              <IconButton
                size="small"
                onClick={() => onRemove(file.name)}
                sx={{
                  color: colors.text.secondary,
                  '&:hover': { bgcolor: alpha(colors.error.main, 0.1) },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

// Batch List Item Component
interface BatchListItemProps {
  batch: FileUploadStatusDto;
  onView: (batchId: number) => void;
  onReprocess: (batchId: number) => void;
  onDelete: (batchId: number) => void;
  onCancel: (batchId: number) => void;
  isDark: boolean;
  colors: ReturnType<typeof getColorPalette>;
}

const BatchListItem: React.FC<BatchListItemProps> = ({
  batch,
  onView,
  onReprocess,
  onDelete,
  onCancel,
  isDark,
  colors,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = (status: FileProcessingStatus) => {
    switch (status) {
      case FileProcessingStatus.Completed:
        return { color: colors.success.main, icon: <CheckCircle sx={{ fontSize: 16 }} />, label: 'Completed' };
      case FileProcessingStatus.PartiallyCompleted:
        return { color: colors.warning.main, icon: <Warning sx={{ fontSize: 16 }} />, label: 'Partial' };
      case FileProcessingStatus.Failed:
        return { color: colors.error.main, icon: <Cancel sx={{ fontSize: 16 }} />, label: 'Failed' };
      case FileProcessingStatus.Processing:
        return { color: colors.primary.main, icon: <CircularProgress size={14} />, label: 'Processing' };
      case FileProcessingStatus.Cancelled:
        return { color: colors.text.secondary, icon: <Cancel sx={{ fontSize: 16 }} />, label: 'Cancelled' };
      default:
        return { color: colors.text.secondary, icon: <AccessTime sx={{ fontSize: 16 }} />, label: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig(batch.status);

  return (
    <Card
      sx={{
        border: `1px solid ${colors.border.light}`,
        borderRadius: '12px',
        bgcolor: colors.background.paper,
        overflow: 'hidden',
        boxShadow: isDark
          ? `0 4px 20px ${alpha('#000', 0.3)}`
          : `0 2px 12px ${alpha('#000', 0.08)}`,
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: alpha(colors.primary.main, 0.03) },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <InsertDriveFile sx={{ color: colors.text.secondary }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text.primary }}>
              {batch.originalFileName}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              {new Date(batch.createdAt).toLocaleString()}
              {batch.uploadedByUserName && ` • ${batch.uploadedByUserName}`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={statusConfig.icon as React.ReactElement}
            label={batch.statusText || statusConfig.label}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(statusConfig.color, isDark ? 0.2 : 0.1),
              color: statusConfig.color,
              border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
              '& .MuiChip-icon': { color: statusConfig.color },
            }}
          />

          {batch.status === FileProcessingStatus.Processing && (
            <Typography variant="body2" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
              {batch.progressPercent.toFixed(0)}%
            </Typography>
          )}

          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, pb: 2.5, bgcolor: colors.background.subtle }}>
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                Total Records
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text.primary }}>
                {batch.totalRecords.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                Processed
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary.main }}>
                {batch.processedRecords.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                Matched
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.success.main }}>
                {batch.matchedRecords.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                Duplicates
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.warning.main }}>
                {batch.duplicateRecords.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 600 }}>
                Errors
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.error.main }}>
                {batch.errorRecords.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          {batch.status === FileProcessingStatus.Processing && (
            <LinearProgress
              variant="determinate"
              value={batch.progressPercent}
              sx={{
                mb: 2,
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(colors.primary.main, 0.15),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: colors.primary.main,
                },
              }}
            />
          )}

          {batch.errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {batch.errorMessage}
            </Alert>
          )}

          {batch.processingDuration && (
            <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mb: 2 }}>
              Processing time: {formatDuration(batch.processingDuration)}
            </Typography>
          )}

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={(e) => {
                e.stopPropagation();
                onView(batch.batchId);
              }}
              sx={{
                borderColor: colors.border.main,
                color: colors.text.primary,
                '&:hover': {
                  borderColor: colors.primary.main,
                  bgcolor: alpha(colors.primary.main, 0.08),
                },
              }}
            >
              View Records
            </Button>

            {batch.status === FileProcessingStatus.Processing ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Cancel />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(batch.batchId);
                }}
                sx={{
                  borderColor: colors.warning.main,
                  color: colors.warning.main,
                  '&:hover': {
                    borderColor: colors.warning.main,
                    bgcolor: alpha(colors.warning.main, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
            ) : (
              <>
                {(batch.status === FileProcessingStatus.Failed ||
                  batch.status === FileProcessingStatus.PartiallyCompleted) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReprocess(batch.batchId);
                    }}
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      '&:hover': {
                        borderColor: colors.primary.main,
                        bgcolor: alpha(colors.primary.main, 0.1),
                      },
                    }}
                  >
                    Reprocess
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Delete />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(batch.batchId);
                  }}
                  sx={{
                    borderColor: colors.error.main,
                    color: colors.error.main,
                    '&:hover': {
                      borderColor: colors.error.main,
                      bgcolor: alpha(colors.error.main, 0.1),
                    },
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
};

// Records Modal Component
interface RecordsModalProps {
  batchId: number;
  onClose: () => void;
  isDark: boolean;
  colors: ReturnType<typeof getColorPalette>;
}

const RecordsModal: React.FC<RecordsModalProps> = ({ batchId, onClose, isDark, colors }) => {
  const [records, setRecords] = useState<FileUploadRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [batchId, page]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await FileUploadService.getBatchRecords(batchId, page, 100);
      setRecords((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 100);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordStatusConfig = (status: ReadRecordStatus) => {
    switch (status) {
      case ReadRecordStatus.Processed:
        return { color: colors.success.main, label: 'Processed' };
      case ReadRecordStatus.Valid:
        return { color: colors.primary.main, label: 'Valid' };
      case ReadRecordStatus.Duplicate:
        return { color: colors.warning.main, label: 'Duplicate' };
      case ReadRecordStatus.UnknownChip:
        return { color: colors.warning.dark, label: 'Unknown Chip' };
      case ReadRecordStatus.InvalidEpc:
      case ReadRecordStatus.InvalidTimestamp:
      case ReadRecordStatus.OutOfRaceWindow:
        return { color: colors.error.main, label: status };
      default:
        return { color: colors.text.secondary, label: 'Pending' };
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.background.paper,
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Upload Records - Batch #{batchId}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor: colors.background.subtle,
                    fontWeight: 700,
                    color: colors.text.primary,
                  },
                }}
              >
                <TableCell>Row</TableCell>
                <TableCell>EPC</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Antenna</TableCell>
                <TableCell>RSSI</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Matched Participant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => {
                const statusConfig = getRecordStatusConfig(record.status);
                return (
                  <TableRow
                    key={record.id}
                    sx={{ '&:hover': { bgcolor: alpha(colors.primary.main, 0.05) } }}
                  >
                    <TableCell>{record.rowNumber}</TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', color: colors.text.secondary }}
                      >
                        {record.epc}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(record.readTimestamp).toLocaleString()}</TableCell>
                    <TableCell>{record.antennaPort ?? '-'}</TableCell>
                    <TableCell>{record.rssiDbm?.toFixed(1) ?? '-'} dBm</TableCell>
                    <TableCell>
                      <Chip
                        label={record.statusText || statusConfig.label}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          bgcolor: alpha(statusConfig.color, isDark ? 0.2 : 0.1),
                          color: statusConfig.color,
                          border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                        }}
                      />
                      {record.errorMessage && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', color: colors.error.main, mt: 0.5 }}
                        >
                          {record.errorMessage}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.matchedParticipantName ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.matchedParticipantName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                            Bib: {record.matchedBibNumber}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: colors.text.disabled }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setPage((p) => p + 1)}
              sx={{
                borderColor: colors.border.main,
                color: colors.text.primary,
                '&:hover': {
                  borderColor: colors.primary.main,
                  bgcolor: alpha(colors.primary.main, 0.08),
                },
              }}
            >
              Load More
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Main File Upload Page Component
export const RfidFileUploadPage: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColorPalette(isDark);
  const raceIdNum = raceId ? parseInt(raceId) : 0;

  // TODO: Load checkpoints from API
  const checkpoints: Array<{ id: number; name: string }> = [];
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [batches, setBatches] = useState<FileUploadStatusDto[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [viewingBatchId, setViewingBatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

  // Setup SignalR on mount (batches load only after upload or manual request)
  useEffect(() => {
    if (raceIdNum) {
      setupSignalR();
    }

    return () => {
      hubConnectionRef.current?.stop();
    };
  }, [raceIdNum]);

  const setupSignalR = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.apiBaseUrl.replace('/api', '')}/hubs/race`, {
        accessTokenFactory: () => localStorage.getItem('authToken') || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('FileUploaded', () => {
      loadBatches();
    });

    connection.on('FileProcessingProgress', (status: FileUploadStatusDto) => {
      setBatches((prev) => prev.map((b) => (b.batchId === status.batchId ? status : b)));
    });

    connection.on('FileProcessingComplete', (status: FileUploadStatusDto) => {
      setBatches((prev) => prev.map((b) => (b.batchId === status.batchId ? status : b)));
    });

    try {
      await connection.start();
      await connection.invoke('JoinRace', raceIdNum);
      hubConnectionRef.current = connection;
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  };

  const loadBatches = async () => {
    if (!raceIdNum) return;
    setLoadingBatches(true);
    try {
      const data = await FileUploadService.getRaceBatches(raceIdNum, 1, 50);
      setBatches(data.batches);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
    setError(null);
  };

  const handleRemoveFile = (fileName: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of pendingFiles) {
        setUploadProgress((prev) => new Map(prev).set(file.name, 0));

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev.get(file.name) || 0;
            if (current < 90) {
              return new Map(prev).set(file.name, current + 10);
            }
            return prev;
          });
        }, 200);

        try {
          await FileUploadService.uploadFile(
            file,
            raceIdNum,
            selectedCheckpoint ? Number(selectedCheckpoint) : undefined,
            description
          );
          setUploadProgress((prev) => new Map(prev).set(file.name, 100));
        } finally {
          clearInterval(progressInterval);
        }
      }

      setTimeout(() => {
        setPendingFiles([]);
        setUploadProgress(new Map());
        setDescription('');
        loadBatches();
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReprocess = async (batchId: number) => {
    try {
      await FileUploadService.reprocessBatch(batchId);
      loadBatches();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Reprocess failed';
      setError(errorMessage);
    }
  };

  const handleDelete = async (batchId: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;

    try {
      await FileUploadService.deleteBatch(batchId);
      setBatches((prev) => prev.filter((b) => b.batchId !== batchId));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
    }
  };

  const handleCancel = async (batchId: number) => {
    try {
      await FileUploadService.cancelBatch(batchId);
      loadBatches();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cancel failed';
      setError(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(`/events/event-details/${eventId}/race/${raceId}`);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            mb: 3,
            borderColor: colors.border.main,
            color: colors.text.primary,
            '&:hover': {
              borderColor: colors.primary.main,
              bgcolor: alpha(colors.primary.main, 0.08),
            },
          }}
        >
          Back to Race
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.text.primary,
            mb: 1,
          }}
        >
          RFID Data Upload
        </Typography>
        <Typography variant="body1" sx={{ color: colors.text.secondary }}>
          Upload offline RFID read files for processing
        </Typography>
      </Box>

      {/* Upload Section */}
      <Card
        sx={{
          mb: 4,
          border: `1px solid ${colors.border.light}`,
          background: colors.background.paper,
          borderRadius: '16px',
          boxShadow: isDark
            ? `0 8px 32px ${alpha('#000', 0.4)}`
            : `0 4px 24px ${alpha('#000', 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
          >
            Upload Offline Data
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Checkpoint (Optional)</InputLabel>
                <Select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  label="Checkpoint (Optional)"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.border.main,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary.main,
                    },
                  }}
                >
                  <MenuItem value="">All Checkpoints</MenuItem>
                  {checkpoints.map((cp) => (
                    <MenuItem key={cp.id} value={cp.id}>
                      {cp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Start line backup data"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.border.main,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary.main,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          <FileDropZone
            onFilesSelected={handleFilesSelected}
            isUploading={isUploading}
            isDark={isDark}
            colors={colors}
          />

          {pendingFiles.length > 0 && (
            <>
              <UploadProgress
                files={pendingFiles}
                uploadProgress={uploadProgress}
                onRemove={handleRemoveFile}
                colors={colors}
              />

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={
                    isUploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CloudUpload />
                    )
                  }
                  onClick={handleUpload}
                  disabled={isUploading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: colors.primary.main,
                    '&:hover': {
                      bgcolor: colors.primary.dark,
                    },
                    '&:disabled': {
                      bgcolor: alpha(colors.primary.main, 0.5),
                    },
                  }}
                >
                  {isUploading
                    ? 'Uploading...'
                    : `Upload ${pendingFiles.length} File${pendingFiles.length > 1 ? 's' : ''}`}
                </Button>
              </Box>
            </>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
              icon={<ErrorOutline />}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batches List */}
      <Card
        sx={{
          border: `1px solid ${colors.border.light}`,
          background: colors.background.paper,
          borderRadius: '16px',
          boxShadow: isDark
            ? `0 8px 32px ${alpha('#000', 0.4)}`
            : `0 4px 24px ${alpha('#000', 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text.primary }}>
              Upload History
            </Typography>
            <Tooltip title="Refresh">
              <IconButton
                onClick={loadBatches}
                sx={{
                  color: colors.text.secondary,
                  '&:hover': { bgcolor: alpha(colors.primary.main, 0.1) },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {loadingBatches ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : batches.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <InsertDriveFile
                sx={{ fontSize: 64, color: colors.text.disabled, mb: 2 }}
              />
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                No uploads yet
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {batches.map((batch) => (
                <BatchListItem
                  key={batch.batchId}
                  batch={batch}
                  onView={setViewingBatchId}
                  onReprocess={handleReprocess}
                  onDelete={handleDelete}
                  onCancel={handleCancel}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Records Modal */}
      {viewingBatchId && (
        <RecordsModal
          batchId={viewingBatchId}
          onClose={() => setViewingBatchId(null)}
          isDark={isDark}
          colors={colors}
        />
      )}
    </PageContainer>
  );
};

export default RfidFileUploadPage;
