import { SearchCriteria } from '../SearchCriteria';

export interface CheckpointFilters extends SearchCriteria {
    name?: string;
    distanceFromStart?: number;
    deviceId?: string;
    parentDeviceId?: string;
    isMandatory?: boolean;
}

export const defaultCheckpointFilters: CheckpointFilters = {
    pageNumber: 1,
    pageSize: 25,
    sortFieldName: 'id',
    sortDirection: 1,
    searchString: ''
};
