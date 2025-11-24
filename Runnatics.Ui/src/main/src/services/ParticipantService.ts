import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { UploadResponse, ProcessResponse, ProcessImportRequest } from '../models/participants';
import { ResponseBase } from '../models/ResponseBase';

export class ParticipantService {
    /**
     * Upload CSV file and validate participant data
     * Note: JWT token is automatically included via interceptor
     */
    static async uploadParticipantCSV(
        eventId: string,
        file: File,
        raceId?: number
    ): Promise<ResponseBase<UploadResponse>> {
        const formData = new FormData();
        formData.append('File', file);
        if (raceId) {
            formData.append('RaceId', raceId.toString());
        }

        const response: AxiosResponse<ResponseBase<UploadResponse>> = await apiClient.post(
            ServiceUrl.uploadParticipantImport(eventId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    /**
     * Process staged participant import data
     * Note: JWT token is automatically included via interceptor
     */
    static async processParticipantImport(
        eventId: string,
        importBatchId: string,
        raceId?: number
    ): Promise<ResponseBase<ProcessResponse>> {
        // Note: Backend expects importBatchId as number in the request body
        // but we keep it as string in the URL (encrypted)
        const requestBody: ProcessImportRequest = {
            importBatchId: parseInt(importBatchId, 10),
            eventId: parseInt(eventId, 10),
            raceId: raceId,
        };

        const response: AxiosResponse<ResponseBase<ProcessResponse>> = await apiClient.post(
            ServiceUrl.processParticipantImport(eventId, importBatchId),
            requestBody
        );
        return response.data;
    }
}
