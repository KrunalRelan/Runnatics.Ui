import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { ResponseBase } from '../models/ResponseBase';
import { LeaderboardRequest, LeaderboardResponse } from '../models/leaderboard';

/**
 * Service for leaderboard API operations.
 * Follows Single Responsibility: only handles leaderboard data fetching.
 */
export class LeaderboardService {
  /**
   * Fetch leaderboard data for a given event and race.
   */
  static async getLeaderboard(
    request: LeaderboardRequest
  ): Promise<ResponseBase<LeaderboardResponse>> {
    const response: AxiosResponse<ResponseBase<LeaderboardResponse>> =
      await apiClient.post(
        ServiceUrl.getLeaderboard(),
        request
      );
    return response.data;
  }

  /**
   * Export leaderboard results as Excel (.xlsx).
   * Honours all leaderboard display settings (columns, splits, pace, DNF, rank type).
   */
  static async exportLeaderboard(
    eventId: string,
    raceId: string,
    rankBy: string = 'Overall',
    gender?: string,
    category?: string,
  ): Promise<Blob> {
    const params: Record<string, string> = { rankBy };
    if (gender) params.gender = gender;
    if (category) params.category = category;

    const response = await apiClient.get(
      ServiceUrl.exportLeaderboard(eventId, raceId),
      { params, responseType: 'blob' },
    );
    return response.data;
  }
}
