// src/main/src/services/EventService.ts

import axios, { AxiosResponse } from 'axios';
import { Event, CreateEventRequest, ServiceUrl } from '../models';
import config from '../config/environment';
import { SearchCriteria } from '../models/SearchCirteria';
import { SearchReponse } from '../models/SearchReponse';

const API_BASE_URL = config.apiBaseUrl;

const eventApi = axios.create({
    baseURL: `${API_BASE_URL}/events`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if you need to send cookies
});

// Add auth token interceptor
eventApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
eventApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log CORS errors
        if (!error.response) {
            console.error('Network Error (possibly CORS):', {
                message: error.message,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                }
            });
        }
        
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export class EventService {
    /**
     * Get all events with optional filters
     */
    static async getAllEvents(params?: {
       searchCriteria?: SearchCriteria;
    }): Promise<SearchReponse<Event>> {
        return axios.post<SearchReponse<Event>>(ServiceUrl.searchEventService(), params?.searchCriteria)
            .then(response => response.data);
    }

    /**
     * Get event by ID
     */
    static async getEventById(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await eventApi.get(`/${id}`);
        return response.data;
    }
    /**
     * Create new event
     */
    static async createEvent(eventData: CreateEventRequest): Promise<Event> {
        const response: AxiosResponse<Event> = await eventApi.post(ServiceUrl.createEvent(), eventData);
        return response.data;
    }

    /**
     * Update existing event
     */
    static async updateEvent(id: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
        const response: AxiosResponse<Event> = await eventApi.put(`/${id}`, eventData);
        return response.data;
    }

    /**
     * Delete event
     */
    static async deleteEvent(id: string): Promise<void> {
        await eventApi.delete(`/${id}`);
    }

    /**
     * Upload event banner image
     */
    static async uploadBannerImage(eventId: string, file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<{ imageUrl: string }> = await eventApi.post(
            `/${eventId}/banner`,
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
     */
    static async publishEvent(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await eventApi.post(`/${id}/publish`);
        return response.data;
    }

    /**
     * Cancel event
     */
    static async cancelEvent(id: string): Promise<Event> {
        const response: AxiosResponse<Event> = await eventApi.post(`/${id}/cancel`);
        return response.data;
    }
}