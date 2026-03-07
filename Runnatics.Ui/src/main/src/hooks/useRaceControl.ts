// ============================================================================
// File: React/useRaceControl.ts
// Purpose: React hook for calling the race control API endpoints.
//          Handles: device registration, race preparation, start/stop, status.
//
// Usage:
//   const { prepareRace, startRace, stopRace, loading, error } = useRaceControl();
// ============================================================================

import { useState, useCallback } from 'react';
import config from '../config/environment';

// Derived at module load from environment — no hardcoded URLs
const API_BASE = config.apiBaseUrl;

export interface ReaderStatus {
  deviceId: number;
  deviceName: string;
  hostname: string;
  checkpointName: string;
  isReachable: boolean;
  isRunning: boolean;
  errorMessage?: string;
}

export interface RegisterDeviceResult {
  deviceId: number;
  hostname: string;
  macAddress: string;
  ipAddress?: string;
  firmwareVersion?: string;
  readerModel: string;
  isOnline: boolean;
}

export interface UseRaceControlReturn {
  /** Register a new reader device by hostname */
  registerDevice: (
    hostname: string,
    deviceName: string
  ) => Promise<RegisterDeviceResult>;

  /** Assign a registered device to a race checkpoint */
  assignDevice: (
    deviceId: number,
    raceId: string,
    checkpointId: number,
    mode?: string
  ) => Promise<void>;

  /** Configure all readers for a race (webhooks + presets) */
  prepareRace: (
    raceId: string,
    webhookBaseUrl: string
  ) => Promise<ReaderStatus[]>;

  /** Start all readers — GO LIVE */
  startRace: (raceId: string) => Promise<ReaderStatus[]>;

  /** Stop all readers */
  stopRace: (raceId: string) => Promise<ReaderStatus[]>;

  /** Get current status of all readers for a race */
  getReaderStatuses: (raceId: string) => Promise<ReaderStatus[]>;

  /** Whether any API call is in progress */
  loading: boolean;

  /** Last error message, if any */
  error: string | null;
}

export function useRaceControl(): UseRaceControlReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async <T>(url: string, options?: RequestInit): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options?.headers ?? {}),
          },
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(
            errorBody?.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const registerDevice = useCallback(
    (hostname: string, deviceName: string) =>
      apiCall<RegisterDeviceResult>(`${API_BASE}/devices/register`, {
        method: 'POST',
        body: JSON.stringify({ hostname, deviceName }),
      }),
    [apiCall]
  );

  const assignDevice = useCallback(
    (
      deviceId: number,
      raceId: string,
      checkpointId: number,
      mode: string = 'online'
    ) =>
      apiCall<void>(`${API_BASE}/devices/assign`, {
        method: 'POST',
        body: JSON.stringify({ deviceId, raceId, checkpointId, mode }),
      }),
    [apiCall]
  );

  const prepareRace = useCallback(
    (raceId: string, webhookBaseUrl: string) =>
      apiCall<ReaderStatus[]>(`${API_BASE}/race-control/prepare`, {
        method: 'POST',
        body: JSON.stringify({ raceId, webhookBaseUrl }),
      }),
    [apiCall]
  );

  const startRace = useCallback(
    (raceId: string) =>
      apiCall<ReaderStatus[]>(`${API_BASE}/race-control/${raceId}/start`, {
        method: 'POST',
      }),
    [apiCall]
  );

  const stopRace = useCallback(
    (raceId: string) =>
      apiCall<ReaderStatus[]>(`${API_BASE}/race-control/${raceId}/stop`, {
        method: 'POST',
      }),
    [apiCall]
  );

  const getReaderStatuses = useCallback(
    (raceId: string) =>
      apiCall<ReaderStatus[]>(
        `${API_BASE}/race-control/${raceId}/reader-status`
      ),
    [apiCall]
  );

  return {
    registerDevice,
    assignDevice,
    prepareRace,
    startRace,
    stopRace,
    getReaderStatuses,
    loading,
    error,
  };
}
