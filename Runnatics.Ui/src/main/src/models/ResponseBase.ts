export interface ResponseBase<T> {
    message: T;
    totalCount?: number;
}