import { LeaderBoardSettings } from "../LeaderBoardSettings";
import { RaceSettings } from "./RaceSettings";

export interface CreateRaceRequest {
  title: string;
  description?: string;
  distance: number;
  startTime: string; // ISO string format
  endTime: string;
  maxParticipants?: number;
  overrideSettings?: boolean;
  raceSettings?: RaceSettings;
  leaderboardSettings?: LeaderBoardSettings;
}