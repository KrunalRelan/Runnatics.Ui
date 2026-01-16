import { ReadRecordStatus } from './ReadRecordStatus';

export interface FileUploadRecordDto {
  id: number;
  rowNumber: number;
  epc: string;
  readTimestamp: string;
  antennaPort: number | null;
  rssiDbm: number | null;
  status: ReadRecordStatus;
  statusText: string;
  errorMessage: string | null;
  matchedChipId: number | null;
  matchedChipCode: string | null;
  matchedParticipantId: number | null;
  matchedParticipantName: string | null;
  matchedBibNumber: string | null;
}
