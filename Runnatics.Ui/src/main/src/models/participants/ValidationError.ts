export interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
  value: string;
}
