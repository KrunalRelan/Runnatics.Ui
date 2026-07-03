/** ASSIGN-THEN-CHOOSE: a gate an UNASSIGNED read may be chosen for (server-resolved from the
 *  read's device — the same resolution the save-time validation enforces, so the UI can never
 *  offer a gate the server would reject). */
export interface ChoosableCheckpointDto {
  /** Encrypted checkpoint id — passed as the manual-time target on save. */
  id: string;
  /** Display name, e.g. "Start (0 km)". */
  name: string;
}

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
  /** For an UNASSIGNED read: the candidate gates it may be chosen for. Null/undefined for
   *  assigned reads; empty when the device is not mapped in this race (toggle stays locked);
   *  one entry → auto-target; several (shared start/finish mat) → inline gate picker. */
  choosableCheckpoints?: ChoosableCheckpointDto[] | null;
}
