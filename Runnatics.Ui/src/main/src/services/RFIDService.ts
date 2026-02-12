import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosProgressEvent, AxiosResponse } from 'axios';
import { RFIDImportResponse, RFIDImportRequest } from '../models/rfid';
import { ResponseBase } from '../models/ResponseBase';

/**
 * RFID Service
 * Handles all RFID file upload and processing operations
 */
export class RFIDService {
    /**
     * Upload RFID file with auto-detection of device, event, and race
     * The device name is extracted from the filename (format: YYYY-MM-DD_DeviceName.db)
     * Note: JWT token is automatically included via interceptor
     * 
     * @param file - The RFID database file (.db, .sqlite)
     * @param options - Optional configuration for the upload
     * @param onProgress - Optional callback for upload progress
     * @returns Promise with the import response
     */
    static async uploadRFIDFileAuto(
        file: File,
        options?: Partial<Omit<RFIDImportRequest, 'file'>>,
        onProgress?: (progress: number) => void
    ): Promise<ResponseBase<RFIDImportResponse>> {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('TimeZoneId', options?.timeZoneId ?? 'UTC');
        formData.append('FileFormat', options?.fileFormat ?? 'DB');
        formData.append('SourceType', options?.sourceType ?? 'file_upload');

        if (options?.deviceId) {
            formData.append('DeviceId', options.deviceId);
        }
        if (options?.expectedCheckpointId) {
            formData.append('ExpectedCheckpointId', options.expectedCheckpointId);
        }
        if (options?.readerDeviceId) {
            formData.append('ReaderDeviceId', options.readerDeviceId);
        }

        const response: AxiosResponse<ResponseBase<RFIDImportResponse>> = await apiClient.post(
            ServiceUrl.uploadRFIDFileAuto(),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            }
        );

        return response.data;
    }

    /**
     * Validate RFID filename format
     * Expected format: YYYY-MM-DD_DeviceName.db
     * 
     * @param fileName - The filename to validate
     * @returns Object with isValid flag and extracted device name or error message
     */
    static validateFileName(fileName: string): { 
        isValid: boolean; 
        deviceName?: string; 
        error?: string 
    } {
        const validExtensions = ['.db', '.sqlite'];
        const lowerFileName = fileName.toLowerCase();
        
        // Check file extension
        const hasValidExtension = validExtensions.some(ext => lowerFileName.endsWith(ext));
        if (!hasValidExtension) {
            return {
                isValid: false,
                error: 'Only SQLite database files (.db, .sqlite) are supported'
            };
        }

        // Check filename format: YYYY-MM-DD_DeviceName.db
        const fileNameWithoutExt = fileName.replace(/\.(db|sqlite)$/i, '');
        const underscoreIndex = fileNameWithoutExt.indexOf('_');
        
        if (underscoreIndex === -1) {
            return {
                isValid: false,
                error: 'Invalid filename format. Expected: YYYY-MM-DD_DeviceName.db'
            };
        }

        const deviceName = fileNameWithoutExt.substring(underscoreIndex + 1);
        
        if (!deviceName || deviceName.trim().length === 0) {
            return {
                isValid: false,
                error: 'Device name cannot be empty. Expected format: YYYY-MM-DD_DeviceName.db'
            };
        }

        return {
            isValid: true,
            deviceName: deviceName
        };
    }

    /**
     * Format bytes to human-readable string
     * @param bytes - Number of bytes
     * @returns Formatted string (e.g., "1.5 MB")
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Format Unix timestamp to locale string
     * @param timestamp - Unix timestamp in milliseconds
     * @returns Formatted date/time string or 'N/A'
     */
    static formatTimestamp(timestamp: number | null): string {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    }

    /**
     * Process all RFID results for a specific event and race
     * Triggers backend processing of all RFID data
     * 
     * @param eventId - The ID of the event
     * @param raceId - The ID of the race
     * @param forceReprocess - Force reprocessing of already processed data (default: false)
     * @returns Promise with the processing response
     */
    static async processAllResults(
        eventId: string,
        raceId: string,
        forceReprocess: boolean = false
    ): Promise<ResponseBase<any>> {
        const response: AxiosResponse<ResponseBase<any>> = await apiClient.post(
            ServiceUrl.processAllRFIDResults(eventId, raceId),
            null,
            {
                params: { forceReprocess }
            }
        );

        return response.data;
    }

    /**
     * Clear processed RFID data for a race
     * @param eventId - The ID of the event
     * @param raceId - The ID of the race
     * @param keepUploads - Keep uploaded data while clearing processed results (default: true)
     * @returns Promise with the clear response
     */
    static async clearProcessedData(
        eventId: string,
        raceId: string,
        keepUploads: boolean = true
    ): Promise<ResponseBase<any>> {
        const response: AxiosResponse<ResponseBase<any>> = await apiClient.delete(
            ServiceUrl.clearProcessedData(eventId, raceId),
            {
                params: { keepUploads }
            }
        );

        return response.data;
    }
}
