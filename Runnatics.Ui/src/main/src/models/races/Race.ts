import { RaceSettings } from './RaceSettings';
import { Event } from '../Event';
import { Participant } from './Participant';

export interface Race {
    id: string;
    eventId?: string;
    title: string;
    description: string;
    distance?: number;
    startTime: Date | string;
    endTime?: Date | string;
    maxParticipants?: number;
    smsEnabled: boolean;
    checkPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    isActive: boolean;
    raceSettings?: RaceSettings;
    event?: Event;
    participants?: Participant[];
}

