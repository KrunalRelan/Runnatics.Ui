// Split checkpoint data structure

export interface Split {
  checkpointId: string;
  checkpointName: string;
  distance: number;
  splitTime: string;
  cumulativeTime: string;
  pace: string;
  speed: number;
  rank: number;
  genderRank: number;
  categoryRank: number;
}
