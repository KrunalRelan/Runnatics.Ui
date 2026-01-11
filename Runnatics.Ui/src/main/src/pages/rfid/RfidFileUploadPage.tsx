import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import { Upload, RefreshCw, AlertCircle, X } from 'lucide-react';
import { UploadProgress } from '../../components/rfid/UploadProgress';
import { BatchListItem } from '../../components/rfid/BatchListItem';
import { RecordsModal } from '../../components/rfid/RecordsModal';
import { FileUploadStatusDto, FileUploadRecordDto } from '../../models/FileUpload';
import config from '../../config/environment';

const API_BASE_URL = config.apiBaseUrl;

interface Checkpoint {
  id: string;
  name: string;
  distance?: number;
  distanceUnit?: string;
  sequenceNumber: number;
}

export const RfidFileUploadPage: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('');
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedCheckpoints = useRef(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  
  const [batches, setBatches] = useState<FileUploadStatusDto[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  
  const [selectedBatch, setSelectedBatch] = useState<FileUploadStatusDto | null>(null);
  const [records, setRecords] = useState<FileUploadRecordDto[]>([]);
  const [showRecordsModal, setShowRecordsModal] = useState(false);

  // Load checkpoints on mount
  useEffect(() => {
    if (eventId && raceId && !hasLoadedCheckpoints.current) {
      hasLoadedCheckpoints.current = true;
      loadCheckpoints();
      // TODO: Enable when backend batches endpoint is configured for this raceId format
      // loadBatches();
    }
  }, [eventId, raceId]);

  const loadCheckpoints = async () => {
    try {
      setLoadingCheckpoints(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/Checkpoints/${eventId}/${raceId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Failed to load checkpoints');
      
      const data = await response.json();
      console.log('Checkpoint API response:', data);
      
      // Try multiple possible response structures
      let checkpointList = [];
      if (data.message?.items) {
        checkpointList = data.message.items;
      } else if (data.message) {
        checkpointList = Array.isArray(data.message) ? data.message : [];
      } else if (Array.isArray(data)) {
        checkpointList = data;
      }
      
      console.log('Parsed checkpoints:', checkpointList);
      
      const sortedCheckpoints = checkpointList.sort((a: Checkpoint, b: Checkpoint) => 
        a.sequenceNumber - b.sequenceNumber
      );
      
      setCheckpoints(sortedCheckpoints);
      
      if (sortedCheckpoints.length > 0) {
        setSelectedCheckpoint(sortedCheckpoints[0].id);
      }
    } catch (error) {
      console.error('Error loading checkpoints:', error);
    } finally {
      setLoadingCheckpoints(false);
    }
  };

  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/FileUpload/race/${raceId}/batches`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Batches API error:', response.status, errorText);
        throw new Error(`Failed to load batches: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Batches API response:', data);
      
      // Handle different response structures
      if (data.message?.items) {
        setBatches(data.message.items);
      } else if (Array.isArray(data.message)) {
        setBatches(data.message);
      } else if (Array.isArray(data)) {
        setBatches(data);
      } else {
        setBatches([]);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      // Don't fail silently - batches is optional, just show empty
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedCheckpoint) {
      alert('Please select a checkpoint first');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setCurrentFileName(file.name);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('raceId', raceId!);
        formData.append('eventId', eventId!);
        formData.append('checkpointId', selectedCheckpoint);

        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/FileUpload/upload`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setCurrentFileName('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    loadBatches();
  };

  const handleViewRecords = async (batch: FileUploadStatusDto) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batch.id}/records`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Failed to load records');
      
      const data = await response.json();
      setRecords(data);
      setSelectedBatch(batch);
      setShowRecordsModal(true);
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Delete failed');
      
      loadBatches();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete batch');
    }
  };

  if (!eventId || !raceId) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
        <Box textAlign="center">
          <AlertCircle style={{ width: 48, height: 48, color: '#f44336', margin: '0 auto 16px' }} />
          <Typography color="text.secondary">Invalid event or race ID</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          RFID File Upload
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload RFID read files for offline data import
        </Typography>
      </Box>

      {/* Checkpoint Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth disabled={loadingCheckpoints}>
          <InputLabel id="checkpoint-label">
            Select Checkpoint <span style={{ color: '#f44336' }}>*</span>
          </InputLabel>
          
          <Select
            labelId="checkpoint-label"
            value={selectedCheckpoint}
            onChange={(e) => setSelectedCheckpoint(e.target.value)}
            label="Select Checkpoint *"
            disabled={loadingCheckpoints}
          >
            {loadingCheckpoints ? [
              <MenuItem key="loading" value="">
                <em>Loading checkpoints...</em>
              </MenuItem>
            ] : checkpoints.length === 0 ? [
              <MenuItem key="empty" value="">
                <em>No checkpoints available - please create checkpoints first</em>
              </MenuItem>
            ] : [
              <MenuItem key="placeholder" value="">
                <em>Select a checkpoint...</em>
              </MenuItem>,
              ...checkpoints.map(cp => (
                <MenuItem key={cp.id} value={cp.id}>
                  {cp.sequenceNumber}. {cp.name}
                  {cp.distance && ` (${cp.distance} ${cp.distanceUnit || 'km'})`}
                </MenuItem>
              ))
            ]}
          </Select>
        </FormControl>
        
        {!loadingCheckpoints && checkpoints.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No checkpoints configured for this race. Please create checkpoints first.
          </Alert>
        )}
      </Paper>

      {/* File Upload Zone */}
      {!uploading && checkpoints.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Files
          </Typography>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload-input"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <label htmlFor="file-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={20} />}
                disabled={!selectedCheckpoint}
              >
                Choose Files
              </Button>
            </label>
            
            {selectedFiles.length > 0 && (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedCheckpoint}
                startIcon={<Upload size={20} />}
              >
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            )}
          </Box>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Files:
              </Typography>
              <List dense>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)} size="small">
                        <X size={16} />
                      </IconButton>
                    }
                    sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {!selectedCheckpoint && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please select a checkpoint before choosing files
            </Alert>
          )}
        </Paper>
      )}

      {/* Upload Progress */}
      {uploading && (
        <UploadProgress 
          progress={uploadProgress}
          fileName={currentFileName}
          status="uploading"
        />
      )}

      {/* Batches List */}
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="600">
            Upload History
          </Typography>
          <Button
            size="small"
            startIcon={loadingBatches ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
            onClick={loadBatches}
            disabled={loadingBatches}
          >
            {loadingBatches ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>

        {batches.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Upload style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.5 }} />
            <Typography color="text.secondary">No uploads yet</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {batches.map(batch => (
              <BatchListItem
                key={batch.id}
                batch={batch}
                onViewDetails={() => handleViewRecords(batch)}
                onDelete={() => handleDeleteBatch(batch.id)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Records Modal */}
      {showRecordsModal && selectedBatch && (
        <RecordsModal
          fileName={selectedBatch.fileName}
          records={records}
          onClose={() => {
            setShowRecordsModal(false);
            setSelectedBatch(null);
            setRecords([]);
          }}
        />
      )}
    </Box>
  );
};

export default RfidFileUploadPage;
