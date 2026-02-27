/**
 * CanvasLayer Component - Double Buffered for Smooth Zoom
 * 
 * Uses two superimposed canvases to prevent flickering during zoom/resize.
 * 1. Current visible canvas ("Front Buffer") holds the old image, stretched by CSS.
 * 2. Hidden canvas ("Back Buffer") renders the new high-res image.
 * 3. Once rendering finishes, we swap buffers.
 */

'use client';

import React, { useRef, useEffect, useState, memo } from 'react';
import { PDFEngine } from '../PDFEngine';
import { usePDFEngineStore } from '../PDFEngineStore';
import type { RenderTask } from 'pdfjs-dist';

interface CanvasLayerProps {
    page: any; // PDFPageProxy
    viewport: any; // PageViewport
    isVisible: boolean;
    onRenderComplete?: (canvas: HTMLCanvasElement) => void;
    onRenderError?: (error: Error) => void;
}

const CanvasLayer = memo(function CanvasLayer({
    page,
    viewport,
    isVisible,
    onRenderComplete,
    onRenderError,
}: CanvasLayerProps) {
    // Double buffers
    const canvasARef = useRef<HTMLCanvasElement>(null);
    const canvasBRef = useRef<HTMLCanvasElement>(null);
    const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');
    const activeBufferRef = useRef<'A' | 'B'>('A');

    const renderTaskRef = useRef<RenderTask | null>(null);
    const lastRenderKeyRef = useRef<string>('');

    // Cache key for this render
    // Use viewport properties to detect changes
    const cacheKey = `${viewport.width}-${viewport.height}-${viewport.scale}`;

    useEffect(() => {
        if (!isVisible || !page || !viewport) return;

        // Skip if already rendered
        if (lastRenderKeyRef.current === cacheKey) return;

        // Determine which buffer to render into (the inactive one)
        const targetBuffer = activeBufferRef.current === 'A' ? 'B' : 'A';
        const targetCanvas = targetBuffer === 'A' ? canvasARef.current : canvasBRef.current;

        if (!targetCanvas) return;

        let isCancelled = false;

        const renderPage = async () => {
            // Cancel previous render
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel(); } catch { }
                renderTaskRef.current = null;
            }

            try {
                // Cap DPR at 2 — DPR 3 creates 9x pixel canvases, wasting memory
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                // 1. Canvas memory size = viewport × DPR (high-res for Retina)
                targetCanvas.width = Math.round(viewport.width * dpr);
                targetCanvas.height = Math.round(viewport.height * dpr);

                // 2. CSS visual size = viewport (logical pixels)
                targetCanvas.style.width = `${viewport.width}px`;
                targetCanvas.style.height = `${viewport.height}px`;

                const ctx = targetCanvas.getContext('2d');
                if (!ctx) return;

                // 3. Scale context for DPR (renders at full resolution)
                ctx.scale(dpr, dpr);

                // Render
                const renderTask = page.render({
                    canvasContext: ctx,
                    viewport,
                });
                renderTaskRef.current = renderTask;

                await renderTask.promise;

                if (!isCancelled) {
                    lastRenderKeyRef.current = cacheKey;

                    // Swap buffers to show new content
                    activeBufferRef.current = targetBuffer;
                    setActiveBuffer(targetBuffer);

                    // Notify parent
                    onRenderComplete?.(targetCanvas);
                }
            } catch (error) {
                const err = error as { name?: string };
                if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
                    onRenderError?.(error as Error);
                }
            } finally {
                if (!isCancelled) renderTaskRef.current = null;
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel(); } catch { }
            }
        };
    }, [page, viewport, isVisible, cacheKey, onRenderComplete, onRenderError]);

    return (
        <>
            <canvas
                ref={canvasARef}
                className="absolute inset-0 block transition-opacity duration-200"
                style={{
                    width: viewport.width,
                    height: viewport.height,
                    zIndex: activeBuffer === 'A' ? 10 : 0,
                    opacity: activeBuffer === 'A' ? 1 : 0, // Fade mechanism
                }}
            />
            <canvas
                ref={canvasBRef}
                className="absolute inset-0 block transition-opacity duration-200"
                style={{
                    width: viewport.width,
                    height: viewport.height,
                    zIndex: activeBuffer === 'B' ? 10 : 0,
                    opacity: activeBuffer === 'B' ? 1 : 0, // Fade mechanism
                }}
            />
        </>
    );
});

export default CanvasLayer;
