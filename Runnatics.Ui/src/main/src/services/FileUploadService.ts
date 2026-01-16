import { 
  FileUploadResponse, 
  FileUploadStatusDto, 
  FileUploadRecordDto,
  RaceBatchesResponse,
  FileFormat
} from '../models';
import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface FileUploadParams {
  raceId: string;
  eventId?: string;
  readerDeviceId?: string;
  checkpointId?: string;
  description?: string;
  fileFormat?: FileFormat;
  mappingId?: string;
}

export const FileUploadService = {
  /**
   * Upload a single RFID file
   */
  async uploadFile(
    file: File, 
    params: FileUploadParams
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('raceId', params.raceId);
    
    if (params.eventId) formData.append('eventId', params.eventId);
    if (params.readerDeviceId) formData.append('readerDeviceId', params.readerDeviceId);
    if (params.checkpointId) formData.append('checkpointId', params.checkpointId);
    if (params.description) formData.append('description', params.description);
    if (params.fileFormat !== undefined) formData.append('fileFormat', params.fileFormat.toString());
    if (params.mappingId) formData.append('mappingId', params.mappingId);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Upload multiple RFID files
   */
  async uploadMultipleFiles(
    files: File[], 
    params: FileUploadParams
  ): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('raceId', params.raceId);
    
    if (params.eventId) formData.append('eventId', params.eventId);
    if (params.readerDeviceId) formData.append('readerDeviceId', params.readerDeviceId);
    if (params.checkpointId) formData.append('checkpointId', params.checkpointId);
    if (params.description) formData.append('description', params.description);
    if (params.fileFormat !== undefined) formData.append('fileFormat', params.fileFormat.toString());
    if (params.mappingId) formData.append('mappingId', params.mappingId);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/upload-multiple`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Get the status of a specific batch
   */
  async getBatchStatus(batchId: number): Promise<FileUploadStatusDto> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to get batch status');
    return response.json();
  },

  /**
   * Get all batches for a specific race
   */
  async getRaceBatches(
    raceId: number, 
    page = 1, 
    pageSize = 20
  ): Promise<RaceBatchesResponse> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/FileUpload/race/${raceId}/batches?page=${page}&pageSize=${pageSize}`,
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
    );
    if (!response.ok) throw new Error('Failed to get batches');
    return response.json();
  },

  /**
   * Get records from a specific batch
   */
  async getBatchRecords(
    batchId: number, 
    page = 1, 
    pageSize = 100
  ): Promise<FileUploadRecordDto[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/FileUpload/batch/${batchId}/records?page=${page}&pageSize=${pageSize}`,
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
    );
    if (!response.ok) throw new Error('Failed to get records');
    return response.json();
  },

  /**
   * Start processing a batch
   */
  async processBatch(batchId: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}/process`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to start processing');
  },

  /**
   * Reprocess a batch (errors only or all records)
   */
  async reprocessBatch(batchId: number, reprocessAll = false): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}/reprocess`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ 
        batchId, 
        reprocessAll, 
        reprocessErrors: !reprocessAll 
      }),
    });
    if (!response.ok) throw new Error('Failed to reprocess batch');
  },

  /**
   * Delete a batch
   */
  async deleteBatch(batchId: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to delete batch');
  },

  /**
   * Cancel a batch that is currently processing
   */
  async cancelBatch(batchId: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/FileUpload/batch/${batchId}/cancel`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to cancel batch');
  }
};
