export interface BibMappingProps {
  eventId: string;
  raceId: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export type RowStatus = 'unmapped' | 'saving' | 'mapped' | 'error' | 'skipped';

export interface MappingRow {
  participantId: string;
  bibNumber: string;
  name: string;
  epc: string;
  pendingEpc: string;
  status: RowStatus;
  errorMessage?: string;
  chipId?: string;
  eventId?: string;
  createdAt?: string;
}

/** Info passed to the duplicate-EPC confirmation dialog. */
export interface DuplicateInfo {
  epc: string;
  newParticipantId: string;
  newBib: string;
  newName: string;
  existingParticipantId: string;
  existingBib: string;
  existingName: string;
  existingChipId?: string;
  existingEventId?: string;
}

export type SubmitResult =
  | { status: 'ok'; nextId?: string }
  | { status: 'invalid' }
  | { status: 'session-duplicate' }
  | { status: 'duplicate'; duplicate: DuplicateInfo }
  | { status: 'error' };

export interface SessionStats {
  mappedThisSession: number;
  duplicateAttempts: number;
  lastScanned: { bib: string; time: string } | null;
}

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
