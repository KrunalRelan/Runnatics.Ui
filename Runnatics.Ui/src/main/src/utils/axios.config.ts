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
    withCredentials: false,
    timeout: 30000,
});

// Separate axios instance used ONLY for refresh-token calls.
// This bypasses the response interceptor and avoids infinite retry loops.
const refreshClient = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
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

// --- Refresh token queue ---
// If multiple requests fail with 401 at the same time, we queue them
// and replay them all once a single refresh call completes.
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    if (window.location.pathname !== '/login') {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.setItem('returnUrl', currentPath);
        window.location.href = '/login';
    }
};

// Request interceptor — attach Bearer token to every request
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh + retry
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // No response at all — network / CORS error
        if (!error.response) {
            error.userMessage =
                'Unable to connect to the server. Please check:\n' +
                '1. Is the backend server running?\n' +
                '2. Is CORS configured on the backend?\n' +
                '3. Is the API URL correct?';
            return Promise.reject(error);
        }

        const { status } = error.response;

        // --- 401 handling: attempt silent token refresh ---
        if (status === 401 && !originalRequest._retry) {
            // If the refresh endpoint itself returned 401, give up immediately
            if (originalRequest.url?.includes('/authentication/refresh-token')) {
                tokenManager.clearTokens();
                redirectToLogin();
                return Promise.reject(error);
            }

            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const storedRefreshToken = tokenManager.getRefreshToken();

            // No refresh token stored — go straight to login
            if (!storedRefreshToken) {
                isRefreshing = false;
                tokenManager.clearTokens();
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                // Use the dedicated refreshClient so this call is NOT intercepted
                const refreshResponse = await refreshClient.post<{ token: string }>(
                    '/authentication/refresh-token',
                    { refreshToken: storedRefreshToken }
                );

                const newToken = refreshResponse.data?.token;
                if (!newToken) throw new Error('Refresh response did not contain a token');

                tokenManager.setToken(newToken);

                // Replay all queued requests with the new token
                processQueue(null, newToken);

                // Retry the original failed request
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed — reject all queued requests and force re-login
                processQueue(refreshError, null);
                tokenManager.clearTokens();
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                redirectToLogin();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // --- Other error status codes ---
        switch (status) {
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
                error.userMessage = (error.response.data as any)?.message || 'An error occurred.';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
