import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Slider,
  Collapse,
  CircularProgress,
  LinearProgress,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import config from '../../../config/environment';
import { useSimulator } from './useSimulator';
import { useQueryClient } from '@tanstack/react-query';
import { bibMappingKeys } from './useBibMapping';

interface SimulatorPanelProps {
  raceId: string;
}

const PRESET_CONFIGS = [
  { label: 'Map 5 BIBs', start: 1001, count: 5 },
  { label: 'Map 10 BIBs', start: 2001, count: 10 },
  { label: 'Map 20 BIBs', start: 3001, count: 20 },
] as const;

const SimulatorPanel: React.FC<SimulatorPanelProps> = ({ raceId }) => {
  if (!config.isDevelopment) return null;

  const queryClient = useQueryClient();
  const {
    mode,
    setMode,
    isRunning,
    progress,
    results,
    delayMs,
    setDelayMs,
    simulateSingle,
    startBulk,
    stop,
    clearResults,
    parseCsvInput,
    generateEpc,
  } = useSimulator(raceId);

  const [show, setShow] = useState(false);

  // Single mode state
  const [singleBib, setSingleBib] = useState('1001');
  const [singleEpc, setSingleEpc] = useState(() => generateEpc());

  // Bulk mode state
  const [csvInput, setCsvInput] = useState('');

  const handleSingleSimulate = async () => {
    if (!singleBib.trim() || !singleEpc.trim()) return;
    await simulateSingle(singleBib.trim(), singleEpc.trim());
    // Auto-increment BIB and generate new EPC for next round
    const nextBib = String(parseInt(singleBib, 10) + 1 || singleBib);
    setSingleBib(nextBib);
    setSingleEpc(generateEpc());
  };

  const handleBulkStart = () => {
    const rows = parseCsvInput(csvInput);
    if (rows.length === 0) return;
    startBulk(rows);
  };

  const handlePreset = (start: number, count: number) => {
    const rows = Array.from({ length: count }, (_, i) => ({
      bibNumber: String(start + i),
    }));
    startBulk(rows);
  };

  const handleClearAll = async () => {
    // Placeholder: if your backend adds a bulk-delete endpoint, wire it here
    // For now just clear the results log
    clearResults();
    queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
  };

  const tabIndex = mode === 'single' ? 0 : mode === 'bulk' ? 1 : 2;
  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    const modes: Array<'single' | 'bulk' | 'presets'> = ['single', 'bulk', 'presets'];
    setMode(modes[value]);
  };

  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: 'warning.light',
        borderRadius: 2,
        backgroundColor: 'rgba(255, 193, 7, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Toggle Header */}
      <Box
        onClick={() => setShow(!show)}
        sx={{
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': { backgroundColor: 'rgba(255, 193, 7, 0.08)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark', fontSize: '0.85rem' }}>
            {'\u{1F9EA}'} Simulator
          </Typography>
          <Chip
            label="DEV ONLY"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              backgroundColor: 'warning.light',
              color: 'warning.contrastText',
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {show ? 'collapse' : 'expand'}
        </Typography>
      </Box>

      <Collapse in={show}>
        <Box sx={{ px: 2, pb: 2 }}>
          {/* Mode Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              minHeight: 36,
              mb: 2,
              '& .MuiTab-root': { minHeight: 36, fontSize: '0.75rem', textTransform: 'none', py: 0 },
            }}
          >
            <Tab label="Single" />
            <Tab label="Bulk" />
            <Tab label="Presets" />
          </Tabs>

          {/* ─── MODE 1: Single ─── */}
          {mode === 'single' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="BIB Number"
                  value={singleBib}
                  onChange={(e) => setSingleBib(e.target.value)}
                  sx={{ width: 120, '& input': { fontSize: '0.85rem' } }}
                />
                <TextField
                  size="small"
                  label="EPC"
                  value={singleEpc}
                  onChange={(e) => setSingleEpc(e.target.value)}
                  sx={{ flex: 1, minWidth: 180, '& input': { fontSize: '0.8rem', fontFamily: 'monospace' } }}
                />
                <Button
                  size="small"
                  variant="text"
                  color="warning"
                  onClick={() => setSingleEpc(generateEpc())}
                  sx={{ fontSize: '0.7rem', textTransform: 'none', minWidth: 0 }}
                >
                  Generate
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  disabled={isRunning || !singleBib.trim() || !singleEpc.trim()}
                  onClick={handleSingleSimulate}
                  sx={{ fontSize: '0.75rem', textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {isRunning ? <CircularProgress size={16} /> : 'Simulate & Map'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ─── MODE 2: Bulk ─── */}
          {mode === 'bulk' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                multiline
                rows={5}
                size="small"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={
                  'Paste CSV (BibNumber,EPC) or just BIB numbers:\n\nBibNumber,EPC\n2720,418000AA068D\n2721,418000BB12F4\n\nOr just BIBs (EPCs auto-generated):\n2720\n2721\n2722'
                }
                sx={{ '& textarea': { fontSize: '0.8rem', fontFamily: 'monospace' } }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ flex: '0 0 200px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Delay between mappings: {delayMs}ms
                  </Typography>
                  <Slider
                    value={delayMs}
                    onChange={(_, val) => setDelayMs(val as number)}
                    min={500}
                    max={3000}
                    step={100}
                    size="small"
                    disabled={isRunning}
                    sx={{ color: 'warning.main', py: 0 }}
                  />
                </Box>
                {!isRunning ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={!csvInput.trim()}
                    onClick={handleBulkStart}
                    sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Start Bulk Mapping
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={stop}
                    sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Stop
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* ─── MODE 3: Presets ─── */}
          {mode === 'presets' && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PRESET_CONFIGS.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  color="warning"
                  disabled={isRunning}
                  onClick={() => handlePreset(preset.start, preset.count)}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={isRunning}
                onClick={handleClearAll}
                sx={{ fontSize: '0.75rem', textTransform: 'none' }}
              >
                Clear All
              </Button>
              {isRunning && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={stop}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  Stop
                </Button>
              )}
            </Box>
          )}

          {/* ─── Progress Bar ─── */}
          {progress.total > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {isRunning ? 'Running...' : 'Complete'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {progress.current} / {progress.total} mapped
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(progress.current / progress.total) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 193, 7, 0.15)',
                  '& .MuiLinearProgress-bar': { backgroundColor: 'warning.main' },
                }}
              />
            </Box>
          )}

          {/* ─── Results Log ─── */}
          {results.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Log ({results.length} entries)
                </Typography>
                <Button
                  size="small"
                  onClick={clearResults}
                  disabled={isRunning}
                  sx={{ fontSize: '0.65rem', textTransform: 'none', minWidth: 0, p: 0 }}
                >
                  Clear
                </Button>
              </Box>
              <Box
                sx={{
                  maxHeight: 160,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: 'background.default',
                }}
              >
                {results.map((r, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color:
                        r.status === 'success'
                          ? 'success.main'
                          : r.status === 'error'
                          ? 'error.main'
                          : 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {r.status === 'success' && '\u2713'}{r.status === 'error' && '\u2717'}{r.status === 'pending' && '\u23F3'}{' '}
                    {r.message}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SimulatorPanel;
