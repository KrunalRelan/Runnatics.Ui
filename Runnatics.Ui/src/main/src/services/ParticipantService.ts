import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { UploadResponse, ProcessResponse, ProcessImportRequest, ParticipantSearchRequest, ParticipantSearchResponse, ParticipantRequest, AddParticipantRangeRequest, AddParticipantRangeResponse, UpdateParticipantsByBibResponse, ParticipantDetailsResponse } from '../models/participants';
import { ResponseBase } from '../models/ResponseBase';
import { Category } from '../models/participants/Category';

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

    /**
     * Add a new participant to a race
     * Note: JWT token is automatically included via interceptor
     */
    static async addParticipant(
        eventId: string,
        raceId: string,
        participant: ParticipantRequest
    ): Promise<void> {
        await apiClient.post(
            ServiceUrl.addParticipant(eventId, raceId),
            participant
        );
    }

    static async editParticipant(
        participantId: string,
        participant: ParticipantRequest
    ): Promise<void> {
        await apiClient.put(
            ServiceUrl.editParticipant(participantId),
            participant
        );
    }

    /**
     * Delete a participant
     * Note: JWT token is automatically included via interceptor
     */
    static async deleteParticipant(
        participantId: string
    ): Promise<void> {
        await apiClient.put(
            ServiceUrl.deleteParticipant(participantId)
        );
    }

    static async getCategories(eventId: string, raceId?: string): Promise<Category[]> {
        const response: AxiosResponse<ResponseBase<Category[]>> = await apiClient.get(
            ServiceUrl.getParticipantCategories(eventId, raceId)
        );
        return response.data.message;
    }

    /**
     * Add participants with bib numbers in a specified range
     * Note: JWT token is automatically included via interceptor
     */
    static async addParticipantRange(
        eventId: string,
        raceId: string,
        request: AddParticipantRangeRequest
    ): Promise<ResponseBase<AddParticipantRangeResponse>> {
        const response: AxiosResponse<ResponseBase<AddParticipantRangeResponse>> =
            await apiClient.post(
                ServiceUrl.addParticipantRange(eventId, raceId),
                request
            );

        return response.data;
    }

    /**
     * Update participants by bib number from CSV file
     * This updates existing participants (created via AddParticipantRange) with their details
     * Note: JWT token is automatically included via interceptor
     */
    static async updateParticipantsByBib(
        eventId: string,
        raceId: string,
        file: File
    ): Promise<ResponseBase<UpdateParticipantsByBibResponse>> {
        const formData = new FormData();
        formData.append('File', file);

        const response: AxiosResponse<ResponseBase<UpdateParticipantsByBibResponse>> =
            await apiClient.post(
                ServiceUrl.updateParticipantsByBib(eventId, raceId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

        return response.data;
    }

    public static async getParticipantDetails(eventId: string, raceId: string, participantId: string): Promise<AxiosResponse<ResponseBase<ParticipantDetailsResponse>>> {
        const url = ServiceUrl.getParticipantDetails(eventId, raceId, participantId);
        return await apiClient.get<ResponseBase<ParticipantDetailsResponse>>(url);
    }

}
