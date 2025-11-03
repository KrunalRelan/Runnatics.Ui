import { EventSettings } from "./EventSettings";
import { EventType } from "./EventType";
import { LeaderBoardSettings } from "./LeaderBoardSettings";

export interface CreateEventRequest {
  organizationId?: string | null;
  name: string;
  description: string;
  eventType: EventType;
  startDate: string; // ISO string format
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  location: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  capacity: number;
  price: number;
  currency: string;
  bannerImageUrl?: string;
  timeZone: string;
  smsText?: string;
  leaderBoardSettings?: LeaderBoardSettings;
  eventSettings?: EventSettings;
}