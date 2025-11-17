import { RaceSettings } from "./raceSettings";

export interface CreateRaceRequest {
  eventId?: number | null;
  title: string;
  description: string;
  distance: number;
  startTime: string; // ISO string format
  endTime: string;
  maxParticipants?: number;
  raceSettings?: RaceSettings;
}