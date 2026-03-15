// ============================================================================
// File: pages/admin/races/RaceDashboard.tsx
// Purpose: Live race dashboard with reader control and real-time RFID crossings.
//          Integrates with SignalR (useRaceHub) and race control API (useRaceControl).
// ============================================================================

import React, { useState } from 'react';
import { useRaceHub, CheckpointCrossing } from '../../../hooks/useRaceHub';
import { useRaceControl, ReaderStatus } from '../../../hooks/useRaceControl';

interface RaceDashboardProps {
  raceId: number;
  raceName: string;
  webhookBaseUrl: string; // e.g., "https://api.yourdomain.com"
}

export const RaceDashboard: React.FC<RaceDashboardProps> = ({
  raceId,
  raceName,
  webhookBaseUrl,
}) => {
  // ── SignalR real-time data ──
  const {
    crossings,
    readerStatuses: liveReaderStatuses,
    isConnected,
    connectionError,
    clearCrossings,
  } = useRaceHub(raceId);

  // ── API control ──
  const {
    prepareRace,
    startRace,
    stopRace,
    getReaderStatuses,
    loading,
    error: apiError,
  } = useRaceControl();

  const [readerStatuses, setReaderStatuses] = useState<ReaderStatus[]>([]);
  const [raceState, setRaceState] = useState<
    'idle' | 'prepared' | 'running' | 'stopped'
  >('idle');

  // Use SignalR-pushed statuses if available, otherwise use API-fetched ones
  const displayStatuses =
    liveReaderStatuses.length > 0 ? liveReaderStatuses : readerStatuses;

  // ── Handlers ──

  const handlePrepare = async () => {
    try {
      const statuses = await prepareRace(raceId, webhookBaseUrl);
      setReaderStatuses(statuses);
      setRaceState('prepared');
    } catch {
      // Error already surfaced via apiError
    }
  };

  const handleStart = async () => {
    try {
      const statuses = await startRace(raceId);
      setReaderStatuses(statuses);
      setRaceState('running');
      clearCrossings();
    } catch {
      // Error already surfaced via apiError
    }
  };

  const handleStop = async () => {
    try {
      const statuses = await stopRace(raceId);
      setReaderStatuses(statuses);
      setRaceState('stopped');
    } catch {
      // Error already surfaced via apiError
    }
  };

  const handleRefreshStatus = async () => {
    try {
      const statuses = await getReaderStatuses(raceId);
      setReaderStatuses(statuses);
    } catch {
      // Error already surfaced via apiError
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{raceName}</h1>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <StatusBadge
              label="SignalR"
              isActive={isConnected}
              error={connectionError}
            />
            <StatusBadge
              label={`Race: ${raceState}`}
              isActive={raceState === 'running'}
            />
          </div>
        </div>

        {/* ── Control Buttons ── */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrepare}
            disabled={loading || raceState === 'running'}
            style={buttonStyle('#1976d2')}
          >
            {loading ? 'Working...' : '1. Prepare Readers'}
          </button>
          <button
            onClick={handleStart}
            disabled={loading || raceState !== 'prepared'}
            style={buttonStyle('#2e7d32')}
          >
            2. Start Race
          </button>
          <button
            onClick={handleStop}
            disabled={loading || raceState !== 'running'}
            style={buttonStyle('#c62828')}
          >
            3. Stop Race
          </button>
          <button
            onClick={handleRefreshStatus}
            disabled={loading}
            style={buttonStyle('#757575')}
          >
            Refresh Status
          </button>
        </div>
      </div>

      {apiError && (
        <div
          style={{
            background: '#ffebee',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#c62828',
          }}
        >
          {apiError}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ── Left: Reader Status Panel ── */}
        <div>
          <h2>Reader Status</h2>
          {displayStatuses.length === 0 ? (
            <p style={{ color: '#757575' }}>
              Click "Prepare Readers" to configure and check reader connectivity.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayStatuses.map((reader) => (
                <ReaderCard key={reader.deviceId} reader={reader} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Live Crossings Feed ── */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2>
              Live Crossings{' '}
              <span style={{ fontSize: '14px', color: '#757575' }}>
                ({crossings.length})
              </span>
            </h2>
            {crossings.length > 0 && (
              <button onClick={clearCrossings} style={buttonStyle('#757575')}>
                Clear
              </button>
            )}
          </div>

          {raceState !== 'running' && crossings.length === 0 ? (
            <p style={{ color: '#757575' }}>
              Crossings will appear here in real-time once the race is started.
            </p>
          ) : (
            <div
              style={{
                maxHeight: '600px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {crossings.map((crossing, index) => (
                <CrossingRow key={`${crossing.epc}-${index}`} crossing={crossing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ──

const StatusBadge: React.FC<{
  label: string;
  isActive: boolean;
  error?: string | null;
}> = ({ label, isActive, error }) => (
  <span
    style={{
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 600,
      background: error ? '#fff3e0' : isActive ? '#e8f5e9' : '#f5f5f5',
      color: error ? '#e65100' : isActive ? '#2e7d32' : '#757575',
    }}
  >
    {error ? `⚠ ${label}: ${error}` : isActive ? `● ${label}` : `○ ${label}`}
  </span>
);

const ReaderCard: React.FC<{ reader: ReaderStatus }> = ({ reader }) => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${
        reader.errorMessage
          ? '#ef9a9a'
          : reader.isRunning
          ? '#81c784'
          : reader.isReachable
          ? '#90caf9'
          : '#e0e0e0'
      }`,
      background: reader.errorMessage
        ? '#ffebee'
        : reader.isRunning
        ? '#e8f5e9'
        : '#fff',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <strong>{reader.deviceName || reader.hostname}</strong>
      <span
        style={{
          fontSize: '12px',
          color: reader.isRunning
            ? '#2e7d32'
            : reader.isReachable
            ? '#1976d2'
            : '#c62828',
        }}
      >
        {reader.isRunning
          ? '● Scanning'
          : reader.isReachable
          ? '● Ready'
          : '○ Offline'}
      </span>
    </div>
    <div style={{ fontSize: '13px', color: '#757575' }}>{reader.hostname}</div>
    {reader.errorMessage && (
      <div style={{ fontSize: '12px', color: '#c62828', marginTop: '4px' }}>
        {reader.errorMessage}
      </div>
    )}
  </div>
);

const CrossingRow: React.FC<{ crossing: CheckpointCrossing }> = ({
  crossing,
}) => {
  const time = new Date(crossing.timestamp).toLocaleTimeString();

  return (
    <div
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <strong>#{crossing.bibNumber}</strong>{' '}
        <span>{crossing.participantName}</span>
      </div>
      <div style={{ textAlign: 'right', fontSize: '13px', color: '#757575' }}>
        <div>{crossing.checkpointName}</div>
        <div>{time}</div>
      </div>
    </div>
  );
};

// ── Styles ──

const buttonStyle = (color: string): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  background: color,
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
});

export default RaceDashboard;
