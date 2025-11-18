import { RaceSettings } from "./raceSettings";

export interface CreateRaceRequest {
  title: string;
  description?: string;
  distance: number;
  startTime: string; // ISO string format
  endTime: string;
  maxParticipants?: number;
  raceSettings?: RaceSettings;
}