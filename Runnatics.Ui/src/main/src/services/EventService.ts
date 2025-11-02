import axios from 'axios';
import {CreateEventRequest, Event, EventOrganizer } from '../models';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const eventService = {
    // Create a new event
    async createEvent(data: CreateEventRequest): Promise<Event> {
        const response = await apiClient.post<Event>('/events', data);
        return response.data;
    },

    // Get all events for an organization
    async getEventsByOrganization(organizationId: number): Promise<Event[]> {
        const response = await apiClient.get<Event[]>(`/events/organization/${organizationId}`);
        return response.data;
    },

    // Get a single event by ID
    async getEventById(id: number): Promise<Event> {
        const response = await apiClient.get<Event>(`/events/${id}`);
        return response.data;
    },

    // Update an event
    async updateEvent(id: number, data: Partial<CreateEventRequest>): Promise<Event> {
        const response = await apiClient.put<Event>(`/events/${id}`, data);
        return response.data;
    },

    // Delete an event (soft delete)
    async deleteEvent(id: number): Promise<void> {
        await apiClient.delete(`/events/${id}`);
    },

    // Check if slug is available
    async checkSlugAvailability(organizationId: number, slug: string): Promise<boolean> {
        const response = await apiClient.get<{ available: boolean }>(
            `/events/check-slug/${organizationId}/${slug}`
        );
        return response.data.available;
    },

    // Get event organizers
    async getEventOrganizers(eventId: number): Promise<EventOrganizer[]> {
        const response = await apiClient.get<EventOrganizer[]>(`/events/${eventId}/organizers`);
        return response.data;
    },

    // Generate slug from name
    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Upload banner image
    async uploadBannerImage(eventId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('bannerImage', file);

        await apiClient.post(`/events/${eventId}/banner`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};