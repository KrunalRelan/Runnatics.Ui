import { apiClient } from '../utils/axios.config';
import { DashboardStatsResponse } from '../models/Dashboard/DashboardStatsResponse';
import { DashboardStatsDto } from '../models/Dashboard/DashboardStatsDto';
import { ResponseBase } from '../models/ResponseBase';
import { ServiceUrl } from '../models';

// BUG-23: the backend event/race stats endpoints return
// { totalRegistered, totalFinishers, totalDnf, totalDns, ... }. Map that to the
// chart-friendly DashboardStatsDto the dashboards render (Total/Started/Finished/DNF).
interface RawDashboardStats {
    totalRegistered?: number;
    totalFinishers?: number;
    totalDnf?: number;
    totalDns?: number;
}

function mapDashboardStats(raw: RawDashboardStats | null | undefined): DashboardStatsDto {
    const registered = raw?.totalRegistered ?? 0;
    const finished = raw?.totalFinishers ?? 0;
    const dnf = raw?.totalDnf ?? 0;
    const dns = raw?.totalDns ?? 0;
    return {
        totalParticipants: registered,
        // "Started" = everyone with a start reading = registered minus did-not-start.
        totalStarted: Math.max(0, registered - dns),
        totalFinished: finished,
        totalDnfOrNotStarted: dnf + dns,
    };
}

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
        const response = await apiClient.get<ResponseBase<RawDashboardStats>>(ServiceUrl.dashboardEventStats(eventId));
        return mapDashboardStats(response.data.message);
    }

    static async getRaceStats(eventId: string, raceId: string): Promise<DashboardStatsDto> {
        const response = await apiClient.get<ResponseBase<RawDashboardStats>>(ServiceUrl.dashboardRaceStats(eventId, raceId));
        return mapDashboardStats(response.data.message);
    }
}