/**
 * VirtualScroller Component - Robust Implementation
 * 
 * FIXES:
 * - Zoom Center Preservation implemented in useLayoutEffect
 * - overflow-anchor: none to prevent browser interference
 */

'use client';

import React, {
    useRef,
    useEffect,
    useLayoutEffect,
    useState,
    useCallback,
    memo,
    useImperativeHandle,
    forwardRef
} from 'react';
import PDFPageContainer from './PDFPageContainer';
import { usePDFEngineStore, type Highlight } from './PDFEngineStore';
import { PDFEngine } from './PDFEngine';
import { useScrollAnchoring } from './useScrollAnchoring';

interface VirtualScrollerProps {
    containerWidth: number;
    pageGap?: number;
    highlights?: Highlight[];
    onTextSelect?: (text: string, rect: DOMRect, pageNumber: number) => void;
    onLinkClick?: (dest: string | number, isExternal: boolean, pageNumber: number) => void;
    onHighlightClick?: (highlight: Highlight) => void;
    onPageChange?: (pageNumber: number) => void;
    className?: string;
    useWindowScroll?: boolean;
    isResizing?: boolean;
}

export interface VirtualScrollerRef {
    scrollToPage: (pageNumber: number, smooth?: boolean) => void;
    scrollToOffset: (pageNumber: number, offsetProportion: number) => void;
    getCurrentViewport: () => ViewportPosition;
    savePosition: () => void;
    restorePosition: () => void;
}

interface ViewportPosition {
    page: number;
    offsetInPage: number; // 0-1 ratio within the page
    scrollTop: number;
}

const BUFFER_PAGES = 3; // Increased buffer for smoother scrolling
const SCROLL_DEBOUNCE_MS = 50;

