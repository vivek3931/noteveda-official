'use client';

import React, { useMemo, useCallback, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceCard } from '@/components/features';
import { resourcesService } from '@/lib';
import { FilterSidebar } from '@/components/resources/FilterSidebar';
import { SearchIcon, FilterIcon, CloseIcon, GridIcon } from '@/components/icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { CATEGORY_CONFIG, ResourceCategory } from '@/types/resource-types';
import { sanitizeFilterParams } from '@/lib/validators/resource-validator';

/**
 * BrowsePage - Resource Browser with URL-Synced Filters
 * 
 * KEY FEATURES:
 * - URL is the source of truth for all filters
 * - Shareable links: mysite.com/browse?category=ACADEMIC&semester=Sem%205
 * - Defensive rendering: invalid params are ignored
 * - Dynamic category-specific filters
 */
function BrowsePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Scroll to top on initial mount (e.g. navigating from home page category cards)
    const hasScrolledRef = useRef(false);
    useEffect(() => {
        if (!hasScrolledRef.current) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
            hasScrolledRef.current = true;
        }
    }, []);

    // Parse and sanitize URL params using the validator
    const filters = useMemo(() => {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return sanitizeFilterParams(params);
    }, [searchParams]);

    // Debounce search for better UX
    const debouncedSearch = useDebounce(searchParams.get('search') || '', 300);

    // Update URL helper
    const updateURL = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Remove default sortBy from URL
        if (params.get('sortBy') === 'latest') {
            params.delete('sortBy');
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // Build query params for API
    const apiParams = useMemo(() => {
        const params: Record<string, string> = {};

        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.category) params.category = filters.category;
        if (filters.sortBy) params.sortBy = filters.sortBy;

        // Add category-specific params (already sanitized)
        if (filters.category === 'ACADEMIC') {
            if (filters.course) params.course = filters.course;
            if (filters.semester) params.semester = filters.semester;
            if (filters.subject) params.subject = filters.subject;
            if (filters.docType) params.docType = filters.docType;
        } else if (filters.category === 'ENTRANCE') {
            if (filters.exam) params.exam = filters.exam;
            if (filters.year) params.year = filters.year;
            if (filters.paperType) params.paperType = filters.paperType;
        } else if (filters.category === 'SKILL') {
            if (filters.topic) params.topic = filters.topic;
            if (filters.level) params.level = filters.level;
            if (filters.format) params.format = filters.format;
        }

        return params;
    }, [debouncedSearch, filters]);

    // Fetch resources
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['resources', apiParams],
        queryFn: ({ pageParam = 1 }) => resourcesService.getResources({
            page: pageParam,
            limit: 12,
            ...apiParams,
        }),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
            return undefined;
        },
        initialPageParam: 1,
    });

    const resources = data?.pages.flatMap(page => page.items) || [];
    const totalResources = data?.pages[0]?.total || 0;

    // Build active filter pills for display
    const activeFilters = useMemo(() => {
        const pills: { key: string; label: string }[] = [];

        if (filters.category) {
            pills.push({
                key: 'category',
                label: CATEGORY_CONFIG[filters.category as ResourceCategory]?.label || filters.category,
            });
        }
        if (filters.course) pills.push({ key: 'course', label: filters.course });
        if (filters.semester) pills.push({ key: 'semester', label: filters.semester });
        if (filters.docType) pills.push({ key: 'docType', label: filters.docType });
        if (filters.exam) pills.push({ key: 'exam', label: filters.exam });
        if (filters.year) pills.push({ key: 'year', label: filters.year });
        if (filters.paperType) pills.push({ key: 'paperType', label: filters.paperType.replace(' (Previous Year Questions)', '') });
        if (filters.topic) pills.push({ key: 'topic', label: filters.topic });
        if (filters.level) pills.push({ key: 'level', label: filters.level });
        if (filters.format) pills.push({ key: 'format', label: filters.format });

        return pills;
    }, [filters]);

    // Clear specific filter
    const clearFilter = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === 'category') {
            // Clear category and all category-specific filters
            ['category', 'course', 'semester', 'subject', 'docType', 'exam', 'year', 'paperType', 'topic', 'level', 'format'].forEach(k => params.delete(k));
        } else {
            params.delete(key);
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    // Mobile filter state
    const [showMobileFilters, setShowMobileFilters] = React.useState(false);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="py-10">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                        Browse Resources
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Discover {totalResources.toLocaleString()}+ study materials across all categories
                    </p>

                    {/* Search Bar */}
                    <div className="mt-6 flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus-within:border-black dark:focus-within:border-white focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/5 transition-all">
                        <SearchIcon size={20} className="text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            defaultValue={searchParams.get('search') || ''}
                            onChange={(e) => updateURL('search', e.target.value)}
                            placeholder="Search for notes, guides, PYQs, tutorials..."
                            className="flex-1 bg-transparent text-base text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            suppressHydrationWarning
                        />
                        {searchParams.get('search') && (
                            <button
                                onClick={() => updateURL('search', '')}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <CloseIcon size={16} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto pb-8">
                        <FilterSidebar />
                    </aside>

                    {/* Results */}
                    <div className="flex-1 min-w-0">
                        {/* Results Header */}
                        <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {totalResources} {totalResources === 1 ? 'result' : 'results'}
                            </span>

                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md"
                                    onClick={() => setShowMobileFilters(true)}
                                >
                                    <FilterIcon size={18} />
                                    Filters
                                    {activeFilters.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-black dark:bg-white text-white dark:text-black rounded-full">
                                            {activeFilters.length}
                                        </span>
                                    )}
                                </motion.button>

                                <select
                                    value={filters.sortBy || 'latest'}
                                    onChange={(e) => updateURL('sortBy', e.target.value)}
                                    className="px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md appearance-none cursor-pointer"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="relevant">Most Relevant</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters Pills */}
                        <AnimatePresence>
                            {activeFilters.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap gap-2 mb-4"
                                >
                                    {activeFilters.map((filter) => (
                                        <span
                                            key={filter.key}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full"
                                        >
                                            {filter.label}
                                            <button
                                                onClick={() => clearFilter(filter.key)}
                                                className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                <CloseIcon size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors px-2"
                                    >
                                        Clear all
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Resource Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array(12).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse">
                                        <div className="aspect-[3/4]" />
                                    </div>
                                ))}
                            </div>
                        ) : resources.length > 0 ? (
                            <>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                    }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                                >
                                    {resources.map((resource, i) => (
                                        <ResourceCard key={resource.id} resource={resource} index={i} />
                                    ))}
                                </motion.div>

                                {/* Load More */}
                                {hasNextPage && (
                                    <div className="mt-8 text-center">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16 px-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center"
                            >
                                <GridIcon size={48} className="text-gray-300 dark:text-gray-700" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                                    No resources found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Try adjusting your filters or search query
                                </p>
                                <button onClick={clearAllFilters} className="btn btn-secondary">
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowMobileFilters(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-gray-950 rounded-t-2xl z-50 flex flex-col"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)}>
                                    <CloseIcon size={24} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <FilterSidebar />
                            </div>
                            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={clearAllFilters} className="flex-1 btn btn-secondary">
                                    Clear All
                                </button>
                                <button onClick={() => setShowMobileFilters(false)} className="flex-1 btn btn-primary">
                                    Show {totalResources} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}

// Wrap with Suspense for useSearchParams
export default function BrowsePage() {
    return (
        <Suspense fallback={<BrowsePageSkeleton />}>
            <BrowsePageContent />
        </Suspense>
    );
}

// Loading skeleton
function BrowsePageSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="py-10">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-5 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-8">
                    <aside className="hidden lg:block w-72">
                        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    </aside>
                    <div className="flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse aspect-[3/4]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
