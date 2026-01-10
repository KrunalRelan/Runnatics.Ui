import { 
  FileUploadResponse, 
  FileUploadStatusDto, 
  FileUploadRecordDto,
  RaceBatchesResponse
} from '../models/FileUpload';
import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export const FileUploadService = {
  /**
   * Upload a single RFID file
   */
  async uploadFile(
    file: File, 
    raceId: number, 
    checkpointId?: number, 
    description?: string
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('raceId', raceId.toString());
    if (checkpointId) formData.append('checkpointId', checkpointId.toString());
    if (description) formData.append('description', description);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/fileupload/upload`, {
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
    raceId: number, 
    checkpointId?: number
  ): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('raceId', raceId.toString());
    if (checkpointId) formData.append('checkpointId', checkpointId.toString());

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/fileupload/upload-multiple`, {
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
    const response = await fetch(`${API_BASE_URL}/fileupload/batch/${batchId}`, {
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
      `${API_BASE_URL}/fileupload/race/${raceId}/batches?page=${page}&pageSize=${pageSize}`,
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
      `${API_BASE_URL}/fileupload/batch/${batchId}/records?page=${page}&pageSize=${pageSize}`,
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
    const response = await fetch(`${API_BASE_URL}/fileupload/batch/${batchId}/process`, {
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
    const response = await fetch(`${API_BASE_URL}/fileupload/batch/${batchId}/reprocess`, {
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
    const response = await fetch(`${API_BASE_URL}/fileupload/batch/${batchId}`, {
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
    const response = await fetch(`${API_BASE_URL}/fileupload/batch/${batchId}/cancel`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to cancel batch');
  }
};
