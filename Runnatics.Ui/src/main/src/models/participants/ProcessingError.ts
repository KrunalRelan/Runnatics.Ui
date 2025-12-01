export interface ProcessingError {
  stagingId: number;
  rowNumber: number;
  bib: string;
  name: string;
  errorMessage: string;
}
