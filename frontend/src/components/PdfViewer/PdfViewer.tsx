'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useVirtualScroll } from './useVirtualScroll';
import { usePDFEngineStore } from '@/lib/pdf-engine/PDFEngineStore';
import PdfPage from './PdfPage';
import InnerPdfToolbar from './InnerPdfToolbar';
import MobileBottomBar from './MobileBottomBar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface PdfMetadata {
    totalPages: number;
    dimensions: {
        width: number;
        height: number;
    };
}

interface PdfEngineViewerProps {
    resourceId: string;
    initialScale?: number;
    onLoadSuccess?: (totalPages: number) => void;
    fileUrl?: string;
    onExpandToggle?: () => void;
    onAskAI?: () => void;
    isExpanded?: boolean;
    showToolbar?: boolean;
}

export default function PdfEngineViewer({
    resourceId,
    initialScale = 1.0,
    onLoadSuccess,
}: PdfEngineViewerProps) {
    // ================= STATE =================
    const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
    const [scale, setScale] = useState(initialScale);
    const [error, setError] = useState<string | null>(null);
    const [isZooming, setIsZooming] = useState(false);
    const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

    // Refs for zoom stability
    const containerRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null); // New Root Ref for Fullscreen
    const zoomScrollTarget = useRef<number | null>(null);
    const prevScale = useRef(initialScale);

    // Toolbar Visibility (Mobile)
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);

    // Store
    const isFullscreen = usePDFEngineStore(s => s.isFullscreen);
    const setStoreFullscreen = usePDFEngineStore(s => s.setFullscreen);
    const resourceActions = usePDFEngineStore(s => s.resourceActions);

    // ================= FULLSCREEN =================
    useEffect(() => {
        const handleFullscreenChange = () => {
            setStoreFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [setStoreFullscreen]);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement && rootRef.current) {
                await rootRef.current.requestFullscreen();
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen failed:', err);
        }
    }, []);

    // ================= METADATA =================
    useEffect(() => {
        if (!resourceId) return;
        const fetchMetadata = async () => {
            try {
                const res = await fetch(`${API_BASE}/pdf/${resourceId}/meta`);
                if (!res.ok) throw new Error('Failed to load PDF');
                const data = await res.json();
                setMetadata(data);
                onLoadSuccess?.(data.totalPages);
            } catch (err) {
                console.error(err);
                setError('Could not load document.');
            }
        };
        fetchMetadata();
    }, [resourceId, onLoadSuccess]);

    // ================= LAYOUT =================
    // Responsive Page Gap
    const [pageGap, setPageGap] = useState(8);

    useEffect(() => {
        const updateGap = () => setPageGap(window.innerWidth < 768 ? 4 : 8);
        updateGap();
        window.addEventListener('resize', updateGap);
        return () => window.removeEventListener('resize', updateGap);
    }, []);

    const pageWidth = metadata ? metadata.dimensions.width * scale : 600;
    const pageHeight = metadata ? metadata.dimensions.height * scale : 800;

    // Use container-based scroll (not window) for proper containment
    const { virtualItems, totalContentHeight, scrollTop } = useVirtualScroll({
        totalItems: metadata?.totalPages || 0,
        itemHeight: pageHeight,
        containerHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
        padding: pageGap,
        useWindowScroll: false // Container-based scrolling
    }, containerRef.current);

    // ================= DYNAMIC SCALING =================
    const calculateOptimalScale = useCallback(() => {
        if (!containerRef.current || !metadata) return null;

        const containerWidth = containerRef.current.clientWidth;
        const isMobileOrTablet = containerWidth < 1024; // Treat < 1024px as needing fit-width

        if (isMobileOrTablet) {
            const padding = containerWidth < 768 ? 8 : 32; // Smaller padding on mobile
            const availableWidth = containerWidth - padding;
            return availableWidth / metadata.dimensions.width;
        }
        return null; // Keep default/current scale on desktop
    }, [metadata]);

    // Initial Scale & Resize Handler
    useEffect(() => {
        if (!metadata || !containerRef.current) return;

        const handleResize = () => {
            const optimal = calculateOptimalScale();
            if (optimal) {
                setScale(optimal);
            }
        };

        // Apply initial fit
        handleResize();

        // Debounced resize listener
        let timeoutId: NodeJS.Timeout;
        const onResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(timeoutId);
        };
    }, [metadata, calculateOptimalScale]);

    // ================= STABLE ZOOM (No Bouncing) =================
    const handleZoom = useCallback((newScale: number) => {
        const container = containerRef.current;
        if (!container || !metadata) return;

        const targetScale = Math.max(0.5, Math.min(4, newScale));
        if (targetScale === scale) return;

        // Capture current scroll position and viewport center
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const centerY = scrollTop + viewportHeight / 2;

        // Calculate the page-relative position
        const oldPageHeight = metadata.dimensions.height * scale;
        const newPageHeight = metadata.dimensions.height * targetScale;

        // Find which page and position within page
        const pageIndex = Math.floor(centerY / (oldPageHeight + pageGap));
        const positionInPage = (centerY - pageIndex * (oldPageHeight + pageGap)) / oldPageHeight;

        // Calculate new center position
        const newCenterY = pageIndex * (newPageHeight + pageGap) + positionInPage * newPageHeight;
        const newScrollTop = Math.max(0, newCenterY - viewportHeight / 2);

        // Store for synchronous restoration
        zoomScrollTarget.current = newScrollTop;
        prevScale.current = scale;
        setIsZooming(true);
        setScale(targetScale);
    }, [scale, metadata, pageGap]);

    // Synchronous scroll restoration after zoom
    useLayoutEffect(() => {
        if (zoomScrollTarget.current !== null && containerRef.current) {
            containerRef.current.scrollTop = zoomScrollTarget.current;
            zoomScrollTarget.current = null;

            // Small delay to allow render completion
            requestAnimationFrame(() => {
                setIsZooming(false);
            });
        }
    }, [scale]);

    const handleZoomIn = useCallback(() => handleZoom(scale + 0.25), [handleZoom, scale]);
    const handleZoomOut = useCallback(() => handleZoom(scale - 0.25), [handleZoom, scale]);

    // ================= PAGE NAV =================
    const currentPage = Math.min(
        metadata?.totalPages || 1,
        Math.max(1, Math.floor(scrollTop / (pageHeight + pageGap)) + 1)
    );

    const handlePageInput = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('page') as HTMLInputElement;
        const page = parseInt(input.value);
        if (page >= 1 && page <= (metadata?.totalPages || 1) && containerRef.current) {
            const top = (page - 1) * (pageHeight + pageGap);
            containerRef.current.scrollTo({ top, behavior: 'smooth' });
        }
    }, [metadata, pageHeight, pageGap]);

    // ================= SEARCH =================
    const executeSearch = useCallback(async () => {
        if (!resourceId || !searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`${API_BASE}/pdf/${resourceId}/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error('Search failed');
            const results = await res.json();
            setSearchResults(results);
            if (results.length > 0) {
                setCurrentMatchIndex(0);
                if (containerRef.current) {
                    containerRef.current.scrollTo({
                        top: (results[0].page - 1) * (pageHeight + pageGap),
                        behavior: 'smooth'
                    });
                }
            } else {
                setCurrentMatchIndex(-1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    }, [resourceId, searchQuery, pageHeight, pageGap]);

    const nextMatch = useCallback(() => {
        if (searchResults.length === 0) return;
        const next = (currentMatchIndex + 1) % searchResults.length;
        setCurrentMatchIndex(next);
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: (searchResults[next].page - 1) * (pageHeight + pageGap),
                behavior: 'smooth'
            });
        }
    }, [searchResults, currentMatchIndex, pageHeight, pageGap]);

    const prevMatch = useCallback(() => {
        if (searchResults.length === 0) return;
        const prev = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentMatchIndex(prev);
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: (searchResults[prev].page - 1) * (pageHeight + pageGap),
                behavior: 'smooth'
            });
        }
    }, [searchResults, currentMatchIndex, pageHeight, pageGap]);

    // ================= AUTO-HIDE TOOLBAR (Mobile) =================
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const currentScrollY = containerRef.current.scrollTop;
        const diff = currentScrollY - lastScrollY.current;

        // Only toggle if significant scroll
        if (Math.abs(diff) < 20) return;

        if (diff > 0 && currentScrollY > 100) {
            setIsToolbarVisible(false);
        } else if (diff < 0) {
            setIsToolbarVisible(true);
        }
        lastScrollY.current = currentScrollY;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // ================= RENDER =================
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{error}</p>
                <p className="text-sm text-gray-500">Resource ID: {resourceId || 'Not provided'}</p>
            </div>
        );
    }

    if (!metadata) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading document...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950">
            {/* ================= DESKTOP TOOLBAR (Sticky Top) ================= */}
            <div className="hidden md:block relative z-20">
                <InnerPdfToolbar
                    isMobile={false}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearchKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                    searchResults={searchResults}
                    currentMatchIndex={currentMatchIndex}
                    onPrevMatch={prevMatch}
                    onNextMatch={nextMatch}
                    isSearching={isSearching}
                    currentPage={currentPage}
                    totalPages={metadata.totalPages}
                    onPageInput={handlePageInput}
                    scale={scale}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    isZooming={isZooming}
                    onInfo={() => resourceActions?.onInfo?.()}
                    onAI={() => resourceActions?.onAI?.()}
                    onFullscreen={toggleFullscreen}
                />
            </div>

            {/* ================= VIEWPORT WRAPPER ================= */}
            <div className="flex-1 relative min-h-0 w-full">
                {/* SCROLL CONTAINER */}
                <div
                    ref={containerRef}
                    className="absolute inset-0 overflow-auto"
                    style={{
                        overflowAnchor: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {/* PDF PAGES */}
                    <div
                        style={{
                            height: totalContentHeight,
                            width: '100%',
                            position: 'relative',
                            contain: isZooming ? 'layout' : 'none'
                        }}
                    >
                        {virtualItems.map(({ index, offsetTop }) => (
                            <div
                                key={index}
                                className="absolute left-0 right-0 flex justify-center"
                                style={{
                                    transform: `translateY(${offsetTop}px)`,
                                    transition: isZooming ? 'none' : 'transform 0.1s ease-out'
                                }}
                            >
                                <PdfPage
                                    pageNumber={index + 1}
                                    resourceId={resourceId}
                                    width={pageWidth}
                                    height={pageHeight}
                                    scale={scale}
                                    isVisible={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= MOBILE FLOATING TOOLBAR ================= */}
                <div className="md:hidden">
                    <InnerPdfToolbar
                        isMobile={true}
                        isVisible={isToolbarVisible && !isMobileSearchActive}
                        isMobileSearchActive={isMobileSearchActive}
                        onToggleMobileSearch={() => setIsMobileSearchActive(true)}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearchKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        searchResults={searchResults}
                        currentMatchIndex={currentMatchIndex}
                        onPrevMatch={prevMatch}
                        onNextMatch={nextMatch}
                        isSearching={isSearching}
                        currentPage={currentPage}
                        totalPages={metadata.totalPages}
                        onPageInput={handlePageInput}
                        scale={scale}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        isZooming={isZooming}
                        onInfo={() => resourceActions?.onInfo?.()}
                        onAI={() => resourceActions?.onAI?.()}
                        onFullscreen={toggleFullscreen}
                    />
                </div>

                {/* ================= MOBILE BOTTOM BAR ================= */}
                <div className="md:hidden">
                    <MobileBottomBar
                        isSearchActive={isMobileSearchActive}
                        onCloseSearch={() => {
                            setIsMobileSearchActive(false);
                            setSearchQuery('');
                            setSearchResults([]);
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearchKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        onPrevMatch={prevMatch}
                        onNextMatch={nextMatch}
                        searchResultsCount={searchResults.length}
                        currentMatchIndex={currentMatchIndex}
                        onAskAI={() => resourceActions?.onAI?.()}
                        onInfo={() => resourceActions?.onInfo?.()}
                        onSave={() => console.log('Save not impl')}
                        onDownload={() => console.log('Download not impl')}
                    />
                </div>
            </div>
        </div>
    );
}
