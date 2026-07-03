export interface Participant {
  id?: string;
  bib: string;
  name?: string; // For backwards compatibility with existing code
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender: string;
  category?: string;
  // #7/#5 (2026-07-03): 'OK' and 'DSQ' are the DISPLAY statuses the API sends for the stored
  // 'Finished'/'DQ' — run status is computed; only DSQ is manually settable.
  status?: 'Registered' | 'Pending' | 'Cancelled' | 'Started' | 'Finished' | 'DNF' | 'DNS' | 'DQ' | 'OK' | 'DSQ';
  dateOfBirth?: string;
  ageCategory?: string;
  checkIn?: boolean;
  chipId?: string;
  raceId?: string;
  eventId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Checkpoint times - key is checkpoint name, value is time string (HH:MM:SS) or null
  checkpointTimes?: Record<string, string | null> | null;
  gunTime?: string | null;
  netTime?: string | null;
  overallRank?: number | null;
  genderRank?: number | null;
  categoryRank?: number | null;
  manualDistance?: number | null;
  epcMapped?: boolean;
}
