import axios from 'axios';
import {  EventOrganizer, ServiceUrl } from '../models';
import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

const eventOrganizerApi = axios.create({
    baseURL: `${API_BASE_URL}/events`,
    headers: {
        'Content-Type': 'application/json',
    },
});

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