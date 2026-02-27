/**
 * PdfPage Component - Google-Style Zoom (Server Images)
 * 
 * For server-rendered PDF images:
 * - Request image at: scale × devicePixelRatio (renderZoom)
 * - Display at: width × height (already zoomed)
 * - Double buffering for smooth zoom transitions
 */

import React, { useState, useEffect, useMemo } from 'react';
import TextLayer from './TextLayer';
import AnnotationLayer from '@/lib/pdf-engine/layers/AnnotationLayer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface PdfPageProps {
    pageNumber: number;
    resourceId: string;
    width: number;      // Display width (already includes zoom)
    height: number;     // Display height (already includes zoom)
    scale: number;      // User zoom (layoutZoom)
    isVisible: boolean;
}

const PdfPage = React.memo(({ pageNumber, resourceId, width, height, scale, isVisible }: PdfPageProps) => {
    // Double Buffering State for Smooth Zoom
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);
    const [prevSrc, setPrevSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    // Device pixel ratio for high-DPI rendering
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    // Render zoom = scale × DPR (for image request)
    const renderZoom = scale * dpr;

    // Debounced Image Fetching with DPR-aware scale
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            // Request image at renderZoom (scale × DPR) for crisp display
            const url = `${API_BASE}/pdf/${resourceId}/page/${pageNumber}?scale=${renderZoom}`;

            setCurrentSrc(current => {
                if (current !== url) {
                    setPrevSrc(current);
                    setLoading(true);
                    return url;
                }
                return current;
            });

            setError(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [pageNumber, resourceId, renderZoom, isVisible, retryKey]);

    const handleRetry = () => {
        setLoading(true);
        setError(false);
        setRetryKey(prev => prev + 1);
    };

    const handleImageLoad = () => {
        setLoading(false);
        setTimeout(() => setPrevSrc(null), 100);
    };

    // Base dimensions (before zoom) for text layer
    const baseWidth = width / scale;
    const baseHeight = height / scale;

    return (
        <div
            className="relative shadow-sm overflow-hidden select-none bg-white"
            style={{ width, height }}
        >
            {/* 1. SKELETON LOADING STATE */}
            {loading && !prevSrc && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-300 text-6xl font-bold opacity-20">
                        {pageNumber}
                    </div>
                </div>
            )}

            {/* 2. ERROR STATE */}
            {error && (
                <div className="absolute inset-0 z-20 bg-red-50 dark:bg-red-900/20 flex flex-col items-center justify-center gap-2">
                    <p className="text-red-500 font-medium">Failed to load page</p>
                    <button
                        onClick={handleRetry}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* 3. PREVIOUS IMAGE (double buffer during zoom) */}
            {prevSrc && (
                <img
                    src={prevSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 1 }}
                    draggable={false}
                    aria-hidden="true"
                />
            )}

            {/* 4. CURRENT IMAGE (crisp at renderZoom, displayed at display size) */}
            {currentSrc && !error && (
                <img
                    src={currentSrc}
                    alt={`Page ${pageNumber}`}
                    className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ zIndex: 2 }}
                    onLoad={handleImageLoad}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                    loading="lazy"
                    draggable={false}
                />
            )}

            {/* 5. TEXT LAYER (uses scale for positioning) */}
            <div className="absolute inset-0 z-[5]">
                <TextLayer
                    resourceId={resourceId}
                    pageNumber={pageNumber}
                    scale={scale}
                    containerWidth={baseWidth}
                    containerHeight={baseHeight}
                />
            </div>

            {/* 6. ANNOTATION LAYER (Server-rendered images do not have raw PDF page/viewport data here) */}
            {/* Annotation layer requires pdf.js page and viewport objects which we don't have in the image-based viewer */}
            {/* To support links, we would need to fetch annotation data separately from the server */}

            {/* Page Number */}
            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-mono pointer-events-none z-30 mix-blend-multiply dark:mix-blend-normal">
                {pageNumber}
            </div>
        </div>
    );
});

PdfPage.displayName = 'PdfPage';

export default PdfPage;
