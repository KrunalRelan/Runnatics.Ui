/**
 * Response model for leaderboard data
 */
export interface LeaderboardResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  rankBy: string;
  gender: string;
  category: string;
  results: LeaderboardResult[];
  displaySettings?: LeaderboardDisplaySettings;
}

/**
 * Display settings returned by the API to control UI visibility
 */
export interface LeaderboardDisplaySettings {
  showOverallResults: boolean;
  showCategoryResults: boolean;
  showGenderResults: boolean;
  showAgeGroupResults: boolean;
  showSplitTimes: boolean;
  showPace: boolean;
  showDnf: boolean;
  showMedalIcon: boolean;
  rankOnNet: boolean;
  sortTimeField: string;
  maxResultsOverall: number;
  maxResultsCategory: number;
  maxDisplayedRecords: number;
}

/**
 * Individual participant result in the leaderboard
 */
export interface LeaderboardResult {
  rank: number;
  participantId: string;
  bib: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  category: string;
  age: number;
  city: string;
  finishTimeMs: number;
  gunTimeMs: number;
  netTimeMs: number;
  finishTime: string;
  gunTime: string;
  netTime: string;
  overallRank: number;
  genderRank: number;
  categoryRank: number;
  averagePace: number;
  averagePaceFormatted: string;
  status: string;
  splits?: LeaderboardSplit[];
}

/**
 * Split/checkpoint timing data within a leaderboard result
 */
export interface LeaderboardSplit {
  checkpointId: string;
  checkpointName: string;
  distanceKm: number;
  splitTimeMs: number;
  segmentTimeMs: number;
  splitTime: string;
  segmentTime: string;
  pace: number;
  paceFormatted: string;
  rank: number;
  genderRank: number;
  categoryRank: number;
}
