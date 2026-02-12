/**
 * Request model for fetching leaderboard data
 */
export interface LeaderboardRequest {
  searchString?: string;
  sortFieldName?: string;
  sortDirection?: 'Ascending' | 'Descending';
  pageNumber: number;
  pageSize: number;
  eventId: string;
  raceId: string;
  rankBy?: string;
  gender?: string;
  category?: string;
  includeSplits?: boolean;
}
