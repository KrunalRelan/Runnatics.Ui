import { useState, useEffect, useRef } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface UseBibMappingHubReturn {
  lastEpc: string | null;
  lastRssi: number | null;
  connectionStatus: ConnectionStatus;
}

/**
 * Connects to the bib-mapping SignalR hub and listens for EPC detections.
 *
 * @param hubUrl - SignalR hub URL (default: http://localhost:5000/hubs/bib-mapping)
 */
export function useBibMappingHub(
  hubUrl: string = 'http://localhost:5000/hubs/bib-mapping'
): UseBibMappingHubReturn {
  const [lastEpc, setLastEpc] = useState<string | null>(null);
  const [lastRssi, setLastRssi] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const connectionRef = useRef<HubConnection | null>(null);

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

      connection.onreconnecting(() => {
        if (!cancelled) {
          setConnectionStatus('connecting');
        }
      });

      connection.onreconnected(() => {
        if (!cancelled) {
          setConnectionStatus('connected');
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

  return { lastEpc, lastRssi, connectionStatus };
}
