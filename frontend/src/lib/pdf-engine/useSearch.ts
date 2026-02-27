/**
 * useSearch Hook
 * 
 * React hook for PDF search functionality.
 * Integrates with PDFEngineStore for search state.
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { usePDFEngineStore } from './PDFEngineStore';
import { searchPDF, SearchResult } from './PDFSearch';

export function useSearch() {
    const {
        searchQuery,
        searchResults,
        currentSearchIndex,
        setSearchQuery,
        setSearchResults,
        nextSearchResult,
        prevSearchResult,
        clearSearch,
        setCurrentPage,
    } = usePDFEngineStore();

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSearchingRef = useRef(false);

    // Watch for store changes to trigger search
    // This allows the Toolbar (or any component) to set the query, and this hook will execute the search
    useEffect(() => {
        const performSearch = async () => {
            // Clear existing timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Clear results if query is too short
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            // Debounce actual execution (even if store update is debounced, good for safety)
            searchTimeoutRef.current = setTimeout(async () => {
                if (isSearchingRef.current) return;
                isSearchingRef.current = true;

                try {
                    const results = await searchPDF(searchQuery);
                    setSearchResults(
                        results.map((r) => ({
                            page: r.page,
                            index: r.index,
                            transform: r.transform,
                            yRatio: r.yRatio // Ensure this is passed
                        }))
                    );

                    // Jump to first result IF we are not already on a page with results (optional, but good UX)
                    // Or better: valid feedback "0/5".
                    // Usually we don't auto-jump unless user hits Enter.
                    // But if continuous search, maybe we shouldn't jump?
                    // User said "continuously search... and arrow should work".
                    // Let's NOT auto-jump current page aggressively, but maybe ensure we have a valid index?
                    // actually logic: `setSearchResults` sets `currentSearchIndex: 0`.
                    // And `NoteVedaPDFViewer` has effect: "when currentSearchIndex changes... scroll".
                    // So it WILL jump to result 0 automatically on new search. This is desired.
                } catch (error) {
                    console.error('[useSearch] Search error:', error);
                    setSearchResults([]);
                } finally {
                    isSearchingRef.current = false;
                }
            }, 100); // Short debounce since toolbar handles the main delay
        };

        performSearch();

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, setSearchResults]); // Removed setCurrentPage dependency to avoid aggressive jumping logic inside effect if not needed

    // Manual search trigger (for UI calls if needed, though mostly they set store)
    const search = useCallback((query: string) => {
        setSearchQuery(query);
    }, [setSearchQuery]);

    // Navigate to next result
    const goToNextResult = useCallback(() => {
        nextSearchResult();
    }, [nextSearchResult]);

    // Navigate to previous result
    const goToPrevResult = useCallback(() => {
        prevSearchResult();
    }, [prevSearchResult]);

    // Clear search
    const clear = useCallback(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        clearSearch();
    }, [clearSearch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                // Dispatch custom event for toolbar to handle
                window.dispatchEvent(new CustomEvent('pdf-focus-search'));
            }

            // Escape to clear search
            if (e.key === 'Escape' && searchQuery) {
                clear();
            }

            // Enter to go to next result
            if (e.key === 'Enter' && searchResults.length > 0) {
                if (e.shiftKey) {
                    goToPrevResult();
                } else {
                    goToNextResult();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, searchResults.length, clear, goToNextResult, goToPrevResult]);

    return {
        query: searchQuery,
        results: searchResults,
        currentIndex: currentSearchIndex,
        resultCount: searchResults.length,
        hasResults: searchResults.length > 0,

        search,
        goToNextResult,
        goToPrevResult,
        clear,
    };
}
