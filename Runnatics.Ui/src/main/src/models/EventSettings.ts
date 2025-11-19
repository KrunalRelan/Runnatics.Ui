export interface EventSettings {
  id?: string;
  eventId?: string;
  removeBanner: boolean;
  published: boolean;  // This is the field from the API response
  rankOnNet: boolean;
  showResultSummaryForRaces: boolean;
  useOldData: boolean;
  confirmedEvent: boolean;
  allowNameCheck: boolean;
  allowParticipantEdit: boolean;
  createdAt?: string;
}