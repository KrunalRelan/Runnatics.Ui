export interface DetectionRowDto {
  readingId: string;
  readTimeUtc: string;
  deviceId: string;
  readerName: string;
  rssiDbm: number | null;
  processResult: string;
  manualTime: string | null;
  isManualEntry: boolean;
  notes: string | null;
}
export interface CheckpointDetectionGroupDto {
  checkpointId: string;
  checkpointName: string;
  isMandatory: boolean;
  detections: DetectionRowDto[];
}
export interface ParticipantDetectionsResponse {
  participantId: string;
  bib: string;
  fullName: string;
  gender: string;
  manualDistance: number | null;
  checkpoints: CheckpointDetectionGroupDto[];
}
