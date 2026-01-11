// RFID Reader Device and Status Models

export interface AntennaStatusDto {
  id: number;
  port: number;
  name: string | null;
  isEnabled: boolean;
  txPowerCdBm: number;
  position: string | null;
}

export interface ReaderStatusDto {
  id: number;
  name: string;
  serialNumber: string | null;
  ipAddress: string | null;
  isOnline: boolean;
  lastHeartbeat: string | null;
  cpuTemperatureCelsius: number | null;
  firmwareVersion: string | null;
  totalReadsToday: number;
  lastReadTimestamp: string | null;
  antennas: AntennaStatusDto[];
  unacknowledgedAlerts: number;
  checkpointName: string | null;
}
