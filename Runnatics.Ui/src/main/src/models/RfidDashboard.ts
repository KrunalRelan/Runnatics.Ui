// RFID Dashboard Aggregation Model

import { ReaderStatusDto } from './ReaderStatus';
import { ReaderAlertDto } from './ReaderAlert';

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
