/**
 * AnnotationLayer Component - Google-Style Links with Multi-Line Support
 * 
 * ARCHITECTURE:
 * 1. Links are PDF annotations (type: /Link)
 * 2. Each has a rect [x1, y1, x2, y2] for single-line links
 * 3. Multi-line links have quadPoints: arrays of 8 values per line segment
 * 4. Convert to viewport coords using convertToViewportRectangle/Point
 * 5. Create grouped highlight elements that all highlight on hover
 * 
 * QUADPOINTS FORMAT:
 * - Array of 8 values per quad: [x1,y1, x2,y2, x3,y3, x4,y4]
 * - Represents 4 corners of each text region (for multi-line links)
 * 
 * This ensures:
 * - Links are clickable at any zoom/rotation
 * - Multi-line links highlight all lines together on hover
 * - Text selection works through links when not clicking
 */

'use client';

import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { PDFEngine } from '../PDFEngine';
import { usePDFEngineStore } from '../PDFEngineStore';

interface AnnotationLayerProps {
    pageNumber: number;
    page: any; // PDFPageProxy
    viewport: any; // PageViewport
    isVisible: boolean;
    onLinkClick?: (dest: string | number, isExternal: boolean) => void;
}

interface LinkQuad {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface LinkAnnotation {
    rect: number[];
    quadPoints?: number[]; // Array of 8 values per quad segment
    url?: string;
    dest?: string | number[] | null;
    quads: LinkQuad[]; // Calculated viewport quads
}

const AnnotationLayer = memo(function AnnotationLayer({
    pageNumber,
    page,
    viewport,
    isVisible,
    onLinkClick,
}: AnnotationLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [links, setLinks] = useState<LinkAnnotation[]>([]);
    const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);

    const { setCurrentPage } = usePDFEngineStore();

    // Convert quadPoints to viewport rectangles
    const convertQuadPoints = useCallback((quadPoints: number[], viewport: any): LinkQuad[] => {
        const quads: LinkQuad[] = [];

        // Each quad has 8 values: 4 points × (x, y)
        // Points are in order: top-left, top-right, bottom-left, bottom-right (in PDF coords)
        for (let i = 0; i < quadPoints.length; i += 8) {
            const points = [];
            for (let j = 0; j < 8; j += 2) {
                const [vx, vy] = viewport.convertToViewportPoint(
                    quadPoints[i + j],
                    quadPoints[i + j + 1]
                );
                points.push({ x: vx, y: vy });
            }

            // Find bounding box of the 4 points
            const xs = points.map(p => p.x);
            const ys = points.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            quads.push({
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            });
        }

        return quads;
    }, []);

    // Convert single rect to viewport rectangle
    const convertRect = useCallback((rect: number[], viewport: any): LinkQuad => {
        const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle(rect);

        // Normalize for CSS (rotation can swap orders)
        const x = Math.min(vx1, vx2);
        const y = Math.min(vy1, vy2);
        const w = Math.abs(vx1 - vx2);
        const h = Math.abs(vy1 - vy2);

        return { x, y, width: w, height: h };
    }, []);

    // Extract annotations & Viewport
    useEffect(() => {
        if (!isVisible || !page || !viewport) return;

        const extractAnnotations = async () => {
            try {
                const annotations = await page.getAnnotations();
                const linkAnnotations: LinkAnnotation[] = annotations
                    .filter((ann: any) => ann.subtype === 'Link')
                    .map((ann: any) => {
                        // Calculate quads from quadPoints if available, otherwise from rect
                        let quads: LinkQuad[];
                        if (ann.quadPoints && ann.quadPoints.length >= 8) {
                            quads = convertQuadPoints(ann.quadPoints, viewport);
                        } else {
                            quads = [convertRect(ann.rect, viewport)];
                        }

                        return {
                            rect: ann.rect,
                            quadPoints: ann.quadPoints,
                            url: ann.url,
                            dest: ann.dest,
                            quads,
                        };
                    });

                setLinks(linkAnnotations);
            } catch (error) {
                console.error(`[AnnotationLayer] Error page ${pageNumber}:`, error);
            }
        };

        extractAnnotations();
    }, [pageNumber, page, viewport, isVisible, convertQuadPoints, convertRect]);

    // Handle link click
    const handleLinkClick = useCallback((link: LinkAnnotation, e: React.MouseEvent) => {
        // External links
        if (link.url) {
            if (onLinkClick) {
                e.preventDefault();
                onLinkClick(link.url, true);
            }
            // If no handler, let browser handle it
            return;
        }

        // Internal links (page jumps)
        e.preventDefault();
        e.stopPropagation();

        if (link.dest) {
            if (Array.isArray(link.dest) && typeof link.dest[0] === 'number') {
                const destPage = link.dest[0];
                if (onLinkClick) {
                    onLinkClick(destPage, false);
                } else {
                    setCurrentPage(destPage);
                    const pageElement = document.getElementById(`pdf-page-${destPage}`);
                    if (pageElement) {
                        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        }
    }, [onLinkClick, setCurrentPage]);

    if (links.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="pdf-annotation-layer"
            style={{
                position: 'absolute',
                inset: 0,
                width: viewport.width,
                height: viewport.height,
                pointerEvents: 'none',
                zIndex: 20,
            }}
        >
            {links.map((link, linkIndex) => (
                <div
                    key={linkIndex}
                    className="pdf-link-group"
                    onMouseEnter={() => setHoveredLinkIndex(linkIndex)}
                    onMouseLeave={() => setHoveredLinkIndex(null)}
                    style={{ pointerEvents: 'none' }}
                >
                    {link.quads.map((quad, quadIndex) => (
                        <a
                            key={`${linkIndex}-${quadIndex}`}
                            href={link.url || '#'}
                            target={link.url ? '_blank' : undefined}
                            rel={link.url ? 'noopener noreferrer' : undefined}
                            onClick={(e) => handleLinkClick(link, e)}
                            onMouseEnter={() => setHoveredLinkIndex(linkIndex)}
                            onMouseLeave={() => setHoveredLinkIndex(null)}
                            className={`pdf-link ${hoveredLinkIndex === linkIndex ? 'pdf-link-hovered' : ''}`}
                            style={{
                                position: 'absolute',
                                left: `${quad.x}px`,
                                top: `${quad.y}px`,
                                width: `${quad.width}px`,
                                height: `${quad.height}px`,
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                display: 'block',
                                backgroundColor: hoveredLinkIndex === linkIndex
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'transparent',
                                border: 'none',
                                outline: hoveredLinkIndex === linkIndex
                                    ? '2px solid rgba(59, 130, 246, 0.4)'
                                    : 'none',
                                outlineOffset: '-1px',
                                textDecoration: 'none',
                                borderRadius: '2px',
                                transition: 'background-color 0.15s ease, outline 0.15s ease',
                            }}
                            title={link.url || 'Go to page'}
                            aria-label={link.url ? `Link: ${link.url}` : 'Internal link'}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
});

export default AnnotationLayer;
