// ============================================================================
// File: React/useRaceHub.ts
// Purpose: React hook that connects to the SignalR hub and provides
//          real-time race events to your components.
//
// Install: npm install @microsoft/signalr
//
// Usage:
//   const { crossings, readerStatuses, isConnected } = useRaceHub(raceId);
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';

// ── Types matching your C# DTOs ──

export interface CheckpointCrossing {
  participantName: string;
  bibNumber: string;
  checkpointName: string;
  epc: string;
  timestamp: string;
  rssi: number;
  antennaPort: number;
  raceId: number;
  checkpointId: number;
}

export interface ReaderStatus {
  deviceId: number;
  deviceName: string;
  hostname: string;
  checkpointName: string;
  isReachable: boolean;
  isRunning: boolean;
  errorMessage?: string;
}

export interface UseRaceHubReturn {
  /** Live checkpoint crossings — newest first */
  crossings: CheckpointCrossing[];
  /** Latest reader statuses from Prepare/Start/Stop operations */
  readerStatuses: ReaderStatus[];
  /** Whether the SignalR connection is active */
  isConnected: boolean;
  /** Any connection error message */
  connectionError: string | null;
  /** Clears the crossings list (e.g., when starting a new race) */
  clearCrossings: () => void;
}

/**
 * Connects to the race SignalR hub and subscribes to real-time events.
 *
 * @param raceId - The race GUID to subscribe to. Pass null/undefined to disconnect.
 * @param hubUrl - SignalR hub URL (default: /hubs/race)
 * @param maxCrossings - Maximum crossings to keep in memory (default: 1000)
 */
export function useRaceHub(
  raceId: number | null | undefined,
  hubUrl: string = '/hubs/race',
  maxCrossings: number = 1000
): UseRaceHubReturn {
  const [crossings, setCrossings] = useState<CheckpointCrossing[]>([]);
  const [readerStatuses, setReaderStatuses] = useState<ReaderStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);
  const currentRaceRef = useRef<string | null>(null);

  const clearCrossings = useCallback(() => {
    setCrossings([]);
  }, []);

  useEffect(() => {
    if (!raceId) {
      // No race selected — disconnect if connected
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let cancelled = false;

    const startConnection = async () => {
      // Build the SignalR connection
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect({
          // Retry with increasing delays: 0, 1s, 2s, 5s, 10s, 30s
          nextRetryDelayInMilliseconds: (context) => {
            const delays = [0, 1000, 2000, 5000, 10000, 30000];
            return context.previousRetryCount < delays.length
              ? delays[context.previousRetryCount]
              : 30000;
          },
        })
        .configureLogging(LogLevel.Information)
        .build();

      // ── Register event handlers ──

      // Batch of checkpoint crossings (most common event during a race)
      connection.on(
        'CheckpointCrossings',
        (events: CheckpointCrossing[]) => {
          setCrossings((prev) => {
            const updated = [...events, ...prev];
            // Trim to maxCrossings to prevent memory growth
            return updated.slice(0, maxCrossings);
          });
        }
      );

      // Race preparation results
      connection.on('RacePrepared', (statuses: ReaderStatus[]) => {
        setReaderStatuses(statuses);
      });

      // Race started — readers are now active
      connection.on('RaceStarted', (statuses: ReaderStatus[]) => {
        setReaderStatuses(statuses);
      });

      // Race stopped — readers are idle
      connection.on('RaceStopped', (statuses: ReaderStatus[]) => {
        setReaderStatuses(statuses);
      });

      // Individual reader status change
      connection.on(
        'ReaderStatusChanged',
        (event: { deviceId: number; isOnline: boolean; isRunning: boolean }) => {
          setReaderStatuses((prev) =>
            prev.map((s) =>
              s.deviceId === event.deviceId
                ? { ...s, isReachable: event.isOnline, isRunning: event.isRunning }
                : s
            )
          );
        }
      );

      // ── Connection lifecycle handlers ──

      connection.onreconnecting(() => {
        if (!cancelled) {
          setIsConnected(false);
          setConnectionError('Reconnecting...');
        }
      });

      connection.onreconnected(async () => {
        if (!cancelled) {
          setIsConnected(true);
          setConnectionError(null);
          // Re-join the race group after reconnection
          await connection.invoke('JoinRace', raceId);
        }
      });

      connection.onclose(() => {
        if (!cancelled) {
          setIsConnected(false);
        }
      });

      // ── Start the connection ──

      try {
        connectionRef.current = connection;
        await connection.start();

        if (!cancelled) {
          // Leave previous race group if switching races
          if (
            currentRaceRef.current &&
            currentRaceRef.current !== (raceId?.toString() ?? null)
          ) {
            try {
              await connection.invoke('LeaveRace', currentRaceRef.current);
            } catch {
              // Ignore — may not have been in the group
            }
          }

          // Join the new race group
          await connection.invoke('JoinRace', raceId);
          currentRaceRef.current = raceId?.toString() ?? null;

          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (err) { 
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to connect';
          setConnectionError(message);
          setIsConnected(false);
        }
      }
    };

    startConnection();

    // Cleanup on unmount or raceId change
    return () => {
      cancelled = true;
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        if (currentRaceRef.current) {
          connectionRef.current
            .invoke('LeaveRace', currentRaceRef.current)
            .catch(() => {});
        }
        connectionRef.current.stop();
      }
    };
  }, [raceId, hubUrl, maxCrossings]);

  return {
    crossings,
    readerStatuses,
    isConnected,
    connectionError,
    clearCrossings,
  };
}
