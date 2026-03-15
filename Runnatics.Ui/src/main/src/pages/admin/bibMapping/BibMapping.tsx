import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { BibMappingProps } from './BibMapping.types';
import { useBibMapping } from './useBibMapping';
import SimulatorPanel from './SimulatorPanel';
import type { DeleteBibMappingParams } from '../../../models/bibMapping';
import config from '../../../config/environment';

const BibMapping: React.FC<BibMappingProps> = ({ raceId }) => {
  const {
    mappings,
    isLoadingMappings,
    mappingsError,
    bibInput,
    setBibInput,
    pendingEpc,
    lastRssi,
    connectionStatus,
    handleSave,
    handleClear,
    handleDelete,
    isSaving,
    isDeleting,
  } = useBibMapping(raceId);

  const bibInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteBibMappingParams | null>(null);

  // Auto-focus BIB input when EPC is detected
  useEffect(() => {
    if (pendingEpc) {
      bibInputRef.current?.focus();
    }
  }, [pendingEpc]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const confirmDelete = (params: DeleteBibMappingParams) => {
    setDeleteConfirm(params);
  };

  const executeDelete = () => {
    if (deleteConfirm) {
      handleDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const canSave = !!pendingEpc && !!bibInput.trim() && !isSaving;

  // RSSI signal strength (0-4 bars)
  const rssiLevel = lastRssi != null ? Math.min(4, Math.max(0, Math.round((lastRssi + 80) / 15))) : 0;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ─── TOP: Reader Status Bar ─── */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#f44336',
            boxShadow: connectionStatus === 'connected'
              ? '0 0 8px rgba(76, 175, 80, 0.6)'
              : '0 0 8px rgba(244, 67, 54, 0.6)',
          }}
        />
        <Typography variant="body1" fontWeight={500}>
          {connectionStatus === 'connected' && 'Reader Connected'}
          {connectionStatus === 'connecting' && 'Connecting to Reader...'}
          {connectionStatus === 'disconnected' && 'Reader Disconnected'}
        </Typography>
      </Paper>

      {/* ─── MIDDLE: Active Mapping Panel ─── */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Map Chip to BIB
        </Typography>

        {/* EPC Display */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: pendingEpc ? 'action.selected' : 'action.hover',
            textAlign: 'center',
            minHeight: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!pendingEpc ? (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              Waiting for chip...
            </Typography>
          ) : (
            <>
              <Typography
                variant="h4"
                sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, mb: 1 }}
              >
                {pendingEpc}
              </Typography>
              {lastRssi != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {[1, 2, 3, 4].map((bar) => (
                    <Box
                      key={bar}
                      sx={{
                        width: 6,
                        height: 6 + bar * 4,
                        borderRadius: 1,
                        backgroundColor: bar <= rssiLevel ? '#4caf50' : 'divider',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {lastRssi} dBm
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* BIB Input + Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            inputRef={bibInputRef}
            label="BIB Number"
            value={bibInput}
            onChange={(e) => setBibInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!pendingEpc}
            fullWidth
            autoComplete="off"
            placeholder={pendingEpc ? 'Type BIB number and press Enter' : 'Scan a chip first'}
            slotProps={{
              htmlInput: { style: { fontSize: '1.25rem' } },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave}
            sx={{ minWidth: 100, height: 56 }}
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={!pendingEpc && !bibInput}
            sx={{ minWidth: 80, height: 56 }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {/* ─── BOTTOM: Mapping History Table ─── */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Mapping History</Typography>
          <Chip
            label={`${mappings.length} chip${mappings.length !== 1 ? 's' : ''} mapped`}
            size="small"
            variant="outlined"
          />
        </Box>

        {isLoadingMappings && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {mappingsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mappingsError}
          </Alert>
        )}

        {!isLoadingMappings && mappings.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No mappings yet. Scan a chip to get started.
          </Typography>
        )}

        {!isLoadingMappings && mappings.length > 0 && (
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2">BIB Number</Typography>
                </Box>
                <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2">EPC</Typography>
                </Box>
                <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2">Time</Typography>
                </Box>
                <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'right', width: 60 }}>
                  <Typography variant="subtitle2">Delete</Typography>
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[...mappings]
                .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
                .map((mapping, index) => (
                  <Box
                    component="tr"
                    key={mapping.id || `mapping-${index}`}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {mapping.bibNumber}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {mapping.epc}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(mapping.createdAt).format('HH:mm:ss')}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1, px: 2, textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => confirmDelete({
                          chipId: mapping.chipId,
                          participantId: mapping.participantId,
                          eventId: mapping.eventId,
                        })}
                        disabled={isDeleting}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* ─── DEV: Simulator Panel ─── */}
      {config.isDevelopment && (
        <SimulatorPanel raceId={raceId} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Mapping</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this BIB mapping? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={executeDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BibMapping;
