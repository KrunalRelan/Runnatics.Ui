export interface ProcessImportRequest {
  importBatchId: string;
  eventId: string;
  raceId?: string;
  /** Opt-in (default false): send a "BIB assigned" SMS to each imported participant with a phone. */
  sendBibSms?: boolean;
}
