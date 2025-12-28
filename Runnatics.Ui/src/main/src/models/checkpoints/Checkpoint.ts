export interface Checkpoint {
  id: string;
  name: string;
  deviceId: string;
  deviceName?: string; // Device name from API
  parentDeviceId?: string;
  parentDeviceName?: string; // Parent device name from API
  isMandatory: boolean;
  distanceFromStart?: number;
  // lastUpdateMode?: string;
}
