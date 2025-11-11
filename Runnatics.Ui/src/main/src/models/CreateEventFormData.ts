import { EventStatus } from "./EventStatus";

export interface CreateEventFormData {
    // Basic Information
    name: string;
    slug: string;
    description: string;
    eventDate: string;
    timeZone: string;
    status: EventStatus;

    // Venue Information
    venueName: string;
    venueAddress: string;
    venueLatitude: string;
    venueLongitude: string;

    // Registration Settings
    maxParticipants: string;
    registrationDeadline: string;

    // Organizers
    organizers: { name: string }[];

    // Advanced Settings
    allowWaitlist: boolean;
    autoConfirmRegistrations: boolean;
    requireApproval: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  }