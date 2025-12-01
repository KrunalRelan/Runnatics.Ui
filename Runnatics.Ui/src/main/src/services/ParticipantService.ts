import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { UploadResponse, ProcessResponse, ProcessImportRequest, ParticipantSearchRequest, ParticipantSearchResponse } from '../models/participants';
import { ResponseBase } from '../models/ResponseBase';

export class ParticipantService {
    /**
     * Upload CSV file and validate participant data
     * Note: JWT token is automatically included via interceptor
     */
    static async uploadParticipantCSV(
        eventId: string,
        file: File,
        raceId?: string
    ): Promise<ResponseBase<UploadResponse>> {
        const formData = new FormData();
        formData.append('File', file);
        if (raceId) {
            formData.append('RaceId', raceId);
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
        raceId?: string
    ): Promise<ResponseBase<ProcessResponse>> {
        const requestBody: ProcessImportRequest = {
            importBatchId: importBatchId,
            eventId: eventId,
            raceId: raceId ?? undefined, // 👈 important if backend allows undefined
        };

        const response: AxiosResponse<ResponseBase<ProcessResponse>> =
            await apiClient.post(
                ServiceUrl.processParticipantImport(eventId, importBatchId),
                requestBody
            );

        return response.data;
    }

    /**
     * Search participants for a race
     * Note: JWT token is automatically included via interceptor
     */
    static async searchParticipants(
        eventId: string,
        raceId: string,
        searchRequest: ParticipantSearchRequest
    ): Promise<ResponseBase<ParticipantSearchResponse[]>> {
        const response: AxiosResponse<ResponseBase<ParticipantSearchResponse[]>> =
            await apiClient.post(
                ServiceUrl.searchParticipants(eventId, raceId),
                searchRequest
            );

        return response.data;
    }

}
