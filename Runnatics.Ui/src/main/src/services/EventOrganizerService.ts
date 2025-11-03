import axios from 'axios';
import {  EventOrganizer, ServiceUrl } from '../models';

export class EventOrganizerService {
    /**
  * Get all organizations
  */
    static async getOrganizations(): Promise<EventOrganizer[]> {
        const response = await axios.get(ServiceUrl.getEventOrganizer());
        const items = Array.isArray(response.data) ? response.data : [response.data];
        return items;
    }
}