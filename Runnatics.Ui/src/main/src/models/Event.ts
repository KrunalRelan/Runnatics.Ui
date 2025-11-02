import { EventStatus } from "./EventStatus";
import { EventType } from "./EventType";

export interface Event {
  id?: string;
  name: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  location: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  capacity: number;
  price: number;
  currency: string;
  status: EventStatus;
  bannerImageUrl?: string;
  organizerId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
