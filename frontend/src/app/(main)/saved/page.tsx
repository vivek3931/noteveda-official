'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { ResourceCard } from '@/components/features';
import SwiperResourceCarousel from '@/components/SwiperResourceCarousel';
import { useSaved } from '@/contexts/SavedContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookmarkIcon } from '@/components/icons';

export default function SavedPage() {
    return <SavedPageContent />;
}

function SavedPageContent() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { savedResources, savedCount, isLoading: isSavedLoading } = useSaved();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthLoading, isAuthenticated, router]);

    // Show skeleton if auth is loading OR saved data is loading
    const showSkeleton = isAuthLoading || isSavedLoading;

    // If not authenticated and finished loading, show nothing (redirecting)
    if (!isAuthLoading && !isAuthenticated) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-0 transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div
                    className="mb-8"
                >
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Saved Resources
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {savedCount > 0
                            ? `You have ${savedCount} saved resource${savedCount !== 1 ? 's' : ''}`
                            : 'Resources you save will appear here'}
                    </p>
                </div>

                {/* Resources Grid or Empty State */}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                {showSkeleton ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : savedCount > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {savedResources.map((resource: any, i: number) => (
                            <ResourceCard key={resource.id} resource={resource} index={i} />
                        ))}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <BookmarkIcon size={36} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No saved resources yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                            When you find resources you like, click the bookmark icon to save them for later.
                        </p>
                        <motion.button
                            onClick={() => router.push('/browse')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            Browse Resources
                        </motion.button>
                    </div>
                )}
            </div>
        </main>
    );
}
