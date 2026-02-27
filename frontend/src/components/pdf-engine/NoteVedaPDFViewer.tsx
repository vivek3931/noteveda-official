/**
 * NoteVedaPDFViewer Component - Robust Implementation
 * 
 * FEATURES:
 * - Text selection with context menu (Summarize, Define, Explain, Highlight, Add Note)
 * - Highlight rendering and management
 * - Note editing popover
 * - Optimized Zustand selectors to prevent infinite loops
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { usePDFEngine } from '../../lib/pdf-engine/usePDFEngine';
import { usePDFEngineStore, type Highlight, type SelectionInfo, type HighlightRect } from '../../lib/pdf-engine/PDFEngineStore';
import { PDFEngine } from '../../lib/pdf-engine/PDFEngine';
import VirtualScroller, { VirtualScrollerRef } from '../../lib/pdf-engine/VirtualScroller';
import PDFToolbar from './PDFToolbar';
import PDFErrorBoundary from './PDFErrorBoundary';
import PDFSelectionMenu from './PDFSelectionMenu';
import NotePopover from './NotePopover';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useShallow } from 'zustand/react/shallow';
import { useSearch } from '../../lib/pdf-engine/useSearch';
import { PDFPageSkeleton } from '@/components/ui/Skeleton';

export interface NoteVedaPDFViewerProps {
    fileUrl: string;
    mode?: 'full' | 'preview';
    previewPageLimit?: number;
    onLoadSuccess?: (totalPages: number) => void;
    onLoadError?: (error: Error) => void;
    onPageChange?: (page: number) => void;
    onTextSelect?: (text: string, rect: DOMRect, page: number, rects?: DOMRect[]) => void;
    onExpandToggle?: () => void;
    onAskAI?: (action: 'summarize' | 'define' | 'explain', text: string) => void;
    onDownload?: () => void;
    isExpanded?: boolean;
    showToolbar?: boolean;
    className?: string;
    headerOffset?: number;
}

const NoteVedaPDFViewer = memo(function NoteVedaPDFViewer({
    fileUrl,
    mode = 'full',
    previewPageLimit = 10,
    onLoadSuccess,
    onLoadError,
    onPageChange,
    onTextSelect,
    onExpandToggle,
    onAskAI,
    onDownload,
    isExpanded = false,
    showToolbar = true,
    className = '',
    headerOffset = 64,
}: NoteVedaPDFViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<VirtualScrollerRef>(null);
    const [containerWidth, setContainerWidth] = useState(800);
    const [loadKey, setLoadKey] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mobileToolbarVisible, setMobileToolbarVisible] = useState(true);
    const lastScrollY = useRef(0);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Selection menu state
    const [selection, setSelection] = useState<SelectionInfo | null>(null);

    // Note popover state
    const [notePopover, setNotePopover] = useState<{
        isOpen: boolean;
        position: { x: number; y: number };
        highlight: Highlight | null;
        noteContent: string;
    }>({
        isOpen: false,
        position: { x: 0, y: 0 },
        highlight: null,
        noteContent: '',
    });

    const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef as React.RefObject<HTMLElement>);

    // Zustand store selectors
    const {
        isLoading, error, totalPages, currentPage,
        setStoreFullscreen, setMobileView, isMobileView,
        setCurrentPage, zoomIn, zoomOut, rotate,
        highlights, addHighlight, removeHighlight, updateHighlight,
        notes, addNote, updateNote, removeNote, getNoteForHighlight,
        resourceActions,
    } = usePDFEngineStore(useShallow(s => ({
        isLoading: s.isLoading,
        error: s.error,
        totalPages: s.totalPages,
        currentPage: s.currentPage,
        setStoreFullscreen: s.setFullscreen,
        setMobileView: s.setMobileView,
        isMobileView: s.isMobileView,
        setCurrentPage: s.setCurrentPage,
        zoomIn: s.zoomIn,
        zoomOut: s.zoomOut,
        rotate: s.rotate,
        highlights: s.highlights,
        addHighlight: s.addHighlight,
        removeHighlight: s.removeHighlight,
        updateHighlight: s.updateHighlight,
        notes: s.notes,
        addNote: s.addNote,
        updateNote: s.updateNote,
        removeNote: s.removeNote,
        getNoteForHighlight: s.getNoteForHighlight,
        resourceActions: s.resourceActions,
    })));

    useEffect(() => { setStoreFullscreen(isFullscreen); }, [isFullscreen, setStoreFullscreen]);

    usePDFEngine({
        url: fileUrl,
        onLoadSuccess: (pages) => onLoadSuccess?.(pages),
        onLoadError: (err) => onLoadError?.(new Error(err.message)),
    });

    // Activate search logic (connects store query to execution)
    useSearch();

    // ============================================
    // TEXT SELECTION HANDLERS
    // ============================================
    const handleTextSelect = useCallback((text: string, rect: DOMRect, pageNumber: number, rects?: DOMRect[]) => {
        if (!text.trim()) {
            setSelection(null);
            return;
        }

        // Store selection info
        const selectionInfo: SelectionInfo = {
            text: text.trim(),
            rect,
            pageNumber,
            rects: rects?.map(r => ({
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height
            }))
        };
        setSelection(selectionInfo);

        // Call parent callback if provided
        onTextSelect?.(text, rect, pageNumber, rects);
    }, [onTextSelect]);

    const handleDismissMenu = useCallback(() => {
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    }, []);

    // ============================================
    // AI ACTION HANDLERS
    // ============================================
    const handleSummarize = useCallback((text: string) => {
        if (resourceActions?.onAskAI) {
            resourceActions.onAskAI(`Summarize the following text:\n\n"${text}"`);
        } else {
            onAskAI?.('summarize', text);
        }
        handleDismissMenu();
    }, [onAskAI, resourceActions, handleDismissMenu]);

    const handleDefine = useCallback((text: string) => {
        if (resourceActions?.onAskAI) {
            resourceActions.onAskAI(`Define the following term/text:\n\n"${text}"`);
        } else {
            onAskAI?.('define', text);
        }
        handleDismissMenu();
    }, [onAskAI, resourceActions, handleDismissMenu]);

    const handleExplain = useCallback((text: string) => {
        if (resourceActions?.onAskAI) {
            resourceActions.onAskAI(`Explain the following text:\n\n"${text}"`);
        } else {
            onAskAI?.('explain', text);
        }
        handleDismissMenu();
    }, [onAskAI, resourceActions, handleDismissMenu]);

    // ============================================
    // HIGHLIGHT HANDLERS
    // ============================================
    const handleHighlight = useCallback(async (sel: SelectionInfo) => {
        // Get viewport dimensions from PDF.js for percentage calculation (not DOM!)
        const page = await PDFEngine.getPage(sel.pageNumber);
        if (!page) return;

        const { baseScale, userScale } = usePDFEngineStore.getState();
        const viewport = page.getViewport({ scale: baseScale * userScale });

        // Get page container for coordinate origin subtraction
        const pageContainer = document.getElementById(`pdf-page-${sel.pageNumber}`);
        const containerRect = pageContainer?.getBoundingClientRect();

        let pixelRects: Array<{ x: number; y: number; width: number; height: number }> = [];

        // 1. Prefer pre-calculated rects from TextLayer (accurate)
        if (sel.rects && sel.rects.length > 0) {
            pixelRects = sel.rects;
        }
        // 2. Fallback to calculating from browser selection
        else {
            const browserSelection = window.getSelection();
            if (browserSelection && browserSelection.rangeCount > 0) {
                const range = browserSelection.getRangeAt(0);
                const clientRects = range.getClientRects();

                for (let i = 0; i < clientRects.length; i++) {
                    const r = clientRects[i];
                    // Subtract container offset to get local coordinates
                    pixelRects.push({
                        x: r.left - (containerRect?.left || 0),
                        y: r.top - (containerRect?.top || 0),
                        width: r.width,
                        height: r.height,
                    });
                }
            }
        }

        // 3. Last fallback: use the main selection bounding box
        if (pixelRects.length === 0) {
            pixelRects.push({
                x: sel.rect.x,
                y: sel.rect.y,
                width: sel.rect.width,
                height: sel.rect.height,
            });
        }

        // Helper to get safe dimensions
        const cWidth = containerRect ? containerRect.width : viewport.width;
        const cHeight = containerRect ? containerRect.height : viewport.height;

        // Convert pixel rects to percentage rects using container dimensions
        const percentRects: HighlightRect[] = pixelRects.map(r => ({
            xPercent: (r.x / cWidth) * 100,
            yPercent: (r.y / cHeight) * 100,
            widthPercent: (r.width / cWidth) * 100,
            heightPercent: (r.height / cHeight) * 100,
        }));

        addHighlight({
            pageNumber: sel.pageNumber,
            text: sel.text,
            rects: percentRects,
            color: 'rgba(255, 255, 0, 0.4)',
            hasNote: false,
        });

        handleDismissMenu();
    }, [addHighlight, handleDismissMenu]);

    const handleAddNote = useCallback(async (sel: SelectionInfo) => {
        // Get viewport dimensions from PDF.js for percentage calculation
        const page = await PDFEngine.getPage(sel.pageNumber);
        if (!page) return;

        const { baseScale, userScale } = usePDFEngineStore.getState();
        const viewport = page.getViewport({ scale: baseScale * userScale });

        // Get page container for coordinate origin subtraction
        const pageContainer = document.getElementById(`pdf-page-${sel.pageNumber}`);
        const containerRect = pageContainer?.getBoundingClientRect();

        let pixelRects: Array<{ x: number; y: number; width: number; height: number }> = [];

        // 1. Prefer pre-calculated rects from TextLayer
        if (sel.rects && sel.rects.length > 0) {
            pixelRects = sel.rects;
        }
        // 2. Fallback
        else {
            const browserSelection = window.getSelection();
            if (browserSelection && browserSelection.rangeCount > 0) {
                const range = browserSelection.getRangeAt(0);
                const clientRects = range.getClientRects();

                for (let i = 0; i < clientRects.length; i++) {
                    const r = clientRects[i];
                    pixelRects.push({
                        x: r.left - (containerRect?.left || 0),
                        y: r.top - (containerRect?.top || 0),
                        width: r.width,
                        height: r.height,
                    });
                }
            }
        }

        if (pixelRects.length === 0) {
            pixelRects.push({
                x: sel.rect.x,
                y: sel.rect.y,
                width: sel.rect.width,
                height: sel.rect.height,
            });
        }

        // Helper to get safe dimensions
        const cWidth = containerRect ? containerRect.width : viewport.width;
        const cHeight = containerRect ? containerRect.height : viewport.height;

        // Convert pixel rects to percentage rects using container dimensions
        const percentRects: HighlightRect[] = pixelRects.map(r => ({
            xPercent: (r.x / cWidth) * 100,
            yPercent: (r.y / cHeight) * 100,
            widthPercent: (r.width / cWidth) * 100,
            heightPercent: (r.height / cHeight) * 100,
        }));

        // Create highlight with note flag
        const highlightId = addHighlight({
            pageNumber: sel.pageNumber,
            text: sel.text,
            rects: percentRects,
            color: 'rgba(139, 92, 246, 0.3)', // Purple for notes
            hasNote: true,
        });

        // Create empty note
        addNote(highlightId, '');

        // Open note popover (use selection pixel position for UI)
        setNotePopover({
            isOpen: true,
            position: {
                x: sel.rect.left + sel.rect.width / 2,
                y: sel.rect.bottom + 10,
            },
            highlight: {
                id: highlightId,
                pageNumber: sel.pageNumber,
                text: sel.text,
                rects: percentRects,
                color: 'rgba(139, 92, 246, 0.3)',
                hasNote: true,
                createdAt: new Date(),
            },
            noteContent: '',
        });

        handleDismissMenu();
    }, [addHighlight, addNote, handleDismissMenu]);

    const handleHighlightClick = useCallback(async (highlight: Highlight) => {
        const note = getNoteForHighlight(highlight.id);

        // For positioning the popover, we need to convert percentage back to pixels
        // This is a UI positioning operation, so we need the current viewport
        const page = await PDFEngine.getPage(highlight.pageNumber);
        if (!page) return;

        const { baseScale, userScale } = usePDFEngineStore.getState();
        const viewport = page.getViewport({ scale: baseScale * userScale });

        // Get page container position
        const pageContainer = document.getElementById(`pdf-page-${highlight.pageNumber}`);
        const containerRect = pageContainer?.getBoundingClientRect();

        // Convert first rect from percentage to pixels for popover positioning
        const rect = highlight.rects[0];
        const pixelX = (rect.xPercent / 100) * viewport.width + (containerRect?.left || 0);
        const pixelY = (rect.yPercent / 100) * viewport.height + (containerRect?.top || 0);
        const pixelWidth = (rect.widthPercent / 100) * viewport.width;
        const pixelHeight = (rect.heightPercent / 100) * viewport.height;

        setNotePopover({
            isOpen: true,
            position: {
                x: pixelX + pixelWidth / 2,
                y: pixelY + pixelHeight + 10,
            },
            highlight,
            noteContent: note?.content || '',
        });
    }, [getNoteForHighlight]);

    const handleSaveNote = useCallback((content: string) => {
        if (!notePopover.highlight) return;

        const note = getNoteForHighlight(notePopover.highlight.id);
        if (note) {
            updateNote(note.id, content);
        }
    }, [notePopover.highlight, getNoteForHighlight, updateNote]);

    const handleDeleteNote = useCallback(() => {
        if (!notePopover.highlight) return;

        const note = getNoteForHighlight(notePopover.highlight.id);
        if (note) {
            removeNote(note.id);
        }
        // Also remove the highlight
        removeHighlight(notePopover.highlight.id);
    }, [notePopover.highlight, getNoteForHighlight, removeNote, removeHighlight]);

    const handleCloseNotePopover = useCallback(() => {
        setNotePopover(prev => ({ ...prev, isOpen: false }));
    }, []);

    // ============================================
    // UTILITY HANDLERS
    // ============================================
    const handleCopy = useCallback((_text: string) => {
        // Copy is handled inside PDFSelectionMenu directly
    }, []);

    const handleDownload = useCallback(() => {
        onDownload?.();
        handleDismissMenu();
    }, [onDownload, handleDismissMenu]);

    // ============================================
    // LAYOUT HANDLERS
    // ============================================
    const handleToggleFullscreen = useCallback(async () => {
        setIsTransitioning(true);
        scrollerRef.current?.savePosition();
        await toggleFullscreen();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollerRef.current?.restorePosition();
                setTimeout(() => setIsTransitioning(false), 300);
            });
        });
    }, [toggleFullscreen]);

    // Container resize observer - tracks actual width changes for PDF rendering
    useEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver(() => {
            if (containerRef.current) {
                // Signal resize start
                setIsResizing(true);

                const w = containerRef.current.getBoundingClientRect().width || 800;
                setContainerWidth(Math.max(w, 320));

                // Debounce resize end
                if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
                resizeTimeoutRef.current = setTimeout(() => {
                    setIsResizing(false);
                }, 200);
            }
        });
        obs.observe(containerRef.current);
        return () => {
            obs.disconnect();
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setMobileView]);

    // Search state selectors
    const {
        searchResults,
        currentSearchIndex,
    } = usePDFEngineStore(useShallow(s => ({
        searchResults: s.searchResults,
        currentSearchIndex: s.currentSearchIndex,
    })));

    // Handle search navigation scrolling
    useEffect(() => {
        if (!searchResults || searchResults.length === 0) return;

        const result = searchResults[currentSearchIndex] as any; // Access extended properties
        if (result) {
            if (typeof result.yRatio === 'number') {
                scrollerRef.current?.scrollToOffset(result.page, result.yRatio);
            } else {
                scrollerRef.current?.scrollToPage(result.page);
            }
        }
    }, [currentSearchIndex, searchResults]);

    // Mobile toolbar visibility
    useEffect(() => {
        if (!isMobileView) {
            setMobileToolbarVisible(true);
            return;
        }
        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY.current;
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

            if (Math.abs(delta) > 10) {
                if (delta > 0 && currentY > 100) setMobileToolbarVisible(false);
                else setMobileToolbarVisible(true);
                lastScrollY.current = currentY;
            }
            hideTimeoutRef.current = setTimeout(() => setMobileToolbarVisible(true), 2000);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [isMobileView]);

    const handleTap = useCallback(() => {
        if (isMobileView) setMobileToolbarVisible(v => !v);
    }, [isMobileView]);

    // Listen for page-jump events from toolbar
    useEffect(() => {
        const handlePageJump = (e: Event) => {
            const page = (e as CustomEvent).detail?.page;
            if (page && scrollerRef.current) {
                scrollerRef.current.scrollToPage(page, true);
            }
        };
        window.addEventListener('pdf-scroll-to-page', handlePageJump);
        return () => window.removeEventListener('pdf-scroll-to-page', handlePageJump);
    }, []);

    // Keyboard support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) return;
            switch (e.key) {
                case 'ArrowLeft': case 'ArrowUp':
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                    break;
                case 'ArrowRight': case 'ArrowDown':
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    break;
                case '+': case '=': e.preventDefault(); zoomIn(); break;
                case '-': e.preventDefault(); zoomOut(); break;
                case 'Escape':
                    if (selection) handleDismissMenu();
                    else if (isFullscreen) handleToggleFullscreen();
                    break;
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [currentPage, totalPages, isFullscreen, selection, setCurrentPage, zoomIn, zoomOut, rotate, handleToggleFullscreen, handleDismissMenu]);

    const handleRetry = () => setLoadKey(k => k + 1);

    return (
        <PDFErrorBoundary fileUrl={fileUrl} onRetry={handleRetry}>
            <div
                key={loadKey}
                ref={containerRef}
                className={`
                    bg-gray-100 dark:bg-gray-900 w-full
                    ${className}
                    ${isFullscreen ? 'fixed inset-0 z-[9999] flex flex-col' : 'relative'}
                    ${isTransitioning ? 'pointer-events-none' : ''}
                `}
                style={{ transition: isTransitioning ? 'none' : 'background-color 0.2s ease' }}
                onClick={handleTap}
            >
                {/* Global styles */}
                <style jsx global>{`
                    .textLayer { user-select: text; pointer-events: auto; }
                    .textLayer :is(span, br) { cursor: text; }
                `}</style>

                {isLoading && (
                    <div className="flex-1 relative pb-10 pt-4 md:pt-8 px-1 md:px-4 min-h-[800px]">
                        <PDFPageSkeleton />
                    </div>
                )}

                {error && !isLoading && (
                    <div className="h-96 flex flex-col items-center justify-center text-red-500">
                        <p>{error}</p>
                        <button onClick={handleRetry} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !error && totalPages > 0 && (
                    <>
                        {showToolbar && (
                            <div
                                className={`
                                    fixed left-1/2 -translate-x-1/2 z-[100] pointer-events-none
                                    transition-all duration-300 ease-out
                                    bottom-20 md:bottom-8
                                `}
                            >
                                <div className="pointer-events-auto">
                                    <PDFToolbar
                                        isVisible={true}
                                        isFullscreen={isFullscreen}
                                        onToggleFullscreen={handleToggleFullscreen}
                                        isMobile={isMobileView}
                                    />
                                </div>
                            </div>
                        )}

                        <div
                            className={`w-full relative ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <VirtualScroller
                                ref={scrollerRef}
                                containerWidth={containerWidth}
                                highlights={highlights}
                                onTextSelect={handleTextSelect}
                                onHighlightClick={handleHighlightClick}
                                onPageChange={onPageChange}
                                useWindowScroll={!isFullscreen}
                                className={isFullscreen ? 'h-full' : ''}
                                isResizing={isResizing}
                            />
                        </div>

                        {/* Selection Menu */}
                        <PDFSelectionMenu
                            selection={selection}
                            containerRef={containerRef}
                            onSummarize={handleSummarize}
                            onDefine={handleDefine}
                            onExplain={handleExplain}
                            onHighlight={handleHighlight}
                            onAddNote={handleAddNote}
                            onCopy={handleCopy}
                            onDownload={handleDownload}
                            onDismiss={handleDismissMenu}
                        />

                        {/* Note Popover */}
                        <NotePopover
                            isOpen={notePopover.isOpen}
                            position={notePopover.position}
                            initialContent={notePopover.noteContent}
                            highlightText={notePopover.highlight?.text || ''}
                            onSave={handleSaveNote}
                            onDelete={handleDeleteNote}
                            onClose={handleCloseNotePopover}
                        />
                    </>
                )}
            </div>
        </PDFErrorBoundary>
    );
});

export default NoteVedaPDFViewer;
