export interface RfidRawReadingDto {
  id: string;
  localTime: string;
  date: string;
  checkpoint?: string | null;
  checkpointDistance?: number | null;
  device: string;
  deviceId: string;
  gunTime?: string | null;
  netTime?: string | null;
  chipId: string;
  processResult: string;
  isManual: boolean;
  isDuplicate: boolean;
  isNormalized: boolean;
}
