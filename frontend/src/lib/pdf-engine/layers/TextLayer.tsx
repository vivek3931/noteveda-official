/**
 * TextLayer Component - Native PDF.js Text Rendering
 * 
 * Uses PDF.js native renderTextLayer() for pixel-perfect alignment.
 * The same engine generates both canvas and text layer = zero drift.
 */

'use client';

import React, { useRef, useEffect, memo, useState } from 'react';
import { PDFEngine } from '../PDFEngine';
import { usePDFEngineStore } from '../PDFEngineStore';
import { renderTextLayer } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css'; // CRITICAL: Required for text layer positioning

interface TextLayerProps {
    pageNumber: number;
    page: any; // PDFPageProxy
    viewport: any; // PageViewport
    isVisible: boolean;
    onTextSelect?: (text: string, rect: DOMRect, pageNumber: number, rects?: DOMRect[]) => void;
    searchQuery?: string;
}

const TextLayer = memo(function TextLayer({
    pageNumber,
    page,
    viewport,
    isVisible,
    onTextSelect,
    searchQuery,
}: TextLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textLayerTaskRef = useRef<{ cancel: () => void } | null>(null);
    const renderParamsRef = useRef('');

    // Ensure we have a viewport to work with
    if (!viewport) return null;

    const currentParams = `${pageNumber}-${viewport.scale}-${viewport.rotation}`;

    // ============================================
    // RENDER TEXT LAYER - Native PDF.js
    // ============================================
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isVisible || !page || !viewport) return;

        // Skip if already rendered with same params
        if (renderParamsRef.current === currentParams) return;

        const renderText = async () => {
            try {
                const textContent = await page.getTextContent({
                    // Preserve raw PDF font metrics — normalization can shift
                    // glyph widths, causing drift especially on small text
                    disableNormalization: true,
                    includeMarkedContent: true,
                });

                // Cancel previous render task
                if (textLayerTaskRef.current) {
                    textLayerTaskRef.current.cancel();
                    textLayerTaskRef.current = null;
                }

                // Clear container
                container.innerHTML = '';

                // Use native PDF.js text layer renderer
                const textLayerResult = renderTextLayer({
                    container,
                    textContentSource: textContent,
                    viewport,
                });

                if (textLayerResult) {
                    await textLayerResult.promise;
                }
                renderParamsRef.current = currentParams;

            } catch (e) {
                // Ignore cancellation errors
                if ((e as Error)?.message?.includes('cancel')) return;
                console.error('TextLayer render error:', e);
            }
        };

        renderText();

        return () => {
            if (textLayerTaskRef.current) {
                textLayerTaskRef.current.cancel();
            }
        };
    }, [pageNumber, page, viewport, isVisible, currentParams]);

    // ============================================
    // SELECTION HANDLER
    // ============================================
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !onTextSelect) return;

        const handleUp = () => {
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel || sel.isCollapsed || !container.contains(sel.anchorNode)) return;

                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const cRect = container.getBoundingClientRect();

                // Relative rect within container (subtract container offset)
                const relRect = new DOMRect(
                    rect.left - cRect.left,
                    rect.top - cRect.top,
                    rect.width,
                    rect.height
                );

                // Calculate accurate rects for each line
                const clientRects = range.getClientRects();
                const relRects: DOMRect[] = [];

                for (let i = 0; i < clientRects.length; i++) {
                    const r = clientRects[i];
                    if (r.width === 0 || r.height === 0) continue;

                    relRects.push(new DOMRect(
                        r.left - cRect.left,
                        r.top - cRect.top,
                        r.width,
                        r.height
                    ));
                }

                const selectedText = sel.toString().trim();

                // Ignore whitespace-only selections (spaces between words)
                if (!selectedText || selectedText.length === 0) return;

                onTextSelect(selectedText, relRect, pageNumber, relRects);
            }, 10);
        };

        container.addEventListener('mouseup', handleUp);
        container.addEventListener('touchend', handleUp);
        return () => {
            container.removeEventListener('mouseup', handleUp);
            container.removeEventListener('touchend', handleUp);
        };
    }, [onTextSelect, pageNumber]);

    // ============================================
    // SEARCH HIGHLIGHTING
    // ============================================
    useEffect(() => {
        if (!searchQuery || !isVisible) return;
        const container = containerRef.current;
        if (!container) return;

        // Clear old highlights
        const old = container.querySelectorAll('.pdf-search-highlight');
        old.forEach(o => o.remove());

        const spans = container.querySelectorAll('span');
        const q = searchQuery.toLowerCase();

        spans.forEach(span => {
            const txt = (span.textContent || '').toLowerCase();
            const idx = txt.indexOf(q);
            if (idx >= 0) {
                try {
                    const range = document.createRange();
                    const textNode = span.firstChild;
                    if (textNode) {
                        range.setStart(textNode, idx);
                        range.setEnd(textNode, Math.min(idx + q.length, txt.length));
                        const rects = range.getClientRects();
                        const cRect = container.getBoundingClientRect();

                        for (const r of rects) {
                            const div = document.createElement('div');
                            div.className = 'pdf-search-highlight';
                            div.style.cssText = `
                                position: absolute;
                                left: ${r.left - cRect.left}px;
                                top: ${r.top - cRect.top}px;
                                width: ${r.width}px;
                                height: ${r.height}px;
                                background: rgba(255, 255, 0, 0.4);
                                pointer-events: none;
                                border-radius: 2px;
                                z-index: 1;
                            `;
                            container.appendChild(div);
                        }
                    }
                } catch { /* ignore range errors */ }
            }
        });
    }, [searchQuery, isVisible]);

    return (
        <div
            ref={containerRef}
            className="textLayer"
            style={{
                // ONLY set what PDF.js CSS needs and doesn't provide:
                // 1. --scale-factor drives font-size calculations in PDF.js
                '--scale-factor': viewport.scale,
                // 2. Enable text selection (PDF.js CSS doesn't set these)
                userSelect: 'text',
                WebkitUserSelect: 'text',
                pointerEvents: 'auto',
                // Everything else (inset, overflow, line-height, transform-origin,
                // color:transparent on spans, ::selection) comes from
                // pdfjs-dist/web/pdf_viewer.css — DO NOT override them.
            } as React.CSSProperties}
        />
    );
});

export default TextLayer;