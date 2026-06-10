import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import config from '../config/environment';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface UseBibMappingHubReturn {
  lastEpc: string | null;
  lastRssi: number | null;
  multipleEpcEpcs: string[] | null;
  clearMultipleEpc: () => void;
  connectionStatus: ConnectionStatus;
}

/**
 * Connects to the bib-mapping SignalR hub and listens for EPC detections.
 *
 * @param hubUrl - SignalR hub URL (default: derived from environment config)
 */
export function useBibMappingHub(
  hubUrl: string = `${config.hubBaseUrl}/hubs/bib-mapping`
): UseBibMappingHubReturn {
  const [lastEpc, setLastEpc] = useState<string | null>(null);
  const [lastRssi, setLastRssi] = useState<number | null>(null);
  const [multipleEpcEpcs, setMultipleEpcEpcs] = useState<string[] | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const connectionRef = useRef<HubConnection | null>(null);

  const clearMultipleEpc = useCallback(() => {
    setMultipleEpcEpcs(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startConnection = async () => {
      setConnectionStatus('connecting');

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (context) => {
            const delays = [0, 1000, 2000, 5000, 10000, 30000];
            return context.previousRetryCount < delays.length
              ? delays[context.previousRetryCount]
              : 30000;
          },
        })
        .configureLogging(LogLevel.Information)
        .build();

      connection.on('EpcDetected', (epc: string, rssi: number) => {
        if (!cancelled) {
          setLastEpc(epc);
          setLastRssi(rssi);
        }
      });

      connection.on('MultipleEpcDetected', (epcs: string[]) => {
        if (!cancelled) {
          setMultipleEpcEpcs(epcs);
        }
      });

      connection.onreconnecting(() => {
        if (!cancelled) {
          setConnectionStatus('connecting');
        }
      });

      connection.onreconnected(() => {
        if (!cancelled) {
          setConnectionStatus('connected');
          // Drop any stale multi-EPC event captured before the drop
          setMultipleEpcEpcs(null);
        }
      });

      connection.onclose(() => {
        if (!cancelled) {
          setConnectionStatus('disconnected');
        }
      });

      try {
        connectionRef.current = connection;
        await connection.start();

        if (!cancelled) {
          setConnectionStatus('connected');
        }
      } catch (err) {
        if (!cancelled) {
          setConnectionStatus('disconnected');
        }
      }
    };

    startConnection();

    return () => {
      cancelled = true;
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        connectionRef.current.stop();
      }
    };
  }, [hubUrl]);

  return { lastEpc, lastRssi, multipleEpcEpcs, clearMultipleEpc, connectionStatus };
}
