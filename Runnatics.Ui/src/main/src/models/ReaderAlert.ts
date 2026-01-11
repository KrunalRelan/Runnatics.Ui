// RFID Reader Alert Models and Enums

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
