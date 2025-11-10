export interface SearchCriteria { 
    pageNumber: number;
    pageSize: number;
    sortFieldName?: string;
    sortDirection?: string;
    searchString?: string;
}

export const deafaultSearchCriteria: SearchCriteria = {
    pageNumber: 1,
    pageSize: 10,
    sortFieldName: "CreatedAt",
    sortDirection: "1",
    searchString: "",
};