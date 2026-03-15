export interface BibMappingProps {
  raceId: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface SimulationResult {
  bibNumber: string;
  epc: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: string;
}

export interface BulkSimulationRow {
  bibNumber: string;
  epc?: string;
}
