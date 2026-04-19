import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
  keyframes,
} from '@mui/material';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  Keyboard,
  SkipForward,
  Search,
  Play,
  X as XIcon,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BibMappingProps,
  DuplicateInfo,
  MappingRow,
} from './BibMapping.types';
import {
  EPC_MAX_LEN,
  EPC_MIN_LEN,
  sanitizeEpc,
  useBibMappingRows,
} from './useBibMappingRows';
import InstructionsCard from './InstructionsCard';
import DuplicateEpcDialog from './DuplicateEpcDialog';
import ClearMappingDialog from './ClearMappingDialog';
import SessionFooter from './SessionFooter';
import { formatRelative } from './relativeTime';
import { extractErrorMessage } from '../../../utils/errors';

// Hard guard against any future code path that leaks a raw error object into
// state. React crashes with "Objects are not valid as a React child" (minified
// #31) if an object shows up in a text slot, so coerce to string at render time.
const asText = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v == null ? fallback : extractErrorMessage(v, fallback);

const SOUND_STORAGE_KEY = 'bibMapping.soundEnabled';

const flashGreen = keyframes`
  0%   { background-color: rgba(34,197,94,0.28); }
  100% { background-color: transparent; }
`;
const flashRed = keyframes`
  0%   { background-color: rgba(239,68,68,0.28); }
  100% { background-color: transparent; }
`;
const pulseBlue = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.55); }
  50%      { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
`;
const scalePop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  100% { transform: scale(1); }
`;

function beep() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
    osc.onended = () => ctx.close();
  } catch {
    // Audio permissions / unsupported — silently ignore.
  }
}

