/**
 * Represents a participant's result in a race with checkpoint crossing data
 */
export interface ParticipantResult {
  // Participant identification
  id: string;
  bib: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  gender: string;
  category: string;
  status: 'Registered' | 'Pending' | 'Cancelled' | 'Finished' | 'Running' | 'DNF' | 'DNS';
  checkedIn: boolean;
  chipId: string;

  // Race result data
  rank?: number | null;
  totalTime?: string | null; // HH:MM:SS format
  totalTimeSeconds?: number | null;
  averagePace?: string | null; // MM:SS per kilometer
  averageSpeed?: number | null; // km/h

  // Checkpoint times - key is checkpoint name, value is time string (HH:MM:SS)
  // May be null/undefined if participant has no checkpoint data
  checkpointTimes?: Record<string, string | null> | null;

  // Optional: Calculated checkpoint details
  checkpointDetails?: CheckpointCrossing[];
}

/**
 * Detailed information about a checkpoint crossing
 */
export interface CheckpointCrossing {
  checkpointName: string;
  crossingTime: string | null; // HH:MM:SS format
  crossingTimeSeconds: number | null;
  splitTime: string | null; // Time from previous checkpoint (HH:MM:SS)
  splitTimeSeconds: number | null;
  rank: number | null; // Rank at this checkpoint
  passed: boolean;
}
