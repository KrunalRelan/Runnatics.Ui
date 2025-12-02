export interface ParticipantRequest {
  bibNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  category?: string;
  chipId?: string;
  checkIn: boolean;
}
