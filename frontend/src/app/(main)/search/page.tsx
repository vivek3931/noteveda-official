'use client';

import React, { Suspense, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ResourceListItem } from '@/components/features';
import { resourcesService } from '@/lib';
import { SearchIcon, CloseIcon, FilterIcon, GridIcon, ClockIcon } from '@/components/icons';
import { useDebounce } from '@/hooks/useDebounce';
import { CATEGORY_CONFIG, ResourceCategory } from '@/types/resource-types';

// Constants
const RECENT_SEARCHES_KEY = 'noteveda_recent_searches';
const MAX_RECENT_SEARCHES = 8;

// Helper to manage recent searches in localStorage
function getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function addRecentSearch(query: string): void {
    if (!query.trim() || typeof window === 'undefined') return;
    try {
        const searches = getRecentSearches().filter(s => s.toLowerCase() !== query.toLowerCase());
        searches.unshift(query.trim());
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
    } catch {
        // Ignore localStorage errors
    }
}

function clearRecentSearches(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RECENT_SEARCHES_KEY);
}

/**
 * SearchPage - Production-grade search results page
 * 
 * Features:
 * - URL-synced search query (?q=...)
 * - Debounced search input
 * - Recent searches persistence
 * - Category quick filters
 * - Empty/loading/error states
 * - Keyboard navigation (Escape to clear)
 */
