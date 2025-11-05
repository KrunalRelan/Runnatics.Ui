// src/main/src/utils/axios.config.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config/environment';

// Token storage keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if you need to send cookies/credentials
    timeout: 30000, // 30 seconds timeout
});

// Helper functions for token management
export const tokenManager = {
    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken: (token: string): void => {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setRefreshToken: (token: string): void => {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },
    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

// Request interceptor - Adds Bearer token to all requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        const token = tokenManager.getToken();
        
        // Add Bearer token to Authorization header if token exists
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if ((import.meta as any).env?.DEV) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                headers: config.headers,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError) => {
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
                    // Unauthorized - clear tokens and redirect to login
                    tokenManager.clearTokens();
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
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
