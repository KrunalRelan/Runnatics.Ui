// RFID Tag Reading Data Structure
export interface RfidReading {
  id: string;
  bibNumber: string;
  checkpointId: string;
  checkpointName: string;
  readTime: string; // ISO timestamp when the RFID was read
  readDate: string; // Formatted date of the reading
  processResult: "Success" | "Failed" | "Pending" | "Duplicate" | "Invalid";
  manualTime?: string; // Manual time entry if needed (format: HH:MM:SS)
  chipId?: string;
  deviceId?: string;
  deviceName?: string;
  isManualEntry: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
