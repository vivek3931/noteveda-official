'use client';

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/components/ui/Toast';
import { FeedbackProvider } from '@/components/ui/FeedbackModal';
import { SavedProvider } from '@/contexts/SavedContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Global Providers wrapper
 * Wraps the app with all necessary context providers
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ToastProvider>
                    <FeedbackProvider>
                        <SavedProvider>
                            <AuthProvider>
                                {children}
                            </AuthProvider>
                        </SavedProvider>
                    </FeedbackProvider>
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default Providers;
