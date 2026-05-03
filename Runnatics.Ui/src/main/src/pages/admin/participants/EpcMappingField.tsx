import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Chip as MuiChip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle2, Edit2, Trash2, X as XIcon } from 'lucide-react';
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

interface EpcMappingFieldProps {
  participantId: string;
  bibNumber: string;
  participantName: string;
  raceId: string;
  eventId: string;
  onMappingChange?: () => void;
}

const EpcMappingField: React.FC<EpcMappingFieldProps> = ({
  participantId,
  bibNumber,
  participantName,
  raceId,
  eventId,
  onMappingChange,
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

  const [isEditing, setIsEditing] = useState(false);
  const [pendingEpc, setPendingEpc] = useState('');
  const [epcError, setEpcError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [overriding, setOverriding] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { lastEpc, connectionStatus } = useBibMappingHub();

  // Auto-fill input from RFID scanner when in edit mode
  useEffect(() => {
    if (!isEditing || !lastEpc) return;
    setPendingEpc(sanitizeEpc(lastEpc));
    setEpcError(null);
  }, [lastEpc, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (!isEditing) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isEditing]);

  const invalidateCache = () =>
    queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });

  const handleEnterEditMode = () => {
    setPendingEpc(currentEpc);
    setEpcError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingEpc('');
    setEpcError(null);
  };

  const handleEpcChange = (value: string) => {
    setPendingEpc(sanitizeEpc(value));
    if (epcError) setEpcError(null);
  };

  const handleSave = async () => {
    const epc = sanitizeEpc(pendingEpc);

    if (!isValidEpc(epc)) {
      setEpcError(`EPC must be ${EPC_MIN_LEN}–${EPC_MAX_LEN} hex characters`);
      return;
    }

    // No change — just close edit mode
    if (epc === currentEpc) {
      setIsEditing(false);
      return;
    }

    // Check for duplicate mapping on a different participant
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
      return;
    }

    setSaving(true);
    setEpcError(null);
    try {
      // Remove existing mapping for this participant first (if any)
      if (currentChipId && currentMappingEventId) {
        await BibMappingService.delete({ chipId: currentChipId, participantId, eventId: currentMappingEventId });
      }
      await BibMappingService.create({ raceId, bibNumber, epc });
      await invalidateCache();
      toast.success(`EPC mapped for BIB #${bibNumber}`);
      setIsEditing(false);
      setPendingEpc('');
      onMappingChange?.();
    } catch (err: unknown) {
      const statusCode = (err as any)?.response?.status;
      // Handle 409 race condition — refresh and show duplicate dialog
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
          return;
        }
      }
      const msg = extractErrorMessage(err, 'Failed to save EPC mapping');
      setEpcError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDuplicateCancel = () => setDuplicateInfo(null);

  const handleDuplicateKeepExisting = () => {
    setDuplicateInfo(null);
    setPendingEpc('');
    setIsEditing(false);
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
      setIsEditing(false);
      setPendingEpc('');
      onMappingChange?.();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Override failed'));
    } finally {
      setOverriding(false);
    }
  };

  const connDotColor =
    connectionStatus === 'connected'
      ? 'success.main'
      : connectionStatus === 'connecting'
      ? 'warning.main'
      : 'text.disabled';

  const connDotTitle =
    connectionStatus === 'connected'
      ? 'RFID reader connected'
      : connectionStatus === 'connecting'
      ? 'RFID reader connecting…'
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, display: 'block', mb: 0.75 }}
        >
          EPC / Chip Mapping
        </Typography>

        {mappingsQuery.isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={14} />
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          </Stack>
        ) : !isEditing ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {currentEpc ? (
              <>
                <MuiChip
                  icon={<CheckCircle2 size={14} />}
                  label={currentEpc}
                  color="success"
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', letterSpacing: '0.04em', fontWeight: 600 }}
                />
                <Tooltip title="Edit EPC">
                  <IconButton size="small" onClick={handleEnterEditMode}>
                    <Edit2 size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear mapping">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleClear}
                    disabled={clearing}
                  >
                    {clearing ? <CircularProgress size={15} /> : <Trash2 size={15} />}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Not mapped
                </Typography>
                <Tooltip title="Map EPC">
                  <IconButton size="small" onClick={handleEnterEditMode}>
                    <Edit2 size={15} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        ) : (
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
                    <Tooltip title={connDotTitle}>
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
                  onClick={handleSave}
                  disabled={saving || !pendingEpc}
                  sx={{ mt: 0.5 }}
                >
                  {saving ? <CircularProgress size={16} /> : <CheckCircle2 size={18} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel (Esc)">
              <IconButton size="small" onClick={handleCancelEdit} disabled={saving} sx={{ mt: 0.5 }}>
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
