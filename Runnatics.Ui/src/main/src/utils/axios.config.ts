// src/main/src/utils/axios.config.ts

import axios from 'axios';
import config from '../config/environment';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if you need to send cookies/credentials
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if ((import.meta as any).env?.DEV) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if ((import.meta as any).env?.DEV) {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }
        return response;
    },
    (error) => {
        // Handle different error types
        if (!error.response) {
            // Network error or CORS error
            console.error('🚫 Network/CORS Error:', {
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
            });
            
            // Create user-friendly error message
            error.userMessage = 'Unable to connect to the server. Please check:\n' +
                '1. Is the backend server running?\n' +
                '2. Is CORS configured on the backend?\n' +
                '3. Is the API URL correct?';
        } else {
            // Server responded with error
            console.error('❌ API Error:', {
                status: error.response.status,
                url: error.config?.url,
                data: error.response.data,
            });

            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Unauthorized - redirect to login
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    break;
                case 403:
                    error.userMessage = 'You do not have permission to perform this action.';
                    break;
                case 404:
                    error.userMessage = 'The requested resource was not found.';
                    break;
                case 500:
                    error.userMessage = 'Server error. Please try again later.';
                    break;
                default:
                    error.userMessage = error.response.data?.message || 'An error occurred.';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
