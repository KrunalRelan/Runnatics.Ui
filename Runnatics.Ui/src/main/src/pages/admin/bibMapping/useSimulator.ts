import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BibMappingService } from '../../../services/BibMappingService';
import { bibMappingKeys } from './useBibMapping';
import type { SimulationResult, BulkSimulationRow } from './BibMapping.types';

function generateEpc(): string {
  const prefix = '418000';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SimulatorMode = 'single' | 'bulk' | 'presets';

interface UseSimulatorReturn {
  mode: SimulatorMode;
  setMode: (mode: SimulatorMode) => void;
  isRunning: boolean;
  progress: { current: number; total: number };
  results: SimulationResult[];
  delayMs: number;
  setDelayMs: (ms: number) => void;
  simulateSingle: (bib: string, epc: string) => Promise<void>;
  startBulk: (rows: BulkSimulationRow[]) => Promise<void>;
  stop: () => void;
  clearResults: () => void;
  parseCsvInput: (text: string) => BulkSimulationRow[];
  generateEpc: () => string;
}

export function useSimulator(raceId: string): UseSimulatorReturn {
  const queryClient = useQueryClient();
  const stopRef = useRef(false);

  const [mode, setMode] = useState<SimulatorMode>('single');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [delayMs, setDelayMs] = useState(1000);

  const addResult = useCallback((result: SimulationResult) => {
    setResults((prev) => [...prev, result]);
  }, []);

  const invalidateMappings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
  }, [queryClient, raceId]);

  const runOneMapping = useCallback(
    async (bibNumber: string, epc: string, stepDelay: number): Promise<SimulationResult> => {
      const timestamp = new Date().toLocaleTimeString();

      try {
        // Step 1: fire SignalR detection
        await BibMappingService.simulateDetectEpc(epc, -65);

        // Step 2: wait (simulates operator typing)
        await delay(stepDelay);

        // Step 3: save the mapping
        await BibMappingService.create({ raceId, bibNumber, epc });

        // Step 4: refresh history table
        invalidateMappings();

        return {
          bibNumber,
          epc,
          status: 'success',
          message: `BIB ${bibNumber} \u2192 ${epc} mapped`,
          timestamp,
        };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Mapping failed';
        return {
          bibNumber,
          epc,
          status: 'error',
          message,
          timestamp,
        };
      }
    },
    [raceId, invalidateMappings]
  );

  const simulateSingle = useCallback(
    async (bib: string, epc: string) => {
      setIsRunning(true);
      setProgress({ current: 0, total: 1 });

      const result = await runOneMapping(bib, epc, 800);
      addResult(result);
      setProgress({ current: 1, total: 1 });
      setIsRunning(false);
    },
    [runOneMapping, addResult]
  );

  const startBulk = useCallback(
    async (rows: BulkSimulationRow[]) => {
      stopRef.current = false;
      setIsRunning(true);
      setProgress({ current: 0, total: rows.length });

      for (let i = 0; i < rows.length; i++) {
        if (stopRef.current) break;

        const row = rows[i];
        const epc = row.epc || generateEpc();

        // Mark pending
        addResult({
          bibNumber: row.bibNumber,
          epc,
          status: 'pending',
          message: 'Running...',
          timestamp: new Date().toLocaleTimeString(),
        });

        const result = await runOneMapping(row.bibNumber, epc, delayMs);

        // Replace pending with actual result
        setResults((prev) => {
          const updated = [...prev];
          let pendingIdx = -1;
          for (let j = updated.length - 1; j >= 0; j--) {
            if (updated[j].bibNumber === row.bibNumber && updated[j].status === 'pending') {
              pendingIdx = j;
              break;
            }
          }
          if (pendingIdx !== -1) {
            updated[pendingIdx] = result;
          }
          return updated;
        });

        setProgress({ current: i + 1, total: rows.length });
      }

      setIsRunning(false);
    },
    [runOneMapping, addResult, delayMs]
  );

  const stop = useCallback(() => {
    stopRef.current = true;
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setProgress({ current: 0, total: 0 });
  }, []);

  const parseCsvInput = useCallback((text: string): BulkSimulationRow[] => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Skip header if present
    const startIdx =
      lines.length > 0 && /^bib/i.test(lines[0]) ? 1 : 0;

    return lines.slice(startIdx).map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        bibNumber: parts[0],
        epc: parts[1] || undefined,
      };
    });
  }, []);

  return {
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
  };
}
