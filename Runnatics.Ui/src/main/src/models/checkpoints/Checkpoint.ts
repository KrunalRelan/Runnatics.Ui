export interface Checkpoint {
  id: string;
  name: string;
  deviceId: string; 
  parentDeviceId?: string;
  isMandatory: boolean;
  distanceFromStart?: number;
  // lastUpdateMode?: string;
}
