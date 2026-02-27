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
            } catch (error) {
                // If 401 or network error, assume logged out
                setUser(null);

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
        const response = await authService.login(credentials);
        setUser(response.user);
        // Navigation handled by the calling page
    };

    const register = async (data: RegisterData) => {
        const response = await authService.register(data);
        setUser(response.user);
        // Navigation handled by the calling page
    };

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
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
