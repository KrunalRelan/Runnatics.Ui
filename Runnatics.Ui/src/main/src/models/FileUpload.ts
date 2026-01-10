// File Upload Models and Enums

export enum FileProcessingStatus {
  Pending = 0,
  Validating = 1,
  Processing = 2,
  Completed = 3,
  PartiallyCompleted = 4,
  Failed = 5,
  Cancelled = 6
}

export enum ReadRecordStatus {
  Pending = 0,
  Valid = 1,
  Duplicate = 2,
  InvalidEpc = 3,
  UnknownChip = 4,
  InvalidTimestamp = 5,
  OutOfRaceWindow = 6,
  Processed = 7,
  Skipped = 8
}

export interface FileUploadResponse {
  batchId: number;
  batchGuid: string;
  fileName: string;
  fileSizeBytes: number;
  detectedFormat: number;
  status: FileProcessingStatus;
  message: string;
}

export interface FileUploadStatusDto {
  batchId: number;
  batchGuid: string;
  originalFileName: string;
  status: FileProcessingStatus;
  statusText: string;
  totalRecords: number;
  processedRecords: number;
  matchedRecords: number;
  duplicateRecords: number;
  errorRecords: number;
  progressPercent: number;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  processingDuration: string | null;
  errorMessage: string | null;
  createdAt: string;
  uploadedByUserName: string | null;
}

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

export interface RaceBatchesResponse {
  batches: FileUploadStatusDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
