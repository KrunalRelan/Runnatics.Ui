// src/main/src/models/Auth.ts

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken?: string;
    user: User;
    expiresIn?: number;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    permissions?: string[];
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
