/**
 * Filters for race results display
 */
export interface RaceResultFilters {
  category?: string;
  gender?: string;
  status?: 'All' | 'Finished' | 'Running' | 'DNF' | 'DNS';
  searchText?: string; // Search by name or bib
}
