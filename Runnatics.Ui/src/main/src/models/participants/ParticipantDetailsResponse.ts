// Participant details response model

import { PerformanceOverview } from './PerformanceOverview';
import { RankingInfo } from './RankingInfo';
import { SplitTimeInfo } from './SplitTimeInfo';
import { PaceProgressionInfo } from './PaceProgressionInfo';
import { RfidReadingDetail } from './RfidReadingDetail';
import { CheckpointTime } from './CheckpointTime';

export interface ParticipantDetailsResponse {
  // Basic Information
  id: string | null;
  bibNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  initials: string | null;
  gender: string | null;
  age: number | null;
  ageCategory: string | null;
  club: string | null;
  status: string | null;

  // Contact Information
  email: string | null;
  phone: string | null;
  country: string | null;

  // Event Information
  eventId: string | null;
  eventName: string | null;
  raceId: string | null;
  raceName: string | null;
  raceDistance: number | null;

  // Timing Information
  chipTime: string | null;
  gunTime: string | null;
  startTime: string | null;
  finishTime: string | null;
  checkpointTimes: CheckpointTime[] | null;

  // Performance and Analytics
  performance: PerformanceOverview | null;
  rankings: RankingInfo | null;
  splitTimes: SplitTimeInfo[] | null;
  paceProgression: PaceProgressionInfo[] | null;

  // RFID Information
  epc: string | null;
  rfidReadings: RfidReadingDetail[] | null;
  processingNotes: string[] | null;
}
