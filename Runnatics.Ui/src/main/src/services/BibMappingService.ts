import { AxiosResponse } from 'axios';
import { apiClient } from '../utils/axios.config';
import { ServiceUrl } from '../models/ServiceUrls';
import { ResponseBase } from '../models/ResponseBase';
import {
    CreateBibMappingRequest,
    BibMappingResponse,
    BibMappingParticipantResponse,
    DeleteBibMappingParams,
    GetEpcMappingRequest,
} from '../models/bibMapping';

/**
 * BibMapping Service
 * Handles all EPC-to-BIB mapping operations
 */
export class BibMappingService {
    /**
     * Create a new BIB mapping (EPC → BIB number)
     */
    static async create(data: CreateBibMappingRequest): Promise<BibMappingResponse> {
        const response: AxiosResponse<ResponseBase<BibMappingResponse>> = await apiClient.post(
            ServiceUrl.createBibMapping(),
            data
        );
        return response.data.message;
    }

    /**
     * Get all BIB mappings for a race
     */
    static async getByRace(raceId: string): Promise<BibMappingResponse[]> {
        const response: AxiosResponse<ResponseBase<BibMappingResponse[]>> = await apiClient.get(
            ServiceUrl.getBibMappingsByRace(),
            { params: { raceId } }
        );
        return response.data.message;
    }

    /**
     * Get participants with mapping status (server-side paginated)
     */
    static async getParticipantsWithMappingStatus(
        raceId: string,
        request: GetEpcMappingRequest
    ): Promise<ResponseBase<BibMappingParticipantResponse[]>> {
        const response: AxiosResponse<ResponseBase<BibMappingParticipantResponse[]>> = await apiClient.get(
            ServiceUrl.getBibMappingParticipants(),
            { params: { raceId, ...request } }
        );
        return response.data;
    }

    /**
     * Delete a BIB mapping (soft delete + unassign)
     */
    static async delete(params: DeleteBibMappingParams): Promise<void> {
        await apiClient.delete(
            ServiceUrl.deleteBibMapping(),
            { params }
        );
    }

    /**
     * [DEV ONLY] Simulate an EPC detection via backend SignalR
     */
    static async simulateDetectEpc(epc: string, rssi: number = -65): Promise<void> {
        await apiClient.post(ServiceUrl.simulateDetectEpc(), { epc, rssi });
    }

    /**
     * [DEV ONLY] Simulate a random EPC detection
     */
    static async simulateDetectRandom(): Promise<void> {
        await apiClient.post(ServiceUrl.simulateDetectRandom());
    }
}
