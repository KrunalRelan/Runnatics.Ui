export interface Participant {
  id?: string;
  bib: string;
  name?: string; // For backwards compatibility with existing code
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender: string;
  category?: string;
  status?: 'Registered' | 'Pending' | 'Cancelled';
  checkIn?: boolean;
  chipId?: string;
  raceId?: string;
  eventId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
