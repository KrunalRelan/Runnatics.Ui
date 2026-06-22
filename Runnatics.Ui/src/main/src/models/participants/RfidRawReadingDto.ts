export interface RfidRawReadingDto {
  id: string;
  localTime: string;
  date: string;
  checkpoint?: string | null;
  /** Encrypted id of the checkpoint this read is assigned to (null if unassigned). Drives the
   *  "set as crossing" toggle, which targets the override API for the read's OWN checkpoint. */
  checkpointId?: string | null;
  /** True when this read's checkpoint has an active manual override. With isNormalized: a current
   *  pick that is an override (hasActiveOverride) vs the dedup default (isNormalized && !hasActiveOverride)
   *  — so cycling back to the auto pick becomes a revert (DELETE) instead of a redundant override. */
  hasActiveOverride: boolean;
  checkpointDistance?: number | null;
  device: string;
  deviceId: string;
  gunTime?: string | null;
  netTime?: string | null;
  chipId: string;
  processResult: string;
  isManual: boolean;
  isDuplicate: boolean;
  isNormalized: boolean;
}
