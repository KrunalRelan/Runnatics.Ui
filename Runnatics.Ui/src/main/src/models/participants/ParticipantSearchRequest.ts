import { SearchCriteria } from '../SearchCriteria';

export interface ParticipantSearchRequest extends SearchCriteria {
  status?: number; // RaceStatus enum value from backend
  category?: string;
}
