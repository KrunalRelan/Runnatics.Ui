
import { RaceSettings } from './RaceSettings'; // Adjust the path as needed

export interface Race {
    id: string;
    eventId?: number;
    title: string;
    description: string;
    distance?: string;
    startTime: Date | string;
    endTime?: Date | string;
    maxParticipants?: number;
    smsEnabled: boolean;
    checkPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    isActive: boolean;
    raceSettings?: RaceSettings; // Properly typed
    event?: Event; // Properly typed
}

