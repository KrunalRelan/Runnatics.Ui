// Participant detail data structure

import { Split } from './Split';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RfidReading } from './RfidReading';

export interface ParticipantDetailData {
  id: string;
  bib: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female";
  category: string;
  age: number;
  nationality: string;
  club?: string;
  raceName: string;
  raceDistance: number;
  eventName: string;
  // #4/#5 display statuses: the details endpoint sends the COMPUTED result status in
  // display form when a Results row exists ("OK"/"DNF"/"DNS"/"DSQ"); raw participant
  // statuses ("Registered", legacy "Running"/"Finished") appear only pre-processing.
  status: "OK" | "DSQ" | "Running" | "Finished" | "DNF" | "DNS" | "Registered";
  startTime: string;
  finishTime?: string;
  chipTime?: string;
  gunTime?: string;
  lastCheckpoint: string;
  lastCheckpointTime: string;
  currentPace: string;
  performance: PerformanceMetrics;
  splits: Split[];
  paceProgression?: {
    segment: string;
    distance: number;
    pace: string;
    speed: number;
  }[];
  rfidReadings?: RfidReading[];
}


