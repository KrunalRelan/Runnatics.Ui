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
  /** When true, a completion SMS auto-sends as each runner finishes. Default false. */
  autoSendCompletionSms?: boolean;
  createdAt?: string;
}