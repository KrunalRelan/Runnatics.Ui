// RFID Reader Models and Enums

export enum ReaderAlertType {
  Offline = 1,
  HighTemperature = 2,
  LowReadRate = 3,
  AntennaDisconnected = 4,
  NetworkIssue = 5,
  MemoryFull = 6,
  FirmwareUpdateAvailable = 7
}

export enum AlertSeverity {
  Info = 1,
  Warning = 2,
  Critical = 3
}

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

export interface ReaderAlertDto {
  id: number;
  readerDeviceId: number;
  readerName: string;
  alertType: ReaderAlertType;
  alertTypeText: string;
  severity: AlertSeverity;
  severityText: string;
  message: string;
  isAcknowledged: boolean;
  acknowledgedByUserName: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface RfidDashboardDto {
  totalReaders: number;
  onlineReaders: number;
  offlineReaders: number;
  totalReadsToday: number;
  pendingUploads: number;
  processingUploads: number;
  unacknowledgedAlerts: number;
  readers: ReaderStatusDto[];
  recentAlerts: ReaderAlertDto[];
  recentUploads: any[];
}
