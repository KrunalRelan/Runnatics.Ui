export interface SearchResponse<T>{
    totalRecords: number;
    totalPages: number;
    totalCount: number;
    message: T[];
}