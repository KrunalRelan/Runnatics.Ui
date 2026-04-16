export interface ParticipantRequest {
  bibNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  category?: string;
  chipId?: string;
  checkIn?: boolean;
  status?: string;
  raceId?: string;
  disqualificationReason?: string;
  manualDistance?: number;
  loopCount?: number;
  manualTime?: string;
}
