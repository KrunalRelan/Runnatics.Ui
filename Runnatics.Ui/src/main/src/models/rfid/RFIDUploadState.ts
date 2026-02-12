import { RFIDImportResponse } from './RFIDImportResponse';

/**
 * State for the RFID file upload component
 */
export interface RFIDUploadState {
    selectedFile: File | null;
    isUploading: boolean;
    uploadProgress: number;
    uploadResult: RFIDImportResponse | null;
    error: string | null;
    isDragging: boolean;
}
