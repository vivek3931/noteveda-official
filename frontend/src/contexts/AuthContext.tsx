'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService, LoginCredentials, RegisterData } from '@/lib/services/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state via API
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Determine if we have a robust session via /auth/me
                // The api client handles 401s and refreshing automatically.
                // If this call succeeds, we are logged in.
                const currentUser = await authService.getMe();
                setUser(currentUser);
                // Ensure the frontend-domain cookie is set for middleware
                document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
            } catch (error) {
                // If 401 or network error, assume logged out
                setUser(null);
                // Clear the frontend-domain auth cookie
                document.cookie = 'is_authenticated=; Max-Age=0; path=/;';

                // Bootstrap CSRF token for guest users (Login needs it)
                try {
                    await authService.getCsrfToken();
                } catch (e) {
                    console.error('Failed to bootstrap CSRF token', e);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            // Set is_authenticated cookie on the frontend domain so Next.js middleware can read it.
            // The backend also sets this cookie, but it's on the backend's domain (cross-origin).
            document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
        } catch (error: any) {
            // If CSRF token is invalid/missing, re-fetch and retry once
            if (error?.message?.includes('CSRF')) {
                await authService.getCsrfToken();
                const response = await authService.login(credentials);
                setUser(response.user);
                document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
                return;
            }
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            setUser(response.user);
            // Set is_authenticated cookie on the frontend domain
            document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
        } catch (error: any) {
            if (error?.message?.includes('CSRF')) {
                await authService.getCsrfToken();
                const response = await authService.register(data);
                setUser(response.user);
                document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
                return;
            }
            throw error;
        }
    };

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            // Clear the frontend-domain auth cookie
            document.cookie = 'is_authenticated=; Max-Age=0; path=/;';
            router.push('/login');
            router.refresh();
        }
    }, [router]);

    const updateUser = (userData: User) => {
        setUser(userData);
        // api call to update profile should be separate
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
