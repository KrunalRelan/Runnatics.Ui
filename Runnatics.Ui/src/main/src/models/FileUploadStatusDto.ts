import { FileProcessingStatus } from './FileProcessingStatus';

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
