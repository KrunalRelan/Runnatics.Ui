// Checkpoint time with ranking information

export interface CheckpointTime {
  checkpointId: string | null;
  checkpointName: string | null;
  distanceKm: number | null;
  time: string | null;
  // Full event-local crossing datetime ("yyyy-MM-ddTHH:mm:ss"), or null if not crossed.
  // The manual-time editor pre-fills DATE + time from this.
  localDateTime: string | null;
  overallRank: number | null;
  genderRank: number | null;
  categoryRank: number | null;
}
