import { FileProcessingStatus } from './FileProcessingStatus';

export interface FileUploadResponse {
  batchId: number;
  batchGuid: string;
  fileName: string;
  fileSizeBytes: number;
  detectedFormat: number;
  status: FileProcessingStatus;
  message: string;
}
