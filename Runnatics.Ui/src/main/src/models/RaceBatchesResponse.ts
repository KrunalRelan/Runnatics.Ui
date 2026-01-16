import { FileUploadStatusDto } from './FileUploadStatusDto';

export interface RaceBatchesResponse {
  batches: FileUploadStatusDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