function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const inputRef = useRef<HTMLInputElement>(null);

    // Get query from URL
    const urlQuery = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') as ResourceCategory | null;

    // Local input state for controlled input
    const [inputValue, setInputValue] = useState(urlQuery);
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | ''>(urlCategory || '');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // Sync input with URL on navigation
    useEffect(() => {
        setInputValue(urlQuery);
    }, [urlQuery]);

    // Debounce the search query
    const debouncedQuery = useDebounce(inputValue, 300);

    // Update URL when debounced query changes
    useEffect(() => {
        if (debouncedQuery !== urlQuery) {
            const params = new URLSearchParams(searchParams.toString());
            if (debouncedQuery) {
                params.set('q', debouncedQuery);
            } else {
                params.delete('q');
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [debouncedQuery, urlQuery, searchParams, router, pathname]);

    // Handle category change
    const handleCategoryChange = useCallback((category: ResourceCategory | '') => {
        setSelectedCategory(category);
        const params = new URLSearchParams(searchParams.toString());
        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Handle search submission
    const handleSearch = useCallback((query: string) => {
        if (query.trim()) {
            addRecentSearch(query);
            setRecentSearches(getRecentSearches());
            setShowRecent(false);
        }
    }, []);

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setInputValue('');
            inputRef.current?.blur();
        } else if (e.key === 'Enter') {
            handleSearch(inputValue);
        }
    }, [inputValue, handleSearch]);

    // Clear input
    const handleClear = useCallback(() => {
        setInputValue('');
        inputRef.current?.focus();
    }, []);

    // Use recent search
    const handleUseRecent = useCallback((query: string) => {
        setInputValue(query);
        setShowRecent(false);
        handleSearch(query);
    }, [handleSearch]);

    // Clear recent searches
    const handleClearRecent = useCallback(() => {
        clearRecentSearches();
        setRecentSearches([]);
    }, []);

    // Build API query params
    const apiParams = useMemo(() => {
        const params: Record<string, string> = {};
        if (debouncedQuery) params.search = debouncedQuery;
        if (selectedCategory) params.category = selectedCategory;
        return params;
    }, [debouncedQuery, selectedCategory]);

    // Fetch search results
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ['search', apiParams],
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
        enabled: !!debouncedQuery, // Only fetch when there's a query
    });

    const resources = data?.pages.flatMap(page => page.items) || [];
    const totalResults = data?.pages[0]?.total || 0;
    const hasQuery = !!debouncedQuery.trim();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Search Header */}
                {/* Search Header */}
                <div className="pt-8 pb-6">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 text-left">
                        Search Resources
                    </h1>

                    {/* Search Input & Filters */}
                    <div className="relative flex gap-2 sm:gap-3">
                        <div className="relative flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus-within:border-black dark:focus-within:border-white focus-within:ring-4 focus-within:ring-black/5 dark:focus-within:ring-white/5 transition-all h-full">
                                <SearchIcon size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0 sm:w-[22px] sm:h-[22px]" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setShowRecent(true)}
                                    onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                                    placeholder="Search notes, guides..."
                                    className="flex-1 bg-transparent text-sm sm:text-lg text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0"
                                    autoComplete="off"
                                    autoFocus
                                />
                                {inputValue && (
                                    <button
                                        onClick={handleClear}
                                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                                        aria-label="Clear search"
                                    >
                                        <CloseIcon size={16} className="text-gray-400 dark:text-gray-500 sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                )}
                            </div>

                            {/* Recent Searches Dropdown */}
                            <AnimatePresence>
                                {showRecent && recentSearches.length > 0 && !inputValue && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-20 w-full mt-2 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg"
                                    >
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Recent Searches
                                            </span>
                                            <button
                                                onClick={handleClearRecent}
                                                className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        {recentSearches.map((search, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleUseRecent(search)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <ClockIcon size={16} className="text-gray-400" />
                                                <span className="truncate">{search}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative group shrink-0">
                            <button
                                className={`h-full px-4 sm:px-5 flex items-center gap-2 font-medium rounded-2xl border transition-all ${selectedCategory
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <FilterIcon size={20} className="sm:w-[20px] sm:h-[20px]" />
                                <span className="hidden sm:inline">{selectedCategory ? CATEGORY_CONFIG[selectedCategory]?.label : 'Filters'}</span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${!selectedCategory
                                            ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <GridIcon size={16} />
                                        All Categories
                                    </button>
                                    {(Object.keys(CATEGORY_CONFIG) as ResourceCategory[]).map((cat) => {
                                        const config = CATEGORY_CONFIG[cat];
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => handleCategoryChange(cat)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedCategory === cat
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span>{config.icon}</span>
                                                <span>{config.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="pb-8">
                    {/* Results Header */}
                    {hasQuery && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between mb-4"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isLoading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        Found <strong className="text-gray-900 dark:text-white">{totalResults.toLocaleString()}</strong> {totalResults === 1 ? 'result' : 'results'}
                                        {selectedCategory && (
                                            <> in <strong className="text-gray-900 dark:text-white">{CATEGORY_CONFIG[selectedCategory]?.label}</strong></>
                                        )}
                                    </>
                                )}
                            </p>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {isLoading && hasQuery && (
                        <div className="flex flex-col gap-4">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-3 md:gap-6 p-2.5 md:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse">
                                    {/* Image Skeleton */}
                                    <div className="w-20 sm:w-36 md:w-56 aspect-square sm:aspect-[4/3] md:aspect-[16/10] bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />

                                    {/* Content Skeleton */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5 md:py-1 min-w-0">
                                        <div className="space-y-1.5 md:space-y-3">
                                            <div className="h-2.5 md:h-4 w-12 md:w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                                            <div className="h-4 md:h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                                            <div className="h-3 md:h-4 w-full bg-gray-200 dark:bg-gray-800 rounded hidden sm:block" />
                                        </div>
                                        <div className="flex justify-between items-center mt-2 md:mt-4">
                                            <div className="h-3 md:h-4 w-24 md:w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                                            <div className="h-3 md:h-4 w-16 md:w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 px-8 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl text-center"
                        >
                            <div className="w-16 h-16 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <CloseIcon size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Search failed
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary"
                            >
                                Retry
                            </button>
                        </motion.div>
                    )}

                    {/* Empty Query State */}
                    {!hasQuery && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-20 h-20 mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <SearchIcon size={36} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                What are you looking for?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                Search for notes, guides, previous year questions, tutorials, and more across all categories.
                            </p>

                            {/* Popular Searches */}
                            <div className="mt-8">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                    Popular Searches
                                </p>
                                <TrendingSearches onSearch={handleUseRecent} />
                            </div>
                        </motion.div>
                    )}

                    {/* No Results State */}
                    {hasQuery && !isLoading && !isError && resources.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 px-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center"
                        >
                            <GridIcon size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No results for &ldquo;{debouncedQuery}&rdquo;
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                                Try different keywords, check your spelling, or remove category filters.
                            </p>
                            <div className="flex gap-3">
                                {selectedCategory && (
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className="btn btn-secondary"
                                    >
                                        Clear Category
                                    </button>
                                )}
                                <button
                                    onClick={handleClear}
                                    className="btn btn-primary"
                                >
                                    Clear Search
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Results Grid */}
                    {hasQuery && !isLoading && !isError && resources.length > 0 && (
                        <>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                }}
                                className="flex flex-col gap-4"
                            >
                                {resources.map((resource, i) => (
                                    <ResourceListItem key={resource.id} resource={resource} index={i} />
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
                                        {isFetchingNextPage ? 'Loading more...' : 'Load More Results'}
                                    </motion.button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

// Wrap with Suspense for useSearchParams
export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchPageContent />
        </Suspense>
    );
}

// Tiny component for fetching trending searches
function TrendingSearches({ onSearch }: { onSearch: (q: string) => void }) {
    const { data: trending = [] } = useQuery({
        queryKey: ['trendingSearches'],
        queryFn: () => resourcesService.getTrending(5).then(res =>
            res.map(r => r.subject || r.title).filter(Boolean).slice(0, 5)
        ).catch(() => []),
        staleTime: 5 * 60 * 1000
    });

    if (trending.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-2">
            {trending.map((term, i) => (
                <button
                    key={`${term}-${i}`}
                    onClick={() => onSearch(term)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full hover:border-gray-300 dark:hover:border-gray-600 hover:text-black dark:hover:text-white transition-all"
                >
                    {term}
                </button>
            ))}
        </div>
    );
}

const SearchPageSkeleton = () => (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-8 pb-6">
                <div className="h-8 w-48 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
                <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="flex justify-center gap-2 mt-5">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    </main>
);
