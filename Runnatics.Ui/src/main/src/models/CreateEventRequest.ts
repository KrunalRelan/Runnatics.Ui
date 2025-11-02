import { EventType } from "react-hook-form";

export interface CreateEventRequest {
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
}