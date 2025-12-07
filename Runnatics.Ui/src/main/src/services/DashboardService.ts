import { apiClient } from '../utils/axios.config';
import { DashboardStatsResponse } from '../models/Dashboard/DashboardStatsResponse';
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
}