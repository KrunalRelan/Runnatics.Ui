/**
 * Validation error from RFID file upload
 */
export interface RFIDValidationError {
    rowNumber: number;
    field: string;
    message: string;
    value: string;
}
