import { ServiceUrl } from "../models";
import { Checkpoint } from "../models/checkpoints/Checkpoint";
import { SearchResponse } from "../models/SearchReponse";
import { apiClient } from '../utils/axios.config';

export class CheckpointsService {
      
    /**
         * Get all checkpoints
         */
    static async getAllCheckpoints(params?: {
        eventId: string;
        raceId: string;
    }): Promise<SearchResponse<Checkpoint>> {
        const response = await apiClient.get<SearchResponse<Checkpoint>>(
            ServiceUrl.searchCheckpoints(params?.eventId!, params?.raceId!),
        );
        return response.data;
    }

    static async getCheckpointById(eventId: string, raceId: string, checkpointId: string): Promise<Checkpoint> {
        const response = await apiClient.get<Checkpoint>(
            ServiceUrl.getCheckpointById(eventId, raceId, checkpointId),
        );
        return response.data;
    }

    static async createCheckpoint(eventId: string, raceId: string, checkpointData: Partial<Checkpoint>): Promise<Checkpoint> {
        const response = await apiClient.post<Checkpoint>(
            ServiceUrl.addCheckpoint(eventId, raceId),
            checkpointData
        );
        return response.data;
    }

    static async updateCheckpoint(eventId: string, raceId: string, checkpointId: string, checkpointData: Partial<Checkpoint>): Promise<Checkpoint> {
        const response = await apiClient.put<Checkpoint>(
            ServiceUrl.editCheckpoint(eventId, raceId, checkpointId),
            checkpointData
        );
        return response.data;
    }

    static async cloneCheckpoints(eventId: string, sourceRaceId: string, destinationRaceId: string): Promise<Checkpoint> {
        const response = await apiClient.post(
            ServiceUrl.cloneCheckpoints(eventId, sourceRaceId, destinationRaceId),
        );
        return response.data;
    }

    static async deleteCheckpoint(eventId: string, raceId: string, checkpointId: string): Promise<void> {
        await apiClient.delete(
            ServiceUrl.deleteCheckpoint(eventId, raceId, checkpointId)
        );
    }
}