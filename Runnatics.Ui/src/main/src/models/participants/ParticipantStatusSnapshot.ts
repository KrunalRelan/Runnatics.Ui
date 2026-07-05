/** Commit-f snapshot returned by status-changing edits (DSQ apply / un-DSQ): the COMPLETE
 *  post-recompute result, reloaded server-side AFTER the race-wide re-rank — display status
 *  ("OK"/"DNF"/"DNS"/"DSQ"), stored times, ranks (null when unranked) and TotalFinishers.
 *  Render from this; never assume what the classifier decided. */
export interface ParticipantStatusSnapshot {
  id?: string | null;
  bib?: string | null;
  status?: string | null;
  gunTime?: string | null;
  netTime?: string | null;
  overallRank?: number | null;
  genderRank?: number | null;
  categoryRank?: number | null;
  totalFinishers?: number | null;
}
