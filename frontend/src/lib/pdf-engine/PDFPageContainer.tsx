/**
 * PDFPageContainer Component - Google-Style Zoom
 * 
 * ARCHITECTURE:
 * - NO CSS transform for zoom (causes blurriness)
 * - Explicit layoutZoom/renderZoom passed to children
 * - ZoomOverlay for smooth visual transitions
 * 
 * DIMENSION CALCULATION:
 * 1. Get PDF native dimensions from viewport at scale=1
 * 2. Calculate baseScale to fit baseWidth
 * 3. Display dimensions = native × baseScale × layoutZoom
 * 4. Canvas renders at display dimensions × DPR
 */

'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import CanvasLayer from './layers/CanvasLayer';
import TextLayer from './layers/TextLayer';
import AnnotationLayer from './layers/AnnotationLayer';
import HighlightLayer, { type Highlight } from './layers/HighlightLayer';
import ZoomOverlay from './layers/ZoomOverlay';
import { usePDFEngineStore } from './PDFEngineStore';
import { PDFEngine } from './PDFEngine';

interface PDFPageContainerProps {
    pageNumber: number;
    baseWidth: number;       // Container width to fit into (before zoom)
    userScale: number;       // User zoom level (1.0 = 100%)
    isVisible: boolean;
    highlights?: Highlight[];
    onTextSelect?: (text: string, rect: DOMRect, pageNumber: number, rects?: DOMRect[]) => void;
    onLinkClick?: (dest: string | number, isExternal: boolean, pageNumber: number) => void;
    onHighlightClick?: (highlight: Highlight) => void;
    className?: string;
}


const PDFPageContainer = memo(function PDFPageContainer({
    pageNumber,
    baseWidth,
    userScale,
    isVisible,
    highlights = [],
    onTextSelect,
    onLinkClick,
    onHighlightClick,
    className = '',
}: PDFPageContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<any>(null); // PDFPageProxy
    const [renderScale, setRenderScale] = useState(userScale);
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    // ============================================
    // 1. SMOOTH ZOOM LOGIC
    // ============================================
    useEffect(() => {
        if (userScale === renderScale) return;

        const timeout = setTimeout(() => {
            setRenderScale(userScale);
        }, 200);

        return () => clearTimeout(timeout);
    }, [userScale, renderScale]);

    // Data loading
    useEffect(() => {
        let active = true;
        const loadPage = async () => {
            try {
                const p = await PDFEngine.getPage(pageNumber);
                if (active) setPage(p);
            } catch (e) {
                console.error('Error loading page', pageNumber, e);
            }
        };
        if (isVisible) loadPage();
        return () => { active = false; };
    }, [pageNumber, isVisible]);

    const { rotation, searchQuery } = usePDFEngineStore();

    // ============================================
    // 2. UNIFIED VIEWPORT CALCULATION
    // ============================================
    const viewport = React.useMemo(() => {
        if (!page || !baseWidth) return null;

        // Calculate base scale relative to native dimensions
        // We need native width to determine "fit width" scale
        const nativeViewport = page.getViewport({ scale: 1, rotation });
        const baseScale = baseWidth / nativeViewport.width;

        // Final scale for rendering
        const combinedScale = baseScale * renderScale;

        return page.getViewport({ scale: combinedScale, rotation });
    }, [page, baseWidth, renderScale, rotation]);

    // Visual scaling factor (stretch while waiting for render)
    const visualScale = userScale / renderScale;
    const isZooming = Math.abs(visualScale - 1) > 0.001;

    // Callbacks
    const handleTextSelect = useCallback((text: string, rect: DOMRect, pageNum: number, rects?: DOMRect[]) => {
        onTextSelect?.(text, rect, pageNum, rects);
    }, [onTextSelect]);

    const handleLinkClick = useCallback((dest: string | number, isExternal: boolean) => {
        onLinkClick?.(dest, isExternal, pageNumber);
    }, [onLinkClick, pageNumber]);

    const handleHighlightClick = useCallback((highlight: Highlight) => {
        onHighlightClick?.(highlight);
    }, [onHighlightClick]);

    const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
        setIsCanvasReady(true);
    }, []);

    if (!viewport) {
        // Loading skeleton
        return (
            <div
                className={`relative bg-white dark:bg-gray-800 shadow-lg animate-pulse ${className}`}
                style={{
                    width: baseWidth ? baseWidth * userScale : '100%',
                    height: baseWidth ? baseWidth * 1.414 * userScale : 600,
                }}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            id={`pdf-page-${pageNumber}`}
            className={`relative bg-white shadow-lg overflow-hidden ${className}`}
            style={{
                // Outer container set to final visual size
                width: Math.round(viewport.width * visualScale),
                height: Math.round(viewport.height * visualScale),
            }}
            data-page-number={pageNumber}
            data-scale={userScale}
        >
            <div
                style={{
                    width: viewport.width,
                    height: viewport.height,
                    position: 'relative',
                    isolation: 'isolate',
                    // CRITICAL: Only apply CSS transform during zoom transitions.
                    // At rest (visualScale=1), NO transform → text stays in normal
                    // rendering flow with proper sub-pixel positioning.
                    // CSS scale(1) ≠ no transform — it forces a compositing layer
                    // that breaks sub-pixel text rendering, especially small text.
                    ...(isZooming ? {
                        transform: `scale(${visualScale})`,
                        transformOrigin: '0 0',
                        willChange: 'transform',
                    } : {}),
                }}
            >
                {/* Layer 1: Canvas (z-1) - Bottom layer */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    <CanvasLayer
                        page={page}
                        viewport={viewport}
                        isVisible={isVisible}
                        onRenderComplete={handleCanvasReady}
                    />
                </div>

                {/* Layer 2: Highlights (z-5) - Above canvas */}
                {isCanvasReady && highlights.length > 0 && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                        <HighlightLayer
                            pageNumber={pageNumber}
                            displayWidth={viewport.width}
                            displayHeight={viewport.height}
                            highlights={highlights}
                            onHighlightClick={handleHighlightClick}
                            isVisible={isVisible}
                        />
                    </div>
                )}

                {/* Layer 3: Text (z-10) - MUST be topmost interactive layer for selection */}
                {isCanvasReady && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                        <TextLayer
                            pageNumber={pageNumber}
                            page={page}
                            viewport={viewport}
                            isVisible={isVisible}
                            onTextSelect={handleTextSelect}
                            searchQuery={searchQuery}
                        />
                    </div>
                )}

                {/* Layer 4: Annotations */}
                {isCanvasReady && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
                        <AnnotationLayer
                            pageNumber={pageNumber}
                            page={page}
                            viewport={viewport}
                            isVisible={isVisible}
                            onLinkClick={handleLinkClick}
                        />
                    </div>
                )}
            </div>

            {/* Loading spinner */}
            {!isCanvasReady && isVisible && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 transition-opacity duration-300"
                    style={{ zIndex: 30 }}
                >
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

export default PDFPageContainer;