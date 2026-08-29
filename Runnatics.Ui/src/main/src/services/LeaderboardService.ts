import { ServiceUrl } from '../models';
import { apiClient } from '../utils/axios.config';
import { AxiosResponse } from 'axios';
import { ResponseBase } from '../models/ResponseBase';
import { LeaderboardRequest, LeaderboardResponse } from '../models/leaderboard';

/** Result of a single-participant test completion SMS. */
export interface TestResultsSms {
  /** Masked destination actually used. */
  recipient: string;
  /** True when the override phone was used rather than the participant's stored number. */
  usedOverridePhone: boolean;
  success: boolean;
  /** MSG91's id for the send — the key to find this message in their dashboard. */
  providerMessageId?: string | null;
  errorMessage?: string | null;
  /** var1 — participant name with bib, e.g. "Deepender[1244]". */
  nameWithBib: string;
  /** var2 — finish time as sent. */
  finishTime: string;
  /** var3 — race title as sent. */
  raceTitle: string;
}

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

  /**
   * Manual "Send Results SMS": queue a completion SMS to every finished participant in the race.
   * Returns immediately; the server drains the queue in the background (dedupe prevents double-sends).
   */
  static async sendResultsSms(
    eventId: string,
    raceId: string,
  ): Promise<ResponseBase<{ finishedCount: number; queuedCount: number; skippedCount: number }>> {
    const response: AxiosResponse<
      ResponseBase<{ finishedCount: number; queuedCount: number; skippedCount: number }>
    > = await apiClient.post(ServiceUrl.sendResultsSms(eventId, raceId), null);
    return response.data;
  }

  /**
   * Send ONE test completion SMS for a single participant, to check the message content and the
   * provider correlation without messaging a whole race. The server logs it as
   * "RaceCompletionTest", so it never suppresses that participant's real results SMS.
   * Pass overridePhone to send to your own handset instead of the participant's number.
   */
  static async sendTestResultsSms(
    eventId: string,
    raceId: string,
    participantId: string,
    overridePhone?: string,
  ): Promise<ResponseBase<TestResultsSms>> {
    const response: AxiosResponse<ResponseBase<TestResultsSms>> = await apiClient.post(
      ServiceUrl.sendTestResultsSms(eventId, raceId, participantId),
      { overridePhone: overridePhone?.trim() || null },
    );
    return response.data;
  }
}
