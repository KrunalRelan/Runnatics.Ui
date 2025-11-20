// src/main/src/models/Auth.ts

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: {
        token: string;
        refreshToken: string;
        expiresAt: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            profileImageUrl: string;
            createdAt: string;
            lastLoginAt: string;
            isActive: boolean;
            tenantId: string;
            organizationName: string;
        };
        organization: {
            id: string;
            name: string;
            website: string;
            logoUrl: string;
            subscriptionPlan: string;
            createdAt: string;
            isActive: boolean;
            totalUsers: number;
            activeEvents: number;
        };
    };
  }

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImageUrl: string;
    createdAt: string;
    lastLoginAt: string;
    isActive: boolean;
    tenantId: string;
    organizationName: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}
