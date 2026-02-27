/**
 * NoteVeda PDF Engine
 * 
 * A singleton-like engine for managing PDF document lifecycle.
 * Note: "Singleton" here means ONE engine instance per active PDF document.
 * When a new PDF is loaded, the previous instance is cleaned up.
 * 
 * Features:
 * - Direct pdfjs-dist usage (no react-pdf wrapper)
 * - Page caching for performance
 * - Optional OffscreenCanvas support (auto-detected)
 * 
 * Error Handling:
 * - Password-protected PDFs: Returns error, UI should prompt for password
 * - Corrupt PDFs: Returns error, UI should show fallback (download link)
 * - Network errors: Returns error with retry suggestion
 * 
 * Accessibility (v1):
 * - Keyboard scrolling supported via container
 * - Screen reader support is basic (text layer provides content)
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

// Worker setup - use local worker file
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface PDFEngineOptions {
    cMapUrl?: string;
    cMapPacked?: boolean;
    enableOffscreenCanvas?: boolean; // Optional, defaults to false
}

export interface PageRenderOptions {
    scale: number;
    rotation: number;
    canvas: HTMLCanvasElement;
    signal?: AbortSignal; // For cancellation
}

export interface PDFEngineError {
    type: 'password' | 'corrupt' | 'network' | 'unknown';
    message: string;
    originalError?: Error;
}

class PDFEngineClass {
    private static instance: PDFEngineClass | null = null;

    private pdfDoc: PDFDocumentProxy | null = null;
    private pageCache: Map<number, PDFPageProxy> = new Map();
    private currentUrl: string | null = null;
    private activeRenderTasks: Map<number, RenderTask> = new Map();
    private options: PDFEngineOptions = {
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        enableOffscreenCanvas: false,
    };

    // Feature detection
    private supportsOffscreenCanvas: boolean = false;

    private constructor() {
        // Check OffscreenCanvas support
        if (typeof window !== 'undefined') {
            this.supportsOffscreenCanvas =
                typeof OffscreenCanvas !== 'undefined' &&
                typeof OffscreenCanvas.prototype.getContext === 'function';
        }
    }

    static getInstance(): PDFEngineClass {
        if (!PDFEngineClass.instance) {
            PDFEngineClass.instance = new PDFEngineClass();
        }
        return PDFEngineClass.instance;
    }

    /**
     * Check if OffscreenCanvas is available and enabled
     */
    canUseOffscreenCanvas(): boolean {
        return this.supportsOffscreenCanvas && (this.options.enableOffscreenCanvas ?? false);
    }

    /**
     * Load a PDF document
     * Returns the total page count on success
     */
    async loadDocument(
        url: string,
        options?: Partial<PDFEngineOptions>
    ): Promise<{ totalPages: number } | { error: PDFEngineError }> {
        // If same URL, return cached instance
        if (this.currentUrl === url && this.pdfDoc) {
            return { totalPages: this.pdfDoc.numPages };
        }

        // Cleanup previous document
        await this.destroy();

        // Merge options
        this.options = { ...this.options, ...options };

        try {
            const loadingTask = pdfjsLib.getDocument({
                url,
                cMapUrl: this.options.cMapUrl,
                cMapPacked: this.options.cMapPacked,
                // CRITICAL for text selection accuracy:
                // Load exact PDF standard font metrics (Helvetica, Times, Courier etc.)
                // Without this, PDF.js uses browser system fonts with different
                // character widths, causing text spans to shift left/right.
                standardFontDataUrl: '/standard_fonts/',
                // Force PDF.js to use its own font data, not system fonts
                useSystemFonts: false,
                // CSP compatibility — some font hinting uses eval()
                isEvalSupported: false,
            });

            this.pdfDoc = await loadingTask.promise;
            this.currentUrl = url;

            return { totalPages: this.pdfDoc.numPages };
        } catch (error) {
            const pdfError = this.classifyError(error);
            console.error('[PDFEngine] Load error:', pdfError);
            return { error: pdfError };
        }
    }

    /**
     * Get a specific page (cached)
     */
    async getPage(pageNumber: number): Promise<PDFPageProxy | null> {
        if (!this.pdfDoc) return null;

        if (pageNumber < 1 || pageNumber > this.pdfDoc.numPages) {
            console.warn(`[PDFEngine] Invalid page number: ${pageNumber}`);
            return null;
        }

        // Return cached page if available
        if (this.pageCache.has(pageNumber)) {
            return this.pageCache.get(pageNumber)!;
        }

        try {
            const page = await this.pdfDoc.getPage(pageNumber);
            this.pageCache.set(pageNumber, page);
            return page;
        } catch (error) {
            console.error(`[PDFEngine] Failed to get page ${pageNumber}:`, error);
            return null;
        }
    }

    /**
     * Render a page to canvas
     * Supports cancellation via AbortSignal
     */
    async renderPage(
        pageNumber: number,
        options: PageRenderOptions
    ): Promise<boolean> {
        const page = await this.getPage(pageNumber);
        if (!page) return false;

        // Cancel any existing render task for this page
        this.cancelRender(pageNumber);

        // Check if already aborted
        if (options.signal?.aborted) {
            return false;
        }

        try {
            const viewport = page.getViewport({
                scale: options.scale,
                rotation: options.rotation
            });

            const canvas = options.canvas;
            const context = canvas.getContext('2d');
            if (!context) return false;

            // High DPI support
            const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

            // Set canvas dimensions (scaled by DPR)
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);

            // Note: We do NOT set canvas.style.width/height here
            // The caller (layout layer) is responsible for setting CSS dimensions

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
            };

            const renderTask = page.render(renderContext);
            this.activeRenderTasks.set(pageNumber, renderTask);

            // Handle abort
            if (options.signal) {
                options.signal.addEventListener('abort', () => {
                    renderTask.cancel();
                });
            }

            await renderTask.promise;
            this.activeRenderTasks.delete(pageNumber);
            return true;
        } catch (error) {
            this.activeRenderTasks.delete(pageNumber);

            // Cancelled renders are not errors
            if ((error as Error)?.message?.includes('cancelled')) {
                return false;
            }

            console.error(`[PDFEngine] Render error page ${pageNumber}:`, error);
            return false;
        }
    }

    /**
     * Get text content for a page (for text layer & search)
     */
    async getTextContent(pageNumber: number) {
        const page = await this.getPage(pageNumber);
        if (!page) return null;

        try {
            return await page.getTextContent();
        } catch (error) {
            console.error(`[PDFEngine] Text content error page ${pageNumber}:`, error);
            return null;
        }
    }

    /**
     * Cancel render task for a specific page
     */
    cancelRender(pageNumber: number): void {
        const task = this.activeRenderTasks.get(pageNumber);
        if (task) {
            task.cancel();
            this.activeRenderTasks.delete(pageNumber);
        }
    }

    /**
     * Cancel all active render tasks
     */
    cancelAllRenders(): void {
        this.activeRenderTasks.forEach((task, pageNumber) => {
            task.cancel();
        });
        this.activeRenderTasks.clear();
    }

    /**
     * Get PDF document proxy (for advanced operations)
     */
    getDocument(): PDFDocumentProxy | null {
        return this.pdfDoc;
    }

    /**
     * Get current URL
     */
    getCurrentUrl(): string | null {
        return this.currentUrl;
    }

    /**
     * Get total pages
     */
    getTotalPages(): number {
        return this.pdfDoc?.numPages ?? 0;
    }

    /**
     * Clean up resources
     */
    async destroy(): Promise<void> {
        this.cancelAllRenders();
        this.pageCache.clear();

        if (this.pdfDoc) {
            await this.pdfDoc.destroy();
            this.pdfDoc = null;
        }

        this.currentUrl = null;
    }

    /**
     * Classify error type for better UI handling
     */
    private classifyError(error: unknown): PDFEngineError {
        const err = error as Error;
        const message = err?.message || 'Unknown error';

        if (message.includes('password')) {
            return { type: 'password', message: 'PDF requires a password', originalError: err };
        }

        if (message.includes('Invalid PDF') || message.includes('corrupt')) {
            return { type: 'corrupt', message: 'PDF file is corrupted or invalid', originalError: err };
        }

        if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
            return { type: 'network', message: 'Network error loading PDF', originalError: err };
        }

        return { type: 'unknown', message, originalError: err };
    }
}

// Export singleton instance
export const PDFEngine = PDFEngineClass.getInstance();

// Export class for testing
export { PDFEngineClass };