const VirtualScroller = memo(forwardRef<VirtualScrollerRef, VirtualScrollerProps>(function VirtualScroller({
    containerWidth,
    pageGap = 24,
    highlights = [],
    onTextSelect,
    onLinkClick,
    onHighlightClick,
    onPageChange,
    className = '',
    useWindowScroll = false,
    isResizing = false,
}, ref) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());

    const savedPositionRef = useRef<ViewportPosition | null>(null);
    const isTransitioningRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const didInitialScrollRef = useRef(false);
    const prevScaleRef = useRef(1);

    const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]));
    const [basePageDimensions, setBasePageDimensions] = useState({ width: 0, height: 0 });

    const {
        totalPages,
        currentPage,
        setCurrentPage,
        setScrollTop,
        setBaseScale,
        userScale,
        rotation,
    } = usePDFEngineStore();



    // ============================================
    // VIEWPORT POSITION
    // ============================================
    const getCurrentViewport = useCallback((): ViewportPosition => {
        const scaledPageHeight = basePageDimensions.height * userScale;
        if (!scaledPageHeight) {
            return { page: currentPage, offsetInPage: 0, scrollTop: 0 };
        }

        const scrollTop = useWindowScroll
            ? window.scrollY
            : (scrollContainerRef.current?.scrollTop || 0);

        const viewportHeight = useWindowScroll
            ? window.innerHeight
            : (scrollContainerRef.current?.clientHeight || 0);

        const viewportCenter = scrollTop + viewportHeight / 3;

        let foundPage = currentPage;
        let offsetInPage = 0;

        // Try precise DOM check
        let exactMatch = false;
        for (const [pageNum, element] of Array.from(pageRefsMap.current.entries())) {
            const rect = element.getBoundingClientRect();
            // Calculate absolute top
            const containerTop = useWindowScroll ? 0 : (scrollContainerRef.current?.getBoundingClientRect().top || 0);
            const absoluteTop = scrollTop + rect.top - containerTop;
            const absoluteBottom = absoluteTop + rect.height;

            if (viewportCenter >= absoluteTop && viewportCenter < absoluteBottom) {
                foundPage = pageNum;
                offsetInPage = (viewportCenter - absoluteTop) / rect.height;
                exactMatch = true;
                break;
            }
        }

        // Fallback calculation
        if (!exactMatch) {
            const assumedPageTop = (foundPage - 1) * (scaledPageHeight + pageGap) + pageGap;
            offsetInPage = Math.max(0, Math.min(1, (viewportCenter - assumedPageTop) / scaledPageHeight));
        }

        return { page: foundPage, offsetInPage, scrollTop };
    }, [basePageDimensions.height, userScale, currentPage, useWindowScroll, pageGap]);

    const savePosition = useCallback(() => {
        const pos = getCurrentViewport();
        savedPositionRef.current = pos;
    }, [getCurrentViewport]);

    const restorePosition = useCallback(() => {
        const saved = savedPositionRef.current;
        if (!saved || !basePageDimensions.height) return;

        isTransitioningRef.current = true;

        const scaledPageHeight = basePageDimensions.height * userScale;
        const pageWithGap = scaledPageHeight + pageGap;

        const pageTop = (saved.page - 1) * pageWithGap + pageGap;
        const offsetPixels = saved.offsetInPage * scaledPageHeight;

        const viewportHeight = useWindowScroll
            ? window.innerHeight
            : (scrollContainerRef.current?.clientHeight || 0);

        const targetScroll = Math.max(0, pageTop + offsetPixels - viewportHeight / 3);

        const target = useWindowScroll ? window : scrollContainerRef.current;
        target?.scrollTo({ top: targetScroll, behavior: 'instant' });

        requestAnimationFrame(() => {
            isTransitioningRef.current = false;
        });
    }, [basePageDimensions.height, userScale, pageGap, useWindowScroll]);

    const scrollToPage = useCallback((pageNumber: number, smooth = true) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        if (!basePageDimensions.height) return;

        isTransitioningRef.current = true;

        const scaledPageHeight = basePageDimensions.height * userScale;
        const pageTop = (pageNumber - 1) * (scaledPageHeight + pageGap) + pageGap;

        const target = useWindowScroll ? window : scrollContainerRef.current;
        target?.scrollTo({
            top: Math.max(0, pageTop),
            behavior: smooth ? 'smooth' : 'instant'
        });

        setTimeout(() => {
            isTransitioningRef.current = false;
        }, smooth ? 400 : 100);
    }, [totalPages, basePageDimensions.height, userScale, pageGap, useWindowScroll]);

    const scrollToOffset = useCallback((pageNumber: number, offsetProportion: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        if (!basePageDimensions.height) return;

        isTransitioningRef.current = true;

        const scaledPageHeight = basePageDimensions.height * userScale;
        const pageTop = (pageNumber - 1) * (scaledPageHeight + pageGap) + pageGap;
        // Add offset (centering logic: offset is top of item, substract viewport 1/3)
        const viewportHeight = useWindowScroll
            ? window.innerHeight
            : (scrollContainerRef.current?.clientHeight || 0);

        const pixelOffset = offsetProportion * scaledPageHeight;
        const targetScroll = Math.max(0, pageTop + pixelOffset - (viewportHeight * 0.4)); // Scroll to position, slightly above center

        const target = useWindowScroll ? window : scrollContainerRef.current;
        target?.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 400);
    }, [totalPages, basePageDimensions.height, userScale, pageGap, useWindowScroll]);

    // ============================================
    // RESIZE RESTORATION
    // ============================================
    // Reverted to Ratio-Based Anchoring as requested
    useScrollAnchoring(
        (useWindowScroll ? { current: typeof window !== 'undefined' ? document.documentElement : null } : scrollContainerRef) as React.RefObject<HTMLDivElement>,
        [basePageDimensions.height, totalPages, pageGap],
        isResizing
    );

    useImperativeHandle(ref, () => ({
        scrollToPage,
        scrollToOffset,
        getCurrentViewport,
        savePosition,
        restorePosition,
    }), [scrollToPage, scrollToOffset, getCurrentViewport, savePosition, restorePosition]);

    // ============================================
    // VISIBILITY OBSERVER
    // ============================================
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(
            (entries) => {
                setVisiblePages(prev => {
                    const next = new Set(prev);
                    entries.forEach(entry => {
                        const page = parseInt(entry.target.getAttribute('data-page-number') || '0');
                        if (page) entry.isIntersecting ? next.add(page) : next.delete(page);
                    });
                    // Ensure active pages
                    const current = usePDFEngineStore.getState().currentPage;
                    if (current) next.add(current);

                    // Add buffers
                    const pages = Array.from(next);
                    pages.forEach(p => {
                        for (let i = 1; i <= BUFFER_PAGES; i++) {
                            if (p - i > 0) next.add(p - i);
                            if (p + i <= totalPages) next.add(p + i);
                        }
                    });
                    return next;
                });
            },
            { root: useWindowScroll ? null : scrollContainerRef.current, rootMargin: '100% 0px' }
        );
        pageRefsMap.current.forEach(el => observerRef.current?.observe(el));
        return () => observerRef.current?.disconnect();
    }, [totalPages, useWindowScroll]);

    // Initialization
    useEffect(() => {
        const init = async () => {
            if (totalPages === 0 || containerWidth <= 0) return;
            const page = await PDFEngine.getPage(1);
            if (!page) return;
            const vp = page.getViewport({ scale: 1, rotation });
            const baseScale = containerWidth / vp.width;
            setBaseScale(baseScale);
            setBasePageDimensions({ width: containerWidth, height: vp.height * baseScale });
        };
        init();
    }, [totalPages, containerWidth, rotation, setBaseScale]);

    // Initial Scroll
    useEffect(() => {
        if (basePageDimensions.height > 0 && !didInitialScrollRef.current) {
            if (currentPage > 1) setTimeout(() => scrollToPage(currentPage, false), 100);
            didInitialScrollRef.current = true;
        }
    }, [basePageDimensions.height, currentPage]);

    const registerPageRef = useCallback((page: number, el: HTMLDivElement | null) => {
        if (el) {
            pageRefsMap.current.set(page, el);
            observerRef.current?.observe(el);
        } else {
            pageRefsMap.current.delete(page);
        }
    }, []);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (isTransitioningRef.current) return;
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                const vp = getCurrentViewport();
                if (vp.page !== currentPage && vp.page > 0) {
                    setCurrentPage(vp.page);
                    onPageChange?.(vp.page);
                }
                setScrollTop(vp.scrollTop);
            }, SCROLL_DEBOUNCE_MS);
        };
        const target = useWindowScroll ? window : scrollContainerRef.current;
        target?.addEventListener('scroll', handleScroll, { passive: true });
        return () => target?.removeEventListener('scroll', handleScroll);
    }, [useWindowScroll, currentPage, setCurrentPage, setScrollTop, getCurrentViewport]);

    const { width: baseWidth, height: baseHeight } = basePageDimensions;
    // Fallback to containerWidth * 1.414 (A4 ratio) if baseHeight is 0
    const fallbackHeight = containerWidth * 1.414;
    const effectiveBaseHeight = baseHeight || fallbackHeight || 800;
    const scaledHeight = effectiveBaseHeight * userScale;

    return (
        <div
            ref={scrollContainerRef}
            className={`pdf-virtual-scroller ${className}`}
            style={{
                overflowY: useWindowScroll ? 'visible' : 'auto',
                overflowX: 'auto', // Enable horizontal scroll when zoomed beyond width
                width: '100%',
                height: useWindowScroll ? 'auto' : '100%',
                transform: 'translateZ(0)',
                willChange: 'scroll-position',
                // prevent browser scroll anchoring from fighting our restore logic
                overflowAnchor: 'none',
            }}
        >
            <div className="flex flex-col w-full items-center px-2 md:px-4" style={{ paddingTop: pageGap, paddingBottom: pageGap + 60, gap: pageGap }}>
                {Array.from({ length: totalPages }, (_, i) => {
                    const p = i + 1;
                    const visible = visiblePages.has(p);
                    const pageWidth = (baseWidth || containerWidth) * userScale;
                    return (
                        <div
                            key={p}
                            ref={el => registerPageRef(p, el)}
                            data-page-number={p}
                            className="shrink-0 flex justify-center"
                            style={{
                                height: scaledHeight,
                                minWidth: '100%',
                                width: pageWidth > containerWidth ? pageWidth : '100%',
                                // Skip layout/paint for off-screen pages
                                contentVisibility: 'auto',
                                containIntrinsicSize: `auto ${pageWidth}px auto ${scaledHeight}px`,
                            } as React.CSSProperties}
                        >
                            {visible ? (
                                <PDFPageContainer
                                    pageNumber={p}
                                    baseWidth={baseWidth || containerWidth}
                                    userScale={userScale}
                                    isVisible={visible}
                                    highlights={highlights.filter(h => h.pageNumber === p)}
                                    onTextSelect={onTextSelect}
                                    onLinkClick={onLinkClick}
                                    onHighlightClick={onHighlightClick}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-sm shadow-lg" style={{ width: pageWidth, height: scaledHeight }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}));

export default VirtualScroller;
