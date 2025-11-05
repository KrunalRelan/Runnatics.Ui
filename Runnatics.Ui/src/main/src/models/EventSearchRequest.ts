// src/models/EventSearchRequest.ts
import { SearchCriteria } from "./SearchCriteria";

export interface EventSearchRequest extends SearchCriteria {
    id?: number;
    name?: string;
    eventDateTo?: string; // Use string for ISO date format
    eventDateFrom?: string; // Use string for ISO date format
    status?: string;
}