export interface CreateCheckpointRequest {
  name: string;
  deviceId: string; 
  parentDeviceId?: string;
  isMandatory: boolean;
  distanceFromStart?: number;
  lastUpdateMode?: string;
}
