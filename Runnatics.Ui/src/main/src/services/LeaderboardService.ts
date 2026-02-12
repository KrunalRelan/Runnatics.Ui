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
}
