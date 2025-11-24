import { ProcessingError } from './ProcessingError';

export interface ProcessResponse {
  importBatchId: number;
  successCount: number;
  errorCount: number;
  status: 'Completed' | 'PartiallyCompleted' | 'Failed' | 'Processing';
  processedAt: string;
  errors: ProcessingError[];
}
