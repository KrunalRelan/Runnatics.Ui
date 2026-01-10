import { ServiceUrl } from '../models';
import { Race } from '../models/races/Race';
import { RaceSearchRequest } from '../models/races/RaceSearchRequest';
import { SearchResponse } from '../models/SearchReponse';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { ResponseBase } from '../models/ResponseBase';
import { CreateRaceRequest } from '../models/races/CreateRaceRequest';


export class RaceService {
    /**
     * Get all races with optional filters
     * Note: JWT token is automatically included via interceptor
     */
    static async getAllRaces(params: {
        eventId: string;
        searchCriteria?: RaceSearchRequest;
    }): Promise<SearchResponse<Race>> {
        const response = await apiClient.post<SearchResponse<Race>>(
            ServiceUrl.searchRaceService(params.eventId),
            params.searchCriteria || {}
        );
        return response.data;
    }

    /**
         * Get race by ID
         * Note: JWT token is automatically included via interceptor
         */
    static async getRaceById(eventId: string, id: string): Promise<ResponseBase<Race>> {
        const response: AxiosResponse<any> = await apiClient.get(
            ServiceUrl.getRaceById(eventId, id)
        );
        // API returns data wrapped in { message: {...}, totalCount: 0 }
        return response.data;
    }

    /**
         * Create new race
         * Note: JWT token is automatically included via interceptor
         */
    static async createRace(eventId: string, raceData: CreateRaceRequest): Promise<Race> {
        const response: AxiosResponse<Race> = await apiClient.post(
            ServiceUrl.createRace(eventId),
            raceData
        );
        return response.data;
    }

    /**
         * Update existing race using edit-race endpoint
         */
    static async updateRace(eventId: string, id: string, raceData: CreateRaceRequest): Promise<Race> {
        const response: AxiosResponse<Race> = await apiClient.put(
            ServiceUrl.editRace(eventId, id),
            raceData
        );
        return response.data;
    }

    /**
         * Delete event using delete-event endpoint
         * Note: JWT token is automatically included via interceptor
         */
    static async deleteRace(eventId: string, id: string): Promise<void> {
        await apiClient.delete(ServiceUrl.deleteRace(eventId, id));
    }
}
