// src/main/src/services/AuthService.ts

import { apiClient, tokenManager } from '../utils/axios.config';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterOrganizationRequest } from '../models/Auth';
import { ServiceUrl } from '../models/ServiceUrls';
import { encryptPassword } from '../utils/encryption';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
    /**
     * Login user and store JWT token
     * @param credentials - User login credentials
     * @returns Login response with token and user data
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const payload: LoginRequest = {
                email: credentials.email,
                password: await encryptPassword(credentials.password),
            };
            const response = await apiClient.post<LoginResponse>(ServiceUrl.login(), payload);

            // Store the JWT token in localStorage
            if (response.data.message.token) {
                tokenManager.setToken(response.data.message.token);
            }
            
            // Store refresh token if available
            if (response.data.message.refreshToken) {
                tokenManager.setRefreshToken(response.data.message.refreshToken);
            }
            
            // Store user data
            if (response.data.message.user) {
                localStorage.setItem('user', JSON.stringify(response.data.message.user));
            }
            
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Register new user
     * @param userData - User registration data
     * @returns Login response with token and user data
     */
    async register(userData: RegisterRequest | RegisterOrganizationRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>('/authentication/register-organization', userData);
            
            // Store the JWT token in localStorage
            if (response.data.message.token) {
                tokenManager.setToken(response.data.message.token);
            }
            
            // Store refresh token if available
            if (response.data.message.refreshToken) {
                tokenManager.setRefreshToken(response.data.message.refreshToken);
            }
            
            // Store user data
            if (response.data.message.user) {
                localStorage.setItem('user', JSON.stringify(response.data.message.user));
            }
            
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Logout user and clear all tokens
     */
    async logout(): Promise<void> {
        try {
            const refreshToken = tokenManager.getRefreshToken();
            await apiClient.post('/authentication/logout', { refreshToken });
        } catch (error) {
            // Ignore logout errors — always clear local state
        } finally {
            tokenManager.clearTokens();
            localStorage.removeItem('user');
        }
    }

    /**
     * Refresh the access token using refresh token
     * @returns New access token
     */
    async refreshToken(): Promise<string> {
        // NOTE: Do NOT use apiClient here — it would trigger the 401 interceptor
        // and create an infinite loop. Use a plain axios call instead.
        const { default: axios } = await import('axios');
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
            tokenManager.clearTokens();
            throw new Error('No refresh token available');
        }

        try {
            const { default: config } = await import('../config/environment');
            const response = await axios.post<{ token: string }>(
                `${config.apiBaseUrl}/authentication/refresh-token`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            return response.data.token;
        } catch (error: any) {
            tokenManager.clearTokens();
            throw error;
        }
    }

    /**
     * Get current user from localStorage
     * @returns Current user or null
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    /**
     * Check if user is authenticated
     * @returns True if user has valid token
     */
    isAuthenticated(): boolean {
        const token = tokenManager.getToken();
        return !!token;
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
