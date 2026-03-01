// RFID Reading Detail from Results API
// Represents raw RFID tag reading data returned by the participant details endpoint

export interface RfidReadingDetail {
  readingId: number;
  readTimeUtc: string;
  readTimeLocal: string;
  checkpointName?: string;
  deviceName: string;
  gunTimeMs: number;
  gunTimeFormatted: string;
  netTimeMs: number;
  netTimeFormatted: string;
  chipId: string;
  isManualEntry: boolean;
}
