import { SearchCriteria } from '../SearchCriteria';

export interface ParticipantSearchRequest extends SearchCriteria {
  // COMPUTED-status filter (contract 2026-07-07): display-form string — "OK" | "DNF" |
  // "DNS" | "DSQ" (null/"all" = no filter). The API maps OK→stored "Finished" and
  // DSQ→stored "DQ" and matches Results.Status — what the grid's Status column shows.
  status?: string | null;
  gender?: number | null;
  category?: string | null;
}
