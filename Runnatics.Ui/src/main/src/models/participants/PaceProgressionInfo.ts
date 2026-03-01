// Pace progression information model

export interface PaceProgressionInfo {
  segment: string | null;
  pace: string | null;
  paceValue: number | null;
  speed: number | null;
  splitTime: string | null;
  distanceKm: number | null;
  paceChangeDirection: string | null;
  paceChangePercent: number | null;
}
