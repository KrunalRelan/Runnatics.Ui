import { SearchCriteria } from '../SearchCriteria';

export interface ParticipantFilters extends SearchCriteria {
  nameOrBib?: string;
  status?: string;
  gender?: string;
  category?: string;
}

export const defaultParticipantFilters: ParticipantFilters = {
  pageNumber: 1,
  pageSize: 25,
  sortFieldName: 'bib',
  sortDirection: 1,
  searchString: '',
  nameOrBib: '',
  status: 'all',
  gender: 'all',
  category: 'all',
};
