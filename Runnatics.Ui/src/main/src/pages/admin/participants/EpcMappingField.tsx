import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Chip as MuiChip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  keyframes,
} from '@mui/material';
import { CheckCircle2, Edit2, Lock, Nfc, Trash2, X as XIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BibMappingService } from '@/main/src/services/BibMappingService';
import {
  bibMappingKeys,
  EPC_MAX_LEN,
  EPC_MIN_LEN,
  isValidEpc,
  sanitizeEpc,
} from '../bibMapping/useBibMappingRows';
import DuplicateEpcDialog from '../bibMapping/DuplicateEpcDialog';
import { useBibMappingHub } from '@/main/src/hooks/useBibMappingHub';
import { extractErrorMessage } from '@/main/src/utils/errors';
import type { DuplicateInfo } from '../bibMapping/BibMapping.types';
import type { BibMappingResponse } from '@/main/src/models/bibMapping';

const pulseBlue = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
  50%      { box-shadow: 0 0 0 7px rgba(59,130,246,0); }
`;

type Mode = 'idle' | 'editing' | 'scanning';

interface EpcMappingFieldProps {
  participantId: string;
  bibNumber: string;
  participantName: string;
  raceId: string;
  eventId: string;
  onMappingChange?: () => void;
  hasRfidReadings?: boolean;
}

const EpcMappingField: React.FC<EpcMappingFieldProps> = ({
  participantId,
  bibNumber,
  participantName,
  raceId,
  eventId,
  onMappingChange,
  hasRfidReadings = false,
}) => {
  const queryClient = useQueryClient();

  const mappingsQuery = useQuery({
    queryKey: bibMappingKeys.byRace(raceId),
    queryFn: () => BibMappingService.getByRace(raceId),
    enabled: !!raceId,
  });

  const currentMapping = mappingsQuery.data?.find((m) => m.participantId === participantId);
  const currentEpc = currentMapping?.epc ?? '';
  const currentChipId = currentMapping?.chipId ?? '';
  const currentMappingEventId = currentMapping?.eventId ?? eventId;

  const [mode, setMode] = useState<Mode>('idle');
  const [pendingEpc, setPendingEpc] = useState('');
  const [epcError, setEpcError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [overriding, setOverriding] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { lastEpc, connectionStatus } = useBibMappingHub();
  const isConnected = connectionStatus === 'connected';

  // Focus the text input when entering edit mode
  useEffect(() => {
    if (mode !== 'editing') return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [mode]);

  const invalidateCache = useCallback(
    () => queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) }),
    [queryClient, raceId],
  );

  // Core save logic — accepts the EPC to save (supports both typed and scanned paths)
  const saveEpc = useCallback(
    async (epc: string): Promise<'ok' | 'duplicate' | 'error'> => {
      if (!isValidEpc(epc)) {
        setEpcError(`EPC must be ${EPC_MIN_LEN}–${EPC_MAX_LEN} hex characters`);
        return 'error';
      }

      if (epc === currentEpc) return 'ok';

      // Check for duplicate on a different participant
      const allMappings = mappingsQuery.data ?? [];
      const dupe = allMappings.find(
        (m: BibMappingResponse) =>
          m.epc.toUpperCase() === epc && m.participantId !== participantId,
      );
      if (dupe) {
        setDuplicateInfo({
          epc,
          newParticipantId: participantId,
          newBib: bibNumber,
          newName: participantName,
          existingParticipantId: dupe.participantId,
          existingBib: dupe.bibNumber,
          existingName: '',
          existingChipId: dupe.chipId,
          existingEventId: dupe.eventId,
        });
        return 'duplicate';
      }

      setSaving(true);
      setEpcError(null);
      try {
        if (currentChipId && currentMappingEventId) {
          await BibMappingService.delete({ chipId: currentChipId, participantId, eventId: currentMappingEventId });
        }
        await BibMappingService.create({ raceId, bibNumber, epc });
        await invalidateCache();
        toast.success(`EPC mapped for BIB #${bibNumber}`);
        setMode('idle');
        setPendingEpc('');
        onMappingChange?.();
        return 'ok';
      } catch (err: unknown) {
        const statusCode = (err as any)?.response?.status;
        if (statusCode === 409) {
          await invalidateCache();
          const fresh =
            queryClient.getQueryData<BibMappingResponse[]>(bibMappingKeys.byRace(raceId)) ?? [];
          const conflict = fresh.find(
            (m) => m.epc.toUpperCase() === epc && m.participantId !== participantId,
          );
          if (conflict) {
            setSaving(false);
            setDuplicateInfo({
              epc,
              newParticipantId: participantId,
              newBib: bibNumber,
              newName: participantName,
              existingParticipantId: conflict.participantId,
              existingBib: conflict.bibNumber,
              existingName: '',
              existingChipId: conflict.chipId,
              existingEventId: conflict.eventId,
            });
            return 'duplicate';
          }
        }
        const msg = extractErrorMessage(err, 'Failed to save EPC mapping');
        setEpcError(msg);
        toast.error(msg);
        return 'error';
      } finally {
        setSaving(false);
      }
    },
    [
      currentEpc, currentChipId, currentMappingEventId, mappingsQuery.data,
      participantId, bibNumber, participantName, raceId, eventId,
      queryClient, invalidateCache, onMappingChange,
    ],
  );

  // React to incoming RFID scans
  useEffect(() => {
    if (!lastEpc) return;
    const epc = sanitizeEpc(lastEpc);

    if (mode === 'scanning') {
      // Auto-save immediately when a chip is scanned in scanning mode
      saveEpc(epc).then((result) => {
        if (result === 'duplicate') {
          // Transition to edit mode so the user can see the duplicate dialog and the scanned value
          setPendingEpc(epc);
          setMode('editing');
        } else if (result === 'error') {
          // Drop into edit mode with the scanned value so the error is visible
          setPendingEpc(epc);
          setMode('editing');
        }
      });
    } else if (mode === 'editing') {
      // Auto-fill the text input but don't save — user confirms with Enter/button
      setPendingEpc(epc);
      setEpcError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEpc]);

  const handleEnterEditMode = () => {
    setPendingEpc(currentEpc);
    setEpcError(null);
    setMode('editing');
  };

  const handleEnterScanMode = () => {
    setEpcError(null);
    setPendingEpc('');
    setMode('scanning');
  };

  const handleCancel = () => {
    setMode('idle');
    setPendingEpc('');
    setEpcError(null);
  };

  const handleEpcChange = (value: string) => {
    setPendingEpc(sanitizeEpc(value));
    if (epcError) setEpcError(null);
  };

  const handleSaveTyped = async () => {
    await saveEpc(sanitizeEpc(pendingEpc));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSaveTyped(); }
    else if (e.key === 'Escape') handleCancel();
  };

  const handleClear = async () => {
    if (!currentChipId || !currentMappingEventId) return;
    setClearing(true);
    try {
      await BibMappingService.delete({ chipId: currentChipId, participantId, eventId: currentMappingEventId });
      await invalidateCache();
      toast.success(`Cleared EPC mapping for BIB #${bibNumber}`);
      onMappingChange?.();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to clear mapping'));
    } finally {
      setClearing(false);
    }
  };

  const handleDuplicateCancel = () => {
    setDuplicateInfo(null);
    if (mode !== 'editing') { setMode('idle'); setPendingEpc(''); }
  };

  const handleDuplicateKeepExisting = () => {
    setDuplicateInfo(null);
    setMode('idle');
    setPendingEpc('');
  };

  const handleDuplicateOverride = async () => {
    if (!duplicateInfo) return;
    setOverriding(true);
    try {
      if (duplicateInfo.existingChipId && duplicateInfo.existingEventId) {
        await BibMappingService.delete({
          chipId: duplicateInfo.existingChipId,
          participantId: duplicateInfo.existingParticipantId,
          eventId: duplicateInfo.existingEventId,
        });
      }
      if (currentChipId && currentMappingEventId) {
        await BibMappingService.delete({ chipId: currentChipId, participantId, eventId: currentMappingEventId });
      }
      await BibMappingService.create({ raceId, bibNumber, epc: duplicateInfo.epc });
      await invalidateCache();
      toast.success(`EPC moved from BIB #${duplicateInfo.existingBib} to BIB #${bibNumber}`);
      setDuplicateInfo(null);
      setMode('idle');
      setPendingEpc('');
      onMappingChange?.();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Override failed'));
    } finally {
      setOverriding(false);
    }
  };

  const connDotColor =
    connectionStatus === 'connected' ? '#22c55e'
    : connectionStatus === 'connecting' ? '#f59e0b'
    : '#9ca3af';

  const connLabel =
    connectionStatus === 'connected' ? 'RFID reader connected'
    : connectionStatus === 'connecting' ? 'RFID reader connecting…'
    : 'RFID reader disconnected';

  if (!raceId) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          EPC / Chip Mapping
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, fontStyle: 'italic' }}>
          Select a race to manage EPC mapping
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {/* Label row with RFID connection status */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            EPC / Chip Mapping
          </Typography>
          <Tooltip title={connLabel}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: connDotColor,
                flexShrink: 0,
                ...(connectionStatus === 'connected' && mode === 'scanning'
                  ? { animation: `${pulseBlue} 1.4s ease-in-out infinite` }
                  : {}),
              }}
            />
          </Tooltip>
          {connectionStatus !== 'disconnected' && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
              {connectionStatus === 'connected' ? 'Reader connected' : 'Connecting…'}
            </Typography>
          )}
        </Stack>

        {mappingsQuery.isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={14} />
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          </Stack>

        ) : mode === 'idle' ? (
          // ── Idle: show current EPC + action buttons ──────────────────────────
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {currentEpc ? (
              <MuiChip
                icon={<CheckCircle2 size={14} />}
                label={currentEpc}
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'monospace', letterSpacing: '0.04em', fontWeight: 600 }}
              />
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                Not mapped
              </Typography>
            )}

            {hasRfidReadings ? (
              <Tooltip title="EPC cannot be changed — RFID readings already exist for this participant">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', cursor: 'default' }}>
                  <Lock size={14} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                    Locked
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={currentEpc ? 'Edit EPC manually' : 'Type EPC manually'}>
                  <IconButton size="small" onClick={handleEnterEditMode}>
                    <Edit2 size={15} />
                  </IconButton>
                </Tooltip>

                {currentEpc && (
                  <Tooltip title="Clear mapping">
                    <IconButton size="small" color="error" onClick={handleClear} disabled={clearing}>
                      {clearing ? <CircularProgress size={15} /> : <Trash2 size={15} />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Scan button — only shown when RFID reader is connected */}
                {isConnected && (
                  <Tooltip title="Tap a chip on the RFID reader to map it automatically">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<Nfc size={14} />}
                      onClick={handleEnterScanMode}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 1.5,
                      }}
                    >
                      {currentEpc ? 'Scan New' : 'Scan Chip'}
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Stack>

        ) : mode === 'scanning' ? (
          // ── Scanning: waiting for RFID read ──────────────────────────────────
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.75,
                py: 1,
                borderRadius: 1.5,
                border: '1.5px solid',
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
                flex: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: '#3b82f6',
                  flexShrink: 0,
                  animation: `${pulseBlue} 1.4s ease-in-out infinite`,
                }}
              />
              {saving ? (
                <>
                  <CircularProgress size={14} />
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                    Saving…
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                  Waiting for chip scan…
                </Typography>
              )}
            </Box>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={handleCancel} disabled={saving}>
                <XIcon size={18} />
              </IconButton>
            </Tooltip>
          </Stack>

        ) : (
          // ── Editing: manual text input ────────────────────────────────────────
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              inputRef={inputRef}
              value={pendingEpc}
              onChange={(e) => handleEpcChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Scan chip or type ${EPC_MIN_LEN}–${EPC_MAX_LEN} hex chars`}
              size="small"
              sx={{ flex: 1 }}
              error={!!epcError}
              helperText={epcError ?? `${pendingEpc.length} / ${EPC_MAX_LEN} hex chars`}
              disabled={saving}
              inputProps={{
                maxLength: EPC_MAX_LEN,
                style: { fontFamily: 'monospace', letterSpacing: '0.05em' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title={connLabel}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: connDotColor,
                          flexShrink: 0,
                        }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Save (Enter)">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleSaveTyped}
                  disabled={saving || !pendingEpc}
                  sx={{ mt: 0.5 }}
                >
                  {saving ? <CircularProgress size={16} /> : <CheckCircle2 size={18} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel (Esc)">
              <IconButton size="small" onClick={handleCancel} disabled={saving} sx={{ mt: 0.5 }}>
                <XIcon size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      <DuplicateEpcDialog
        open={!!duplicateInfo}
        info={duplicateInfo}
        working={overriding}
        onCancel={handleDuplicateCancel}
        onKeepExisting={handleDuplicateKeepExisting}
        onOverride={handleDuplicateOverride}
      />
    </>
  );
};

export default EpcMappingField;
