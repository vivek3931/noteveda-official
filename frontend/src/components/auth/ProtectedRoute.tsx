'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // If still loading auth state, render children immediately (no blocking spinner)
    // The auth context loads from localStorage synchronously in the first render,
    // so isLoading is usually false after hydration

    // Only redirect if we're certain user is not authenticated (loading complete + not auth)
    React.useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (adminOnly && user?.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, adminOnly, router]);

    // During initial auth check or if authenticated, render children
    // This allows the page to show its own skeleton/loading state immediately
    if (isLoading) {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        // Redirect happening, show nothing
        return null;
    }

    if (adminOnly && user?.role !== 'ADMIN') {
        return null;
    }

    return <>{children}</>;
}
