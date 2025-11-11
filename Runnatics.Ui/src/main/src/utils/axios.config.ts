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

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle different error types
        if (!error.response) {
            // Network error or CORS error
            error.userMessage = 'Unable to connect to the server. Please check:\n' +
                '1. Is the backend server running?\n' +
                '2. Is CORS configured on the backend?\n' +
                '3. Is the API URL correct?';
        } else {
            // Server responded with error
            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    error.userMessage = 'Authentication failed. Please check your credentials or login again.';
                    
                    // Session expired - redirect to login with return URL
                    // Only redirect if not already on login page
                    if (window.location.pathname !== '/login') {
                        const currentPath = window.location.pathname + window.location.search;
                        
                        // Clear tokens
                        tokenManager.clearTokens();
                        
                        // Clear any user data from localStorage
                        localStorage.removeItem('user');
                        localStorage.removeItem('userRole');
                        
                        // Save the return URL (where user was trying to go)
                        localStorage.setItem('returnUrl', currentPath);
                        
                        // Redirect to login page
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
