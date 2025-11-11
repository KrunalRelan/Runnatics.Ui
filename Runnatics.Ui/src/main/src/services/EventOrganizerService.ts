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
  
  static async createOrganization(eventOrganizerName:string): Promise<EventOrganizer> {
    const response = await apiClient.post<ResponseBase<EventOrganizer>>(ServiceUrl.createEventOrganizer(), { eventOrganizerName });
    
    // Handle both response structures: 
    // 1. Wrapped in message: { message: { id, tenantId, organizerName } }
    // 2. Direct: { id, tenantId, organizerName }
    const organizer = response.data.message || response.data;
    
    return organizer as EventOrganizer;
  }
}