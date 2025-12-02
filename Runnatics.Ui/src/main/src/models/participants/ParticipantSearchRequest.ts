import { SearchCriteria } from '../SearchCriteria';

export interface ParticipantSearchRequest extends SearchCriteria {
  status?: number | null; // RaceStatus enum value from backend
  gender?: number | null;
  category?: string | null;
}
