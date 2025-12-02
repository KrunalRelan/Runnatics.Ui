export interface Checkpoint {
  id?: string;
  name: string;
  deviceName: string; 
  mandatory?: string;
  distanceFromStart?: string;
  lastUpdateMode?: string;
}
