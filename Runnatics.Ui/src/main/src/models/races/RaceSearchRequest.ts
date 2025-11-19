import { SearchCriteria } from "../SearchCriteria";

export interface RaceSearchRequest extends SearchCriteria {
    // eventId: number;
    title?: string;
    description?: string; 
    distance?: string; 
    startTime?: string; // Use string for ISO date format
    endTime?: string; // Use string for ISO date format
    maxParticipants?: number;
    status?: string;
}