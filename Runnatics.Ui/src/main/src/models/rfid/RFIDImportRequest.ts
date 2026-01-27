/**
 * Request parameters for RFID file upload
 */
export interface RFIDImportRequest {
    file: File;
    timeZoneId?: string;
    fileFormat?: 'DB' | 'CSV' | 'JSON';
    sourceType?: string;
    deviceId?: string;
    expectedCheckpointId?: string;
    readerDeviceId?: string;
}
