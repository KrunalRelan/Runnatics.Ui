import { apiClient } from '../utils/axios.config';
import {  EventOrganizer, ServiceUrl } from '../models';
import { ResponseBase } from '../models/ResponseBase';

export class EventOrganizerService {
    /**
  * Get all organizations
  */
    static async getOrganizations(): Promise<EventOrganizer[]> {
        const response = await apiClient.get<ResponseBase<EventOrganizer[]>>(ServiceUrl.getEventOrganizer());
        const items = Array.isArray(response.data.message) ? response.data.message : [response.data.message];
        return items;
    }
}