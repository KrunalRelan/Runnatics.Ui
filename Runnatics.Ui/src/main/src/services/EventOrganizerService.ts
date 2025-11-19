import { apiClient } from '../utils/axios.config';
import {  EventOrganizer, ServiceUrl } from '../models';
import { ResponseBase } from '../models/ResponseBase';
import { EventOrganizerRequest } from '../models/EventOrganizerRequest';
import { EventOrganizerResponse } from '../models/EventOrganizerResponse';

export class EventOrganizerService {
    /**
  * Get all organizations
  */
    static async getOrganizations(): Promise<EventOrganizer[]> {
        const response = await apiClient.get<ResponseBase<EventOrganizer[]>>(ServiceUrl.getEventOrganizer());
        const items = Array.isArray(response.data.message) ? response.data.message : [response.data.message];
        return items;
    }

  static async createOrganization(request: EventOrganizerRequest): Promise<EventOrganizerResponse> {
        const response = await apiClient.post<EventOrganizerResponse>(ServiceUrl.createEventOrganizer(), request);
        return response.data;
    }
}