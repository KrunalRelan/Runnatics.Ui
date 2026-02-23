// Checkpoint time with ranking information

export interface CheckpointTime {
  checkpointName: string | null;
  distanceKm: number | null;
  time: string | null;
  overallRank: number | null;
  genderRank: number | null;
  categoryRank: number | null;
}
