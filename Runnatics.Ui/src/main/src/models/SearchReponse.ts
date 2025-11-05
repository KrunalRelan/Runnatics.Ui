export interface SearchResponse<T>{
    totalCount: number;
    message: T[];
}