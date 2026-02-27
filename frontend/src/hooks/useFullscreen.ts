import { useState, useEffect, RefObject, useCallback, useRef } from 'react';

export function useFullscreen(ref: RefObject<HTMLElement>) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const savedScrollPosition = useRef<{ scrollTop: number; windowScrollY: number }>({ scrollTop: 0, windowScrollY: 0 });

    // 1. Sync React state with Browser state (handles Esc key)
    useEffect(() => {
        const handleChange = () => {
            const nowFullscreen = document.fullscreenElement === ref.current;
            setIsFullscreen(nowFullscreen);

            // Restore scroll position after fullscreen change settles
            if (ref.current) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (nowFullscreen) {
                            // In fullscreen: restore scroll within the fixed container
                            ref.current!.scrollTop = savedScrollPosition.current.scrollTop;
                        } else {
                            // Exited fullscreen: restore window scroll
                            window.scrollTo(0, savedScrollPosition.current.windowScrollY);
                        }
                    });
                });
            }
        };

        document.addEventListener('fullscreenchange', handleChange);
        document.addEventListener('webkitfullscreenchange', handleChange); // Safari support
        document.addEventListener('mozfullscreenchange', handleChange);    // Firefox support

        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            document.removeEventListener('webkitfullscreenchange', handleChange);
            document.removeEventListener('mozfullscreenchange', handleChange);
        };
    }, [ref]);

    // 2. Toggle Function with scroll position preservation
    const toggleFullscreen = useCallback(async () => {
        if (!ref.current) return;

        // Save current scroll positions BEFORE toggling
        savedScrollPosition.current = {
            scrollTop: ref.current.scrollTop || 0,
            windowScrollY: window.scrollY || 0,
        };

        try {
            if (!document.fullscreenElement) {
                await ref.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Error toggling fullscreen:", err);
        }
    }, [ref]);

    return { isFullscreen, toggleFullscreen };
}

