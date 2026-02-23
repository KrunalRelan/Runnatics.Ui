import { RFIDValidationError } from './RFIDValidationError';

/**
 * Response from RFID file auto-import
 */
export interface RFIDImportResponse {
    uploadBatchId: string | null;
    fileName: string;
    uploadedAt: string;
    totalReadings: number;
    uniqueEpcs: number;
    timeRangeStart: number | null;
    timeRangeEnd: number | null;
    fileSizeBytes: number;
    fileFormat: string;
    status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
    errors: RFIDValidationError[];
}
