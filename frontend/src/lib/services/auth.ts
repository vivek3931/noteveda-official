// Auth API Service
import api, { setCsrfToken } from '../api';
import { User } from '@/types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
}

export const authService = {
    // Login user
    login: (credentials: LoginCredentials): Promise<AuthResponse> =>
        api.post<AuthResponse>('/auth/login', credentials),

    // Register new user
    register: (data: RegisterData): Promise<AuthResponse> =>
        api.post<AuthResponse>('/auth/register', data),

    // Get current user info
    getMe: (): Promise<User> =>
        api.get<User>('/auth/me'),

    // Refresh access token (Optional explicit call, usually handled by api.ts automatically)
    refreshToken: (): Promise<AuthResponse> =>
        api.post<AuthResponse>('/auth/refresh'),

    // Logout user
    logout: (): Promise<void> =>
        api.post<void>('/auth/logout'),

    // Get CSRF Token (Bootstrapping) — stores in memory for cross-origin fallback
    getCsrfToken: async (): Promise<{ csrfToken: string }> => {
        const result = await api.get<{ csrfToken: string }>('/auth/csrf');
        if (result.csrfToken) {
            setCsrfToken(result.csrfToken);
        }
        return result;
    },

    // Update profile
    updateProfile: (data: Partial<User>): Promise<User> =>
        api.patch<User>('/auth/profile', data),
};

export default authService;
