import { useLayoutEffect, useRef, useEffect } from 'react';

/**
 * useScrollAnchoring
 * 
 * Maintains the user's relative scroll position (percentage) when the container
 * dimensions change (e.g. sidebar toggle, minimize/maximize).
 * 
 * FIX: "Resize Locking"
 * We listen to window resize events to detect layout instability.
 * During a resize (and shortly after), we PAUSE tracking the scroll ratio.
 * This prevents the browser's native behavior (resetting scroll to 0 on reflow)
 * from corrupting our saved position.
 */
export const useScrollAnchoring = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    dependencies: any[],
    externalIsResizing: boolean = false
) => {
    const ratioRef = useRef(0);
    const isRestoring = useRef(false);
    const internalIsResizing = useRef(false);
    const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

    // 1. Resize Locking: Detect chaos
    useEffect(() => {
        const handleResize = () => {
            internalIsResizing.current = true;

            // Clear timeout if exists
            if (resizeTimeout.current) clearTimeout(resizeTimeout.current);

            // Unlock after stability (500ms)
            resizeTimeout.current = setTimeout(() => {
                internalIsResizing.current = false;
            }, 500);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
        };
    }, []);

    // 2. Continuous Tracking: Keep ratio up to date (unless locked)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Initialize ratio if valid and currently 0
        if (ratioRef.current === 0 && el.scrollHeight - el.clientHeight > 0) {
            ratioRef.current = el.scrollTop / (el.scrollHeight - el.clientHeight);
        }

        const onScroll = () => {
            // IGNORE scroll events if:
            // - We are actively restoring position (isRestoring)
            // - The window is resizing (internalIsResizing)
            // - The parent container is resizing (externalIsResizing)
            if (isRestoring.current || internalIsResizing.current || externalIsResizing) return;

            // Calculate valid ratio
            const scrollableHeight = el.scrollHeight - el.clientHeight;
            if (scrollableHeight > 0) {
                ratioRef.current = el.scrollTop / scrollableHeight;
            }
        };

        // Use passive listener for performance
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [containerRef.current]);

    // 3. Restore on Layout Change
    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // If ratio is 0, we have nothing to restore (or user is at top)
        // But if we have a ratio, we must enforce it now.

        const scrollableHeight = el.scrollHeight - el.clientHeight;
        if (scrollableHeight <= 0) return;

        // Flag restoration to prevent loop/noise in scroll listener
        isRestoring.current = true;

        // Calculate target pixel position
        const targetScrollTop = ratioRef.current * scrollableHeight;

        // Check if we actually need to move (improving performance)
        if (Math.abs(el.scrollTop - targetScrollTop) > 5) {
            // Restore Position Instantly
            el.scrollTop = targetScrollTop;
        }

        // Disable flag after a moment
        requestAnimationFrame(() => {
            isRestoring.current = false;
        });

    }, dependencies);
};
