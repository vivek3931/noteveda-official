/**
 * usePDFEngine Hook
 * 
 * React hook for interacting with the PDF Engine.
 * Handles document loading, cleanup, and provides render methods.
 * 
 * TWO-LAYER SCALING:
 * - Uses renderScale (baseScale × userScale) for rendering operations
 * - baseScale is auto-fit scale, userScale is user zoom
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { PDFEngine, PDFEngineError } from './PDFEngine';
import { usePDFEngineStore } from './PDFEngineStore';

interface UsePDFEngineOptions {
    url: string | null;
    onLoadSuccess?: (totalPages: number) => void;
    onLoadError?: (error: PDFEngineError) => void;
}

export function usePDFEngine({ url, onLoadSuccess, onLoadError }: UsePDFEngineOptions) {
    const {
        setLoading,
        setError,
        onDocumentLoad,
        currentPage,
        baseScale,
        userScale,
        rotation,
        getRenderScale,
    } = usePDFEngineStore();

    const isLoadingRef = useRef(false);
    const currentUrlRef = useRef<string | null>(null);

    // Load document when URL changes
    useEffect(() => {
        if (!url) {
            return;
        }

        // Prevent duplicate loads
        if (currentUrlRef.current === url || isLoadingRef.current) {
            return;
        }

        const loadDocument = async () => {
            isLoadingRef.current = true;
            currentUrlRef.current = url;
            setLoading(true);
            setError(null);

            const result = await PDFEngine.loadDocument(url);

            if ('error' in result) {
                setLoading(false);
                setError(result.error.message);
                onLoadError?.(result.error);
            } else {
                onDocumentLoad(url, result.totalPages);
                onLoadSuccess?.(result.totalPages);
            }

            isLoadingRef.current = false;
        };

        loadDocument();
    }, [url, setLoading, setError, onDocumentLoad, onLoadSuccess, onLoadError]);

    // Cleanup on unmount (only destroy if component is truly unmounting)
    useEffect(() => {
        return () => {
            // Don't destroy on every unmount - the engine persists
            // Only cancel active renders
            PDFEngine.cancelAllRenders();
        };
    }, []);

    // Render page to canvas (uses renderScale = baseScale × userScale)
    const renderPage = useCallback(async (
        pageNumber: number,
        canvas: HTMLCanvasElement,
        options?: { signal?: AbortSignal }
    ): Promise<boolean> => {
        const renderScale = getRenderScale();
        return PDFEngine.renderPage(pageNumber, {
            scale: renderScale,
            rotation,
            canvas,
            signal: options?.signal,
        });
    }, [getRenderScale, rotation]);

    // Get text content for a page
    const getTextContent = useCallback(async (pageNumber: number) => {
        return PDFEngine.getTextContent(pageNumber);
    }, []);

    // Cancel render for a page
    const cancelRender = useCallback((pageNumber: number) => {
        PDFEngine.cancelRender(pageNumber);
    }, []);

    // Get page viewport dimensions (at renderScale)
    const getPageViewport = useCallback(async (pageNumber: number) => {
        const page = await PDFEngine.getPage(pageNumber);
        if (!page) return null;

        const renderScale = getRenderScale();
        return page.getViewport({ scale: renderScale, rotation });
    }, [getRenderScale, rotation]);

    return {
        // State from store
        currentPage,
        baseScale,
        userScale,
        rotation,

        // Methods
        renderPage,
        getTextContent,
        cancelRender,
        getPageViewport,

        // Direct engine access (for advanced use)
        engine: PDFEngine,
    };
}

/**
 * Hook for viewport dimension calculations
 * Uses renderScale (baseScale × userScale) for dimensions
 */
export function usePageDimensions(pageNumber: number) {
    const { getRenderScale, rotation } = usePDFEngineStore();
    const dimensionsRef = useRef<{ width: number; height: number } | null>(null);

    const getDimensions = useCallback(async () => {
        const page = await PDFEngine.getPage(pageNumber);
        if (!page) return null;

        const renderScale = getRenderScale();
        const viewport = page.getViewport({ scale: renderScale, rotation });
        dimensionsRef.current = { width: viewport.width, height: viewport.height };
        return dimensionsRef.current;
    }, [pageNumber, getRenderScale, rotation]);

    return { getDimensions, cachedDimensions: dimensionsRef.current };
}
