// src/main/src/services/AuthService.ts

import { apiClient, tokenManager } from '../utils/axios.config';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterOrganizationRequest } from '../models/Auth';
import { ServiceUrl } from '../models/ServiceUrls';

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
            const response = await apiClient.post<LoginResponse>(ServiceUrl.login(), credentials);

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
        try {
            const refreshToken = tokenManager.getRefreshToken();
            
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const response = await apiClient.post<{ token: string }>('/authentication/refresh-token', {
                refreshToken,
            });
            
            // Store the new token
            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }
            
            return response.data.token;
        } catch (error: any) {
            // Clear tokens if refresh fails
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
