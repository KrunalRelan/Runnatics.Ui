// ============================================================================
// File: models/Dashboard/EventRaceBreakdown.ts
// Purpose: Numeric dashboard for the event -> races landing page (replaces the
//          old progress pie chart). One metric set, used at BOTH event level
//          (headline totals) and per race (tiles).
//
// Statuses originate from the STORED Results.Status the grid / export / public
// site read ("Finished", "DNF", "DNS", "DQ"), surfaced here under their display
// names (OK, DSQ) — NOT the legacy Participant.Status field.
// ============================================================================

export interface EventRaceCounts {
  /** Registered participants (active, not deleted). */
  registered: number;
  /** Participants holding a live chip assignment. */
  epcMapped: number;
  /** registered - epcMapped */
  epcNotMapped: number;
  /** Results.Status === "Finished", displayed as OK. */
  finishedOk: number;
  dnf: number;
  dns: number;
  /** Results.Status === "DQ", displayed as DSQ. */
  dsq: number;
  /**
   * Derived server-side as registered - (finishedOk + dnf + dns + dsq), so the
   * buckets always sum to registered. Covers "no result row yet" and any stray
   * stored status outside the four known values.
   */
  notProcessed: number;
}

export interface RaceStatItem {
  /** Encrypted race id — safe to use directly in routes. */
  raceId: string;
  raceName: string;
  registered: number;
  finishers: number;
  dnf: number;
  counts: EventRaceCounts;
}

export interface EventRaceBreakdown {
  eventId: string;
  eventName: string;
  /** Exact sum of raceStats[].counts — headline row can't disagree with the tiles. */
  totals: EventRaceCounts;
  raceStats: RaceStatItem[];
}

/** Zeroed counts — used as the fallback for a malformed/absent payload. */
export const EMPTY_COUNTS: EventRaceCounts = {
  registered: 0,
  epcMapped: 0,
  epcNotMapped: 0,
  finishedOk: 0,
  dnf: 0,
  dns: 0,
  dsq: 0,
  notProcessed: 0,
};
