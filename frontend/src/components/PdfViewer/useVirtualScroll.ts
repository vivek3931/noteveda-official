import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// Configuration for virtualization
const OVERSCAN = 2; // Number of buffer pages above/below viewport

export interface VirtualScrollOptions {
    totalItems: number;
    itemHeight: number; // Fixed height per page (derived from metadata * scale)
    containerHeight: number;
    padding?: number; // Gap between pages
    useWindowScroll?: boolean;
}

interface VirtualItem {
    index: number;
    offsetTop: number;
}

export function useVirtualScroll(
    options: VirtualScrollOptions,
    scrollContainer: HTMLElement | null
) {
    const { totalItems, itemHeight, padding = 16, useWindowScroll = false } = options;
    const [scrollTop, setScrollTop] = useState(0);

    // Calculate total scrollable height
    // Total height = (PageHeight + Gap) * Count
    const totalContentHeight = (itemHeight + padding) * totalItems;

    // Optimized Scroll Handler (Throttled via RequestAnimationFrame)
    useEffect(() => {
        let rafId: number;

        const handleScroll = () => {
            // Use requestAnimationFrame for 60FPS scroll reading
            rafId = requestAnimationFrame(() => {
                if (useWindowScroll) {
                    setScrollTop(window.scrollY);
                } else if (scrollContainer) {
                    setScrollTop(scrollContainer.scrollTop);
                }
            });
        };

        if (useWindowScroll) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            // Initial check
            handleScroll();
        } else if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (useWindowScroll) {
                window.removeEventListener('scroll', handleScroll);
            } else if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
            cancelAnimationFrame(rafId);
        };
    }, [scrollContainer, options.containerHeight, useWindowScroll]);

    // Derive visible items based on current scrollTop
    const virtualItems = useMemo(() => {
        if (totalItems === 0) return [];

        // Height of one item unit (page + gap)
        const itemUnitHeight = itemHeight + padding;

        const visibleChunkHeight = useWindowScroll
            ? (typeof window !== 'undefined' ? window.innerHeight : 800)
            : (options.containerHeight || 800);

        // Calculate start and end indices
        const rangeStart = Math.floor(scrollTop / itemUnitHeight);
        const rangeEnd = Math.floor((scrollTop + visibleChunkHeight) / itemUnitHeight);

        // Apply Overscan (Buffer)
        const startIndex = Math.max(0, rangeStart - OVERSCAN);
        const endIndex = Math.min(totalItems - 1, rangeEnd + OVERSCAN);

        const items: VirtualItem[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
            items.push({
                index: i,
                // Gap only between pages, not at the start
                offsetTop: i * itemUnitHeight,
            });
        }

        return items;
    }, [scrollTop, totalItems, itemHeight, options.containerHeight, padding, useWindowScroll]);

    return {
        virtualItems,
        totalContentHeight,
        scrollTop,
    };
}