const BibMapping: React.FC<BibMappingProps> = ({ eventId, raceId }) => {
  const {
    rows,
    visibleRows,
    justMappedIds,
    errorFlashIds,
    isLoading,
    loadError,
    search,
    setSearch,
    setPendingEpc,
    submitEpc,
    skipRow,
    unskipRow,
    clearPendingEpc,
    clearMapping,
    overrideMapping,
    nextUnmappedId,
    progress,
    stats,
    incrementDuplicateAttempts,
  } = useBibMappingRows(eventId, raceId);

  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);

  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [nextFocusId, setNextFocusId] = useState<string | null>(null);

  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [overrideWorking, setOverrideWorking] = useState(false);
  const [clearTarget, setClearTarget] = useState<MappingRow | null>(null);
  const [clearWorking, setClearWorking] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  const registerInputRef = useCallback((participantId: string, el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(participantId, el);
    else inputRefs.current.delete(participantId);
  }, []);

  const registerRowRef = useCallback((participantId: string, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(participantId, el);
    else rowRefs.current.delete(participantId);
  }, []);

  // Focus & scroll a row's input into view.
  const focusAndScroll = useCallback((participantId: string) => {
    const el = inputRefs.current.get(participantId);
    if (el) {
      el.focus();
      el.select();
      const row = rowRefs.current.get(participantId);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // On first load, auto-focus the first unmapped row.
  const didInitialFocus = useRef(false);
  useEffect(() => {
    if (didInitialFocus.current) return;
    if (rows.length === 0) return;
    const firstId = nextUnmappedId(null);
    if (firstId) {
      setNextFocusId(firstId);
      didInitialFocus.current = true;
    }
  }, [rows, nextUnmappedId]);

  // Apply queued focus after DOM renders.
  useLayoutEffect(() => {
    if (!nextFocusId) return;
    const attemptId = nextFocusId;
    setNextFocusId(null);
    // Wait a frame so freshly-mapped rows get their disabled state before we attempt focus.
    requestAnimationFrame(() => focusAndScroll(attemptId));
  }, [nextFocusId, focusAndScroll]);

  // Global keyboard shortcuts: Esc → search, Ctrl+Shift+S → first unmapped.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        const id = nextUnmappedId(null);
        if (id) setNextFocusId(id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextUnmappedId]);

  const handleSubmit = useCallback(
    async (participantId: string) => {
      const row = rows.find((r) => r.participantId === participantId);
      if (!row) return;
      const result = await submitEpc(participantId);
      if (result.status === 'ok') {
        toast.success(`✓ BIB #${row.bibNumber} mapped to ${sanitizeEpc(row.pendingEpc)}`);
        if (soundEnabled) beep();
        if (result.nextId) setNextFocusId(result.nextId);
      } else if (result.status === 'duplicate') {
        incrementDuplicateAttempts();
        setDuplicate(result.duplicate);
      }
    },
    [rows, submitEpc, soundEnabled, incrementDuplicateAttempts],
  );

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>, participantId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSubmit(participantId);
    }
  };

  const handleSkip = (participantId: string) => {
    skipRow(participantId);
    const nextId = nextUnmappedId(participantId);
    if (nextId) setNextFocusId(nextId);
  };

  const handleStartMapping = () => {
    const id = nextUnmappedId(null);
    if (id) setNextFocusId(id);
  };

  const handleOverride = async () => {
    if (!duplicate) return;
    setOverrideWorking(true);
    const result = await overrideMapping(duplicate);
    setOverrideWorking(false);
    setDuplicate(null);
    if (result.ok) {
      if (soundEnabled) beep();
      if (result.nextId) setNextFocusId(result.nextId);
    }
  };

  const handleKeepExisting = () => {
    if (!duplicate) return;
    clearPendingEpc(duplicate.newParticipantId);
    setNextFocusId(duplicate.existingParticipantId);
    setDuplicate(null);
  };

  const handleCancelDuplicate = () => {
    if (!duplicate) return;
    clearPendingEpc(duplicate.newParticipantId);
    // Keep focus on the current row so the user can rescan.
    const id = duplicate.newParticipantId;
    setDuplicate(null);
    setNextFocusId(id);
  };

  const handleClearRequest = (row: MappingRow) => setClearTarget(row);
  const handleClearConfirm = async () => {
    if (!clearTarget) return;
    setClearWorking(true);
    const ok = await clearMapping(clearTarget.participantId);
    setClearWorking(false);
    if (ok) setClearTarget(null);
  };

  const scanReady = focusedRowId !== null;
  const allMapped = progress.total > 0 && progress.mapped === progress.total;

  const focusedRow = useMemo(
    () => (focusedRowId ? rows.find((r) => r.participantId === focusedRowId) : null),
    [focusedRowId, rows],
  );

  const statusLabel = allMapped
    ? 'All mapped'
    : scanReady && focusedRow
      ? `Scanning BIB #${focusedRow.bibNumber}`
      : progress.mapped > 0
        ? 'Ready to resume'
        : 'Ready';

  const startButtonLabel = allMapped
    ? 'All BIBs mapped ✓'
    : progress.mapped > 0
      ? 'Resume Mapping'
      : 'Start Mapping';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Instructions (collapsible, localStorage-persisted) */}
      <InstructionsCard />

      {/* Scan mode + Start/Resume + progress */}
      <Paper sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={handleStartMapping}
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Play size={18} />}
            disabled={allMapped || progress.total === 0}
          >
            {startButtonLabel}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: scanReady ? '#3b82f6' : '#9ca3af',
                animation: scanReady ? `${pulseBlue} 1.4s ease-out infinite` : 'none',
              }}
            />
            <Typography variant="body1" fontWeight={600}>
              {statusLabel}
            </Typography>
            <Tooltip title="Reader connected as USB keyboard">
              <Box sx={{ display: 'inline-flex', color: 'text.secondary' }}>
                <Keyboard size={18} />
              </Box>
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="body2" color="text.secondary">
              Mapped {progress.mapped} of {progress.total} BIBs ({progress.percent}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={{ mt: 0.75, height: 8, borderRadius: 4 }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                icon={<VolumeX size={18} />}
                checkedIcon={<Volume2 size={18} />}
              />
            }
            label={<Typography variant="body2">Sound</Typography>}
          />
        </Box>
      </Paper>

      {/* Search */}
      <TextField
        inputRef={searchRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by BIB or name…"
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, color: 'text.secondary' }}>
                <Search size={18} />
              </Box>
            ),
          },
        }}
      />

      {/* Table */}
      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {loadError && !isLoading && (
          <Alert severity="error" sx={{ m: 2 }}>{asText(loadError, 'Failed to load mappings')}</Alert>
        )}

        {!isLoading && !loadError && rows.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
            No participants found for this race.
          </Typography>
        )}

        {!isLoading && !loadError && rows.length > 0 && (
          <Box component="table" sx={tableStyle}>
            <Box component="thead">
              <Box component="tr" sx={theadRowStyle}>
                <Box component="th" sx={{ ...thStyle, width: 120 }}>BIB</Box>
                <Box component="th" sx={thStyle}>Participant</Box>
                <Box component="th" sx={{ ...thStyle, width: 360 }}>EPC</Box>
                <Box component="th" sx={{ ...thStyle, width: 180 }}>Status</Box>
                <Box component="th" sx={{ ...thStyle, width: 120, textAlign: 'right' }}>Action</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {visibleRows.map((row) => (
                <Row
                  key={row.participantId}
                  row={row}
                  isFocused={focusedRowId === row.participantId}
                  justMapped={justMappedIds.has(row.participantId)}
                  errorFlash={errorFlashIds.has(row.participantId)}
                  onFocus={() => setFocusedRowId(row.participantId)}
                  onBlur={() => setFocusedRowId((prev) => (prev === row.participantId ? null : prev))}
                  onChangeEpc={(val) => setPendingEpc(row.participantId, val)}
                  onKeyDown={(e) => handleKeyDown(e, row.participantId)}
                  onSkip={() => handleSkip(row.participantId)}
                  onUnskip={() => unskipRow(row.participantId)}
                  onClear={() => handleClearRequest(row)}
                  registerInput={(el) => registerInputRef(row.participantId, el)}
                  registerRow={(el) => registerRowRef(row.participantId, el)}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Session footer */}
      <SessionFooter rows={rows} stats={stats} progress={progress} raceId={raceId} />

      <DuplicateEpcDialog
        open={!!duplicate}
        info={duplicate}
        working={overrideWorking}
        onCancel={handleCancelDuplicate}
        onKeepExisting={handleKeepExisting}
        onOverride={handleOverride}
      />

      <ClearMappingDialog
        open={!!clearTarget}
        bibNumber={clearTarget?.bibNumber ?? ''}
        working={clearWorking}
        onCancel={() => setClearTarget(null)}
        onConfirm={handleClearConfirm}
      />
    </Box>
  );
};

interface RowProps {
  row: MappingRow;
  isFocused: boolean;
  justMapped: boolean;
  errorFlash: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChangeEpc: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSkip: () => void;
  onUnskip: () => void;
  onClear: () => void;
  registerInput: (el: HTMLInputElement | null) => void;
  registerRow: (el: HTMLTableRowElement | null) => void;
}

const Row: React.FC<RowProps> = ({
  row,
  isFocused,
  justMapped,
  errorFlash,
  onFocus,
  onBlur,
  onChangeEpc,
  onKeyDown,
  onSkip,
  onUnskip,
  onClear,
  registerInput,
  registerRow,
}) => {
  const isMapped = row.status === 'mapped';
  const isSaving = row.status === 'saving';
  const isError = row.status === 'error';
  const isSkipped = row.status === 'skipped';
  const displayedEpc = isMapped ? row.epc : row.pendingEpc;

  const rowSx: any = {
    borderBottom: '1px solid',
    borderColor: 'divider',
    backgroundColor: isFocused ? 'action.hover' : 'transparent',
    transition: 'background-color 0.15s',
  };
  if (isSkipped) {
    rowSx.opacity = 0.6;
    rowSx.border = '1px dashed';
    rowSx.borderColor = 'divider';
    rowSx.backgroundColor = 'action.disabledBackground';
  }
  if (justMapped) rowSx.animation = `${flashGreen} 650ms ease-out`;
  if (errorFlash) rowSx.animation = `${flashRed} 650ms ease-out`;

  return (
    <Box component="tr" ref={registerRow} sx={rowSx}>
      <Box component="td" sx={tdStyle}>
        <Typography variant="body1" fontWeight={700}>{row.bibNumber}</Typography>
      </Box>
      <Box component="td" sx={tdStyle}>
        <Typography variant="body2">{row.name || '—'}</Typography>
      </Box>
      <Box component="td" sx={tdStyle}>
        <TextField
          inputRef={registerInput}
          value={displayedEpc}
          onChange={(e) => onChangeEpc(sanitizeEpc(e.target.value))}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={isMapped || isSaving || isSkipped}
          size="small"
          fullWidth
          autoComplete="off"
          spellCheck={false}
          placeholder={isMapped ? '' : `Scan chip or type ${EPC_MIN_LEN}–${EPC_MAX_LEN} hex chars`}
          error={isError}
          helperText={isError ? asText(row.errorMessage, 'Error') : ' '}
          slotProps={{
            htmlInput: {
              style: { fontFamily: 'monospace', letterSpacing: 0.5 },
              maxLength: EPC_MAX_LEN,
            },
          }}
        />
      </Box>
      <Box component="td" sx={tdStyle}>
        <StatusCell row={row} isFocused={isFocused} justMapped={justMapped} />
      </Box>
      <Box component="td" sx={{ ...tdStyle, textAlign: 'right' }}>
        {isMapped && (
          <Tooltip title="Clear this mapping">
            <IconButton size="small" color="default" onClick={onClear}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        )}
        {!isMapped && !isSkipped && (
          <Tooltip title="Skip this BIB (e.g. bad chip)">
            <span>
              <IconButton size="small" onClick={onSkip} disabled={isSaving}>
                <SkipForward size={18} />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {isSkipped && (
          <Button size="small" variant="text" onClick={onUnskip}>
            Unskip
          </Button>
        )}
      </Box>
    </Box>
  );
};

const StatusCell: React.FC<{ row: MappingRow; isFocused: boolean; justMapped: boolean }> = ({
  row,
  isFocused,
  justMapped,
}) => {
  if (row.status === 'mapped') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box
          sx={{
            color: '#22c55e',
            display: 'inline-flex',
            animation: justMapped ? `${scalePop} 600ms ease-out` : 'none',
          }}
        >
          <CheckCircle2 size={20} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }}>
            {justMapped ? 'Just mapped' : row.createdAt ? `Mapped ${formatRelative(row.createdAt)}` : 'Mapped'}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (row.status === 'saving') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <CircularProgress size={14} />
        <Typography variant="caption">Saving…</Typography>
      </Box>
    );
  }

  if (row.status === 'error') {
    return (
      <Tooltip title={asText(row.errorMessage, 'Error')}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: '#ef4444' }}>
          <AlertCircle size={18} />
          <Typography variant="caption" color="error">Error</Typography>
        </Box>
      </Tooltip>
    );
  }

  if (row.status === 'skipped') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.disabled' }}>
        <XIcon size={16} />
        <Typography variant="caption">Skipped</Typography>
      </Box>
    );
  }

  // unmapped
  if (isFocused) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: `${pulseBlue} 1.4s ease-out infinite`,
          }}
        />
        <Typography variant="caption" color="primary" fontWeight={600}>Ready to scan</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'action.disabled' }} />
      <Typography variant="caption" color="text.secondary">Not mapped</Typography>
    </Box>
  );
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const theadRowStyle = {
  backgroundColor: 'background.default',
  borderBottom: '2px solid',
  borderColor: 'divider',
};

const thStyle = {
  py: 1.25,
  px: 2,
  textAlign: 'left' as const,
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
};

const tdStyle = {
  py: 1.25,
  px: 2,
  verticalAlign: 'middle' as const,
};

export default BibMapping;
