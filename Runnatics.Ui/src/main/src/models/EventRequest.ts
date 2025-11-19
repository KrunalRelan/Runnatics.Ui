import { EventSettings } from "./EventSettings";
import { LeaderBoardSettings } from "./LeaderBoardSettings";

export interface EventRequest{
    eventOrganizerId?: string | null;
    name: string;
    description?: string;
    eventDate: Date | string;
    timeZone: string;
    venueName?: string;
    venueAddress?: string;
    venueLatitude?: number;
    venueLongitude?: number;
    status?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    bannerImageUrl?: string;
    smsText?: string;
    eventType?: string;
    eventSettings: EventSettings;
    leaderBoardSettings: LeaderBoardSettings;
}