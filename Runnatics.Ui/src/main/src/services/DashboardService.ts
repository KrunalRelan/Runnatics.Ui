import { apiClient } from '../utils/axios.config';
import { DashboardStatsResponse } from '../models/Dashboard/DashboardStatsResponse';
import { DashboardStatsDto } from '../models/Dashboard/DashboardStatsDto';
import { ResponseBase } from '../models/ResponseBase';
import { ServiceUrl } from '../models';

export class DashboardService {
    /**
     * Get dashboard statistics for an admin user
     * Note: JWT token is automatically included via interceptor
     */
    static async getDashboardStats(): Promise<DashboardStatsResponse> {
        const response = await apiClient.get<ResponseBase<DashboardStatsResponse>>(ServiceUrl.dashboardStats());
        return response.data.message || {};
    }

    static async getEventStats(eventId: string): Promise<DashboardStatsDto> {
        const response = await apiClient.get<ResponseBase<DashboardStatsDto>>(ServiceUrl.dashboardEventStats(eventId));
        return response.data.message || {} as DashboardStatsDto;
    }

    static async getRaceStats(eventId: string, raceId: string): Promise<DashboardStatsDto> {
        const response = await apiClient.get<ResponseBase<DashboardStatsDto>>(ServiceUrl.dashboardRaceStats(eventId, raceId));
        return response.data.message || {} as DashboardStatsDto;
    }
}