// Split time information model

export interface SplitTimeInfo {
  checkpointId: string | null;
  checkpointName: string | null;
  distance: string | null;
  distanceKm: number | null;
  splitTime: string | null;
  cumulativeTime: string | null;
  pace: string | null;
  paceValue: number | null;
  speed: number | null;
  overallRank: number | null;
  genderRank: number | null;
  categoryRank: number | null;
}
