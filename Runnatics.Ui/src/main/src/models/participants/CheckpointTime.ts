// Checkpoint time with ranking information

export interface CheckpointTime {
  checkpointId: string | null;
  checkpointName: string | null;
  distanceKm: number | null;
  time: string | null;
  overallRank: number | null;
  genderRank: number | null;
  categoryRank: number | null;
}
