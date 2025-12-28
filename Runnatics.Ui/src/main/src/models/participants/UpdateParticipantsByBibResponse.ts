import { ProcessingError } from './ProcessingError';

export interface UpdateParticipantsByBibResponse {
  successCount: number;
  errorCount: number;
  notFoundCount: number;
  status: 'Completed' | 'PartiallyCompleted' | 'Failed';
  processedAt: string;
  errors: ProcessingError[];
  notFoundBibs: string[];
}
