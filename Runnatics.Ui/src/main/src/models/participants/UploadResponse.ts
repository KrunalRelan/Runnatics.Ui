import { ValidationError } from './ValidationError';

export interface UploadResponse {
  importBatchId: number;
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  status: 'Validated' | 'PartiallyValidated' | 'Failed';
  errors: ValidationError[];
  uploadedAt: string;
}
