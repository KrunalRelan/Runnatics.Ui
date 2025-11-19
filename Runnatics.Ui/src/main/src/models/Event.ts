import { EventStatus } from "./EventStatus";
import { EventType } from "./EventType";
import { EventSettings } from "./EventSettings";
import { LeaderBoardSettings } from "./LeaderBoardSettings";

export interface Event {
  id?: string;
  tenantId?: string;
  name: string;
  slug?: string;
  description: string;
  eventType?: EventType;
  eventDate: Date | string; // API returns this field
  startDate?: Date; // Legacy field for backwards compatibility
  endDate?: Date;
  registrationOpenDate?: Date;
  registrationCloseDate?: Date;
  registrationDeadline?: Date | string; // API field
  timeZone?: string;
  venueName?: string; // API field
  venueAddress?: string; // API field
  venueLatitude?: number;
  venueLongitude?: number;
  location?: string; // Legacy field
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  capacity?: number;
  maxParticipants?: number; // API field
  price?: number;
  currency?: string;
  status: EventStatus | string;
  bannerImageUrl?: string;
  organizerId?: string;
  eventOrganizerName?: string; // API field - name of the organizer
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date;
  eventSettings?: EventSettings; // Properly typed
  leaderboardSettings?: LeaderBoardSettings; // Properly typed
}
