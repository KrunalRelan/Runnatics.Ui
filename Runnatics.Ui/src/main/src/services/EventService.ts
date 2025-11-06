// src/main/src/services/EventService.ts

import { AxiosResponse } from 'axios';
import { Event, CreateEventRequest, ServiceUrl } from '../models';

import { SearchResponse } from '../models/SearchReponse';
import { apiClient } from '../utils/axios.config';
import { EventSearchRequest } from '../models/EventSearchRequest';

// Use the centralized apiClient with JWT interceptor
// All requests will automatically include the Bearer token

export class EventService {
    /**
     * Get all events with optional filters
     * Note: JWT token is automatically included via interceptor
     */
    static async getAllEvents(params?: {
       searchCriteria?: EventSearchRequest;
    }): Promise<SearchResponse<Event>> {
        const response = await apiClient.post<SearchResponse<Event>>(
            ServiceUrl.searchEventService(), 
            params?.searchCriteria
        );
        return response.data;
    }

    /**
     * Get event by ID
     * Note: JWT token is automatically included via interceptor
     */
    static async getEventById(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await apiClient.get(`/events/${id}`);
        return response.data;
    }
    
    /**
     * Create new event
     * Note: JWT token is automatically included via interceptor
     */
    static async createEvent(eventData: CreateEventRequest): Promise<Event> {
        const response: AxiosResponse<Event> = await apiClient.post(
            ServiceUrl.createEvent(), 
            eventData
        );
        return response.data;
    }

    /**
     * Update existing event
     * Note: JWT token is automatically included via interceptor
     */
    static async updateEvent(id: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
        const response: AxiosResponse<Event> = await apiClient.put(`/events/${id}`, eventData);
        return response.data;
    }

    /**
     * Delete event
     * Note: JWT token is automatically included via interceptor
     */
    static async deleteEvent(id: string): Promise<void> {
        await apiClient.delete(`/events/${id}`);
    }

    /**
     * Upload event banner image
     * Note: JWT token is automatically included via interceptor
     */
    static async uploadBannerImage(eventId: string, file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<{ imageUrl: string }> = await apiClient.post(
            `/events/${eventId}/banner`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.imageUrl;
    }

    /**
     * Publish event (change status to published)
     * Note: JWT token is automatically included via interceptor
     */
    static async publishEvent(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await apiClient.post(`/events/${id}/publish`);
        return response.data;
    }

    /**
     * Cancel event
     * Note: JWT token is automatically included via interceptor
     */
    static async cancelEvent(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await apiClient.post(`/events/${id}/cancel`);
        return response.data;
    }
}